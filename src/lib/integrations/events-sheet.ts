import type { CalendarEvent } from "@/lib/calendar";

/**
 * The crew's event spreadsheet — the single source of truth for what the
 * site says we're doing. Read-only here: the crew edits it in Sheets, the
 * site just reports it.
 *
 * TWO ways in, preferred in this order:
 *
 *  1. The Site Content Apps Script, tab "MAIN LIST". Preferred because
 *     the `/exec` URL is a secret. Publish-to-web is not — it makes the
 *     whole tab readable by anyone with the link, and that tab carries
 *     Fee and Net Sales columns. Revenue is not something to hand out
 *     for the sake of a calendar.
 *  2. EVENTS_SHEET_CSV_URL, a published CSV, for when the events live in
 *     a different workbook from the site content.
 *
 * Setup: "Events Sheet Setup.md" in the Lumanai Business folder.
 */

const URL = process.env.EVENTS_SHEET_CSV_URL;

export function eventsSheetConfigured(): boolean {
  return Boolean(URL) || Boolean(process.env.CONTENT_SHEET_WEBHOOK_URL);
}

/** Split one CSV line, honouring quoted cells. */
function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const truthy = (v: string) => /^(true|yes|y|1|x)$/i.test(v.trim());

/**
 * The sheet writes dates as M/D with no year ("8/15"). Resolve against
 * the current year, and roll forward if it's far enough in the past that
 * it's obviously next year's entry — otherwise every January the whole
 * calendar would silently point at dates that already happened.
 */
export function resolveSheetDate(raw: string, now = new Date()): string | null {
  const s = raw.trim();
  if (!s) return null;

  let y: number, mo: number, d: number;
  const full = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const md = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);

  if (full) {
    [, y, mo, d] = full.map(Number) as unknown as [never, number, number, number];
  } else if (md) {
    mo = Number(md[1]);
    d = Number(md[2]);
    if (md[3]) {
      y = Number(md[3]);
      if (y < 100) y += 2000;
    } else {
      y = now.getFullYear();
      const guess = new Date(y, mo - 1, d);
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      if (guess < sixtyDaysAgo) y += 1;
    }
  } else return null;

  if (!mo || !d || mo > 12 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * "BAR" in the volume column means a private booking; everything else is
 * a public appearance we want people to turn up to.
 */
function kindFor(volume: string, name: string): CalendarEvent["kind"] {
  if (/^bar$/i.test(volume.trim())) return "bar";
  if (/market|dts/i.test(name)) return "market";
  return "special";
}

/** Names in the sheet are shorthand; spell them out for customers. */
const EXPAND: Record<string, string> = {
  dts: "Downtown Summerlin Farmers Market",
};
function displayName(raw: string): string {
  return EXPAND[raw.trim().toLowerCase()] ?? raw.trim();
}

export async function readEventsSheet(): Promise<CalendarEvent[]> {
  // The webhook first — see the note at the top of this file on why a
  // published CSV is the fallback and not the default.
  if (process.env.CONTENT_SHEET_WEBHOOK_URL) {
    try {
      const { readMainListRows } = await import("@/lib/integrations/content-sheet");
      return parseEventRows(await readMainListRows());
    } catch (err) {
      console.error("[events-sheet] MAIN LIST unreadable:", err);
      // Fall through to the CSV if one is configured.
    }
  }

  if (!URL) return [];
  let text: string;
  try {
    const res = await fetch(URL, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    text = await res.text();
  } catch (err) {
    console.error("[events-sheet] unreachable:", err);
    return [];
  }

  return parseEventRows(text.split(/\r?\n/).map(splitCsv));
}

/** Shared by both sources: find the header row, then read by column name. */
export function parseEventRows(rows: string[][]): CalendarEvent[] {
  const header = rows.findIndex((r) =>
    r.some((c) => /^date$/i.test(c)) && r.some((c) => /^event$/i.test(c)),
  );
  if (header === -1) {
    console.error("[events-sheet] no Date/Event header row found");
    return [];
  }
  const cols = rows[header].map((c) => c.toLowerCase());
  const at = (r: string[], name: string) => {
    const i = cols.indexOf(name);
    return i === -1 ? "" : (r[i] ?? "");
  };

  const out: CalendarEvent[] = [];
  for (const r of rows.slice(header + 1)) {
    const name = at(r, "event");
    const date = resolveSheetDate(at(r, "date"));
    // The checklist block further down the sheet has no dates — that's
    // where the parse naturally stops.
    if (!name || !date) continue;

    /**
     * Only ACCEPTED events go public. "Applied" means we asked; a market
     * we've applied to but not been accepted for must never appear on
     * the site, or we advertise a booth we don't have.
     */
    if (!truthy(at(r, "accepted"))) continue;

    out.push({
      date,
      title: displayName(name),
      time: at(r, "time") || undefined,
      location: at(r, "place") || undefined,
      kind: kindFor(at(r, "anticipated volume"), name),
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
