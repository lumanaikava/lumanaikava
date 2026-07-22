import type { CalendarEvent } from "@/lib/calendar";

/**
 * Google Calendar → website sync.
 *
 * Add or edit an event in the lumanai.events@gmail.com Google Calendar
 * (phone or desktop) and it appears on the site within the hour — no
 * code edits, no redeploy. The site reads the calendar's *secret iCal
 * address*, which stays in .env.local:
 *
 *   Google Calendar → Settings → (your calendar) → Integrate calendar →
 *   "Secret address in iCal format" → copy → GOOGLE_CALENDAR_ICS_URL
 *
 * Rules of the road:
 * - Recurring events (the weekly residencies) are SKIPPED here — the
 *   site already generates those in src/lib/calendar.ts.
 * - An event titled with "private" anywhere (e.g. "Smith wedding —
 *   private") shows as "Private bar — booked" with no location.
 * - Everything else shows as a public special appearance with its
 *   location and time.
 */

const ICS_URL = process.env.GOOGLE_CALENDAR_ICS_URL;

export function gcalConfigured(): boolean {
  return Boolean(ICS_URL);
}

/* ── ICS parsing ───────────────────────────────────────────── */

type RawEvent = Record<string, { params: string; value: string }>;

/** Unfold RFC 5545 folded lines (continuations start with space/tab). */
function unfold(ics: string): string[] {
  const out: string[] = [];
  for (const line of ics.split(/\r?\n/)) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function unescapeText(v: string): string {
  return v
    .replace(/\\n/gi, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function parseEvents(ics: string): RawEvent[] {
  const events: RawEvent[] = [];
  let current: RawEvent | null = null;
  for (const line of unfold(ics)) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const [keyPart, value] = [line.slice(0, colon), line.slice(colon + 1)];
    const semi = keyPart.indexOf(";");
    const key = (semi === -1 ? keyPart : keyPart.slice(0, semi)).toUpperCase();
    const params = semi === -1 ? "" : keyPart.slice(semi + 1);
    current[key] = { params, value };
  }
  return events;
}

/** "20260807T170000" (wall time) or "20260807" → parts. */
function parseIcsStamp(
  raw: string,
  params: string,
): { date: string; hour?: number; minute?: number } | null {
  // UTC stamps get converted to Vegas wall time first.
  if (/^\d{8}T\d{6}Z$/.test(raw)) {
    const iso = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T${raw.slice(9, 11)}:${raw.slice(11, 13)}:${raw.slice(13, 15)}Z`;
    const d = new Date(iso);
    const vegas = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const get = (t: string) => vegas.find((p) => p.type === t)?.value ?? "";
    return {
      date: `${get("year")}-${get("month")}-${get("day")}`,
      hour: Number(get("hour")),
      minute: Number(get("minute")),
    };
  }
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, da, h, mi] = m;
  if (params.includes("VALUE=DATE") || h === undefined) {
    return { date: `${y}-${mo}-${da}` };
  }
  // TZID stamps are already wall time for their zone (all events are Vegas).
  return { date: `${y}-${mo}-${da}`, hour: Number(h), minute: Number(mi) };
}

function clockLabel(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "am" : "pm";
  return minute ? `${h12}:${String(minute).padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
}

/** "5pm" / "5–11pm" / "9am–2pm" from start + optional end. */
function timeLabel(
  start: { hour?: number; minute?: number },
  end?: { hour?: number; minute?: number } | null,
): string | undefined {
  if (start.hour === undefined) return undefined;
  const s = clockLabel(start.hour, start.minute ?? 0);
  if (end?.hour === undefined) return s;
  const e = clockLabel(end.hour, end.minute ?? 0);
  // Drop a duplicated meridiem: "5pm–11pm" reads better as "5–11pm".
  const sMer = s.slice(-2);
  const eMer = e.slice(-2);
  return sMer === eMer ? `${s.slice(0, -2)}–${e}` : `${s}–${e}`;
}

/* ── Public API ────────────────────────────────────────────── */

/**
 * One-off events from the Google Calendar. Empty array when the ICS URL
 * isn't configured or the fetch fails — callers always merge safely.
 * Pass { fresh: true } (admin page) to bypass the hourly cache.
 */
export async function googleCalendarEvents(opts?: {
  fresh?: boolean;
}): Promise<CalendarEvent[]> {
  if (!ICS_URL) return [];
  try {
    const res = await fetch(
      ICS_URL,
      opts?.fresh
        ? { cache: "no-store" }
        : { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const out: CalendarEvent[] = [];
    for (const ev of parseEvents(await res.text())) {
      if (ev.RRULE) continue; // residencies are generated in calendar.ts
      if (ev.STATUS?.value === "CANCELLED") continue;
      const start = ev.DTSTART
        ? parseIcsStamp(ev.DTSTART.value, ev.DTSTART.params)
        : null;
      if (!start) continue;
      const end = ev.DTEND
        ? parseIcsStamp(ev.DTEND.value, ev.DTEND.params)
        : null;
      const title = unescapeText(ev.SUMMARY?.value ?? "").trim();
      if (!title) continue;
      const isPrivate = /\bprivate\b/i.test(title);
      out.push({
        date: start.date,
        title: isPrivate
          ? title.replace(/\s*[—–-]?\s*\bprivate\b\s*/i, " ").trim()
          : title,
        location: isPrivate
          ? undefined
          : unescapeText(ev.LOCATION?.value ?? "").trim() || undefined,
        time: isPrivate ? undefined : timeLabel(start, end),
        kind: isPrivate ? "bar" : "special",
      });
    }
    return out;
  } catch {
    return [];
  }
}
