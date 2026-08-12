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

/**
 * Site content → Google Sheet, via a bound Apps Script Web App.
 *
 * ONE spreadsheet, three tabs — "Events", "FAQ" and "Story" — behind one script,
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

export type ContentTab = "Events" | "FAQ" | "Story";

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

async function readRows(tab: ContentTab): Promise<(string | number)[][]> {
  if (!URL) throw new Error("Content sheet webhook not configured.");
  const sep = URL.includes("?") ? "&" : "?";
  const res = await fetch(`${URL}${sep}list=1&tab=${encodeURIComponent(tab)}`, {
    cache: "no-store",
    redirect: "follow",
  });
  const data = await parse(res, `Content sheet (${tab})`);
  return (data.rows as (string | number)[][]) ?? [];
}

async function writeRows(
  tab: ContentTab,
  rows: (string | number)[][],
): Promise<void> {
  if (!URL) throw new Error("Content sheet webhook not configured.");
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
