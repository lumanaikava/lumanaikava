/**
 * Content the crew edits themselves, without a deploy.
 *
 * Two things live here: upcoming appearances, and the FAQ. They share one
 * spreadsheet (two tabs) and one Apps Script, because a third separate
 * script would be a third thing to set up and a third thing to break.
 *
 * Both degrade to the code defaults — `src/lib/calendar.ts` one-offs and
 * `src/lib/faq.ts` — so the site is never blank if the sheet is
 * unreachable. Editing is additive, not a replacement for those.
 */

/** Matches the kinds already used by calendar.ts so colours stay consistent. */
export type EventKind = "market" | "event" | "bar";

export type SiteEvent = {
  /** Stable row id, also the sort tiebreak. */
  id: string;
  /** ISO calendar day, YYYY-MM-DD. */
  date: string;
  title: string;
  /** e.g. "9am–2pm" — free text, shown as-is. */
  time: string;
  location: string;
  kind: EventKind;
  /** Hidden rows stay in the sheet but off the public site. */
  hidden: boolean;
  note: string;
};

export const EVENT_COLUMNS = [
  "Id",
  "Date",
  "Title",
  "Time",
  "Location",
  "Kind",
  "Hidden",
  "Note",
] as const;

export const EVENT_KINDS: EventKind[] = ["market", "event", "bar"];

const s = (v: unknown) => String(v ?? "").trim();

/** Sheets turn a typed date into a Date cell; keep only the calendar day. */
function day(v: unknown): string {
  const str = s(v);
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) return str.slice(0, 10);
  // M/D/YYYY — what Sheets hands back when someone types a date by hand.
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, mo, d, y] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return str;
}

export function eventToValues(e: SiteEvent): (string | number)[] {
  return [
    e.id,
    e.date,
    e.title,
    e.time,
    e.location,
    e.kind,
    e.hidden ? "yes" : "",
    e.note,
  ];
}

export function valuesToEvent(c: (string | number)[]): SiteEvent {
  const kind = s(c[5]).toLowerCase();
  return {
    id: s(c[0]),
    date: day(c[1]),
    title: s(c[2]),
    time: s(c[3]),
    location: s(c[4]),
    kind: (EVENT_KINDS as string[]).includes(kind)
      ? (kind as EventKind)
      : "event",
    hidden: /^(yes|true|y|1)$/i.test(s(c[6])),
    note: s(c[7]),
  };
}

/* ── FAQ ───────────────────────────────────────────────────── */

export type SiteFaq = {
  id: string;
  q: string;
  /** Paragraphs, stored in the sheet as one cell split on blank lines. */
  a: string[];
  hidden: boolean;
};

export const FAQ_COLUMNS = ["Id", "Question", "Answer", "Hidden"] as const;

export function faqToValues(f: SiteFaq): (string | number)[] {
  return [f.id, f.q, f.a.join("\n\n"), f.hidden ? "yes" : ""];
}

export function valuesToFaq(c: (string | number)[]): SiteFaq {
  return {
    id: s(c[0]),
    q: s(c[1]),
    a: s(c[2])
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    hidden: /^(yes|true|y|1)$/i.test(s(c[3])),
  };
}

/** Unique-enough id for a hand-added row. */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/* ── Our Story ─────────────────────────────────────────────── */

export type SiteStory = {
  id: string;
  heading: string;
  /** Paragraphs, stored in one cell split on blank lines. */
  body: string[];
  hidden: boolean;
};

export const STORY_COLUMNS = ["Id", "Heading", "Body", "Hidden"] as const;

export function storyToValues(b: SiteStory): (string | number)[] {
  return [b.id, b.heading, b.body.join("\n\n"), b.hidden ? "yes" : ""];
}

export function valuesToStory(c: (string | number)[]): SiteStory {
  return {
    id: s(c[0]),
    heading: s(c[1]),
    body: s(c[2])
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    hidden: /^(yes|true|y|1)$/i.test(s(c[3])),
  };
}
