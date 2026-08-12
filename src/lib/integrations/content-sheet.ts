import {
  eventToValues,
  valuesToEvent,
  faqToValues,
  valuesToFaq,
  storyToValues,
  valuesToStory,
  type SiteEvent,
  type SiteFaq,
  type SiteStory,
} from "@/lib/site-content";
import {
  overrideToValues,
  valuesToOverride,
  type EventMenuOverride,
} from "@/lib/event-menu";

/**
 * Site content → Google Sheet, via a bound Apps Script Web App.
 *
 * ONE spreadsheet, four tabs — Events, FAQ, Story and Menus — behind one script,
 * addressed by a `tab` parameter. That's the difference from the payroll
 * and guest scripts, which each own their whole spreadsheet: a third
 * separate script would be a third setup and a third thing to break.
 *
 *   GET  ?list=1&tab=Events   → rows
 *   POST { tab, action: "replace", rows }
 *
 * Everything goes through "replace": read all, change one in JS, write
 * the whole tab back. Same approach as payroll and guests, and it keeps
 * the Apps Script trivial enough to survive a bad paste.
 */

const URL = process.env.CONTENT_SHEET_WEBHOOK_URL;

export function contentSheetConfigured(): boolean {
  return Boolean(URL);
}

/**
 * "MAIN LIST" is the crew's own event spreadsheet, living in the same
 * workbook. The site READS it and must never write to it — see
 * `writeRows`, which refuses. It's here so the calendar can come through
 * the (secret) webhook instead of publish-to-web, which would put the
 * Net Sales and Fee columns on the open internet.
 */
export type ContentTab = "Events" | "FAQ" | "Story" | "Menus" | "MAIN LIST";

const READ_ONLY_TABS: ContentTab[] = ["MAIN LIST"];

/**
 * An Apps Script web app answers HTTP 200 even when the script itself is
 * broken — it returns an HTML error page. Treating an unparseable body as
 * success is the bug that once let payroll report saves that never
 * happened, so it's a hard error here.
 */
async function parse(res: Response, what: string): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!res.ok) throw new Error(`${what} ${res.status}: ${text.slice(0, 160)}`);
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `${what} returned a non-JSON response (the Apps Script may be broken) — first 160 chars: ${text.slice(0, 160)}`,
    );
  }
  if (data.error) throw new Error(`${what}: ${String(data.error)}`);
  return data;
}

/**
 * `rows` excludes the header row — every tab the site owns has a fixed
 * column order, so the headers carry no information. `headers` is
 * returned separately for MAIN LIST, which the crew reorders freely and
 * which therefore has to be read by column name.
 */
async function readGrid(
  tab: ContentTab,
): Promise<{ headers: string[]; rows: (string | number)[][] }> {
  if (!URL) throw new Error("Content sheet webhook not configured.");
  const sep = URL.includes("?") ? "&" : "?";
  const res = await fetch(`${URL}${sep}list=1&tab=${encodeURIComponent(tab)}`, {
    cache: "no-store",
    redirect: "follow",
  });
  const data = await parse(res, `Content sheet (${tab})`);
  return {
    headers: ((data.headers as unknown[]) ?? []).map((h) => String(h ?? "")),
    rows: (data.rows as (string | number)[][]) ?? [],
  };
}

async function readRows(tab: ContentTab): Promise<(string | number)[][]> {
  return (await readGrid(tab)).rows;
}

async function writeRows(
  tab: ContentTab,
  rows: (string | number)[][],
): Promise<void> {
  if (!URL) throw new Error("Content sheet webhook not configured.");
  if (READ_ONLY_TABS.includes(tab)) {
    throw new Error(`${tab} is read-only — the crew maintains it by hand.`);
  }
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab, action: "replace", rows }),
    redirect: "follow",
  });
  await parse(res, `Content sheet (${tab})`);
}

/* ── Events ────────────────────────────────────────────────── */

/** Throws if the sheet can't be read — use before any write. */
export async function readEventsStrict(): Promise<SiteEvent[]> {
  return (await readRows("Events")).map(valuesToEvent).filter((e) => e.id && e.date);
}

/** [] on failure. Display use only — never as the basis for a write. */
export async function readEventsSafe(): Promise<SiteEvent[]> {
  try {
    return await readEventsStrict();
  } catch (err) {
    console.error("[content] events unreadable:", err);
    return [];
  }
}

export async function saveEvents(events: SiteEvent[]): Promise<void> {
  await writeRows("Events", events.map(eventToValues));
}

/* ── FAQ ───────────────────────────────────────────────────── */

export async function readFaqStrict(): Promise<SiteFaq[]> {
  return (await readRows("FAQ")).map(valuesToFaq).filter((f) => f.id && f.q);
}

export async function readFaqSafe(): Promise<SiteFaq[]> {
  try {
    return await readFaqStrict();
  } catch (err) {
    console.error("[content] faq unreadable:", err);
    return [];
  }
}

export async function saveFaq(items: SiteFaq[]): Promise<void> {
  await writeRows("FAQ", items.map(faqToValues));
}

/* ── Our Story ─────────────────────────────────────────────── */

export async function readStoryStrict(): Promise<SiteStory[]> {
  return (await readRows("Story")).map(valuesToStory).filter((b) => b.id);
}

export async function readStorySafe(): Promise<SiteStory[]> {
  try {
    return await readStoryStrict();
  } catch (err) {
    console.error("[content] story unreadable:", err);
    return [];
  }
}

export async function saveStory(blocks: SiteStory[]): Promise<void> {
  await writeRows("Story", blocks.map(storyToValues));
}

/* ── Per-event menus ───────────────────────────────────────── */

export async function readMenusStrict(): Promise<EventMenuOverride[]> {
  return (await readRows("Menus")).map(valuesToOverride).filter((m) => m.key);
}

export async function readMenusSafe(): Promise<EventMenuOverride[]> {
  try {
    return await readMenusStrict();
  } catch (err) {
    console.error("[content] menus unreadable:", err);
    return [];
  }
}

export async function saveMenus(items: EventMenuOverride[]): Promise<void> {
  await writeRows("Menus", items.map(overrideToValues));
}

/* ── The crew's own event list (read-only) ─────────────────── */

/** Header row first, then the data — the events parser reads by column name. */
export async function readMainListRows(): Promise<string[][]> {
  const { headers, rows } = await readGrid("MAIN LIST");
  const clean = (r: unknown[]) => r.map((c) => String(c ?? "").trim());
  return [clean(headers), ...rows.map(clean)];
}
