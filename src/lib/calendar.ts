/**
 * Appearances calendar — where to find the Lumanai bar.
 *
 * TWO things live here:
 *
 * 1. RESIDENCIES — the weekly markets. These auto-generate every week,
 *    forever. You never touch them unless a residency changes.
 *
 * 2. ONE-OFFS — sporadic events (private bars, pop-ups, festivals).
 *    THE EASY WAY: add the event to the lumanai.events@gmail.com
 *    Google Calendar — the site syncs it hourly (see src/lib/gcal.ts).
 *    Put "private" in the title to show it as "Private bar — booked".
 *    The list below still works as a code-side fallback; past dates
 *    auto-hide either way.
 */

export type CalendarEvent = {
  date: string; // YYYY-MM-DD
  title: string;
  location?: string;
  time?: string;
  kind: "market" | "bar" | "special";
  url?: string;
};

/** Weekly residencies — auto-generated for the next `weeksAhead` weeks. */
const residencies = [
  {
    weekday: 6, // Saturday
    title: "Downtown Summerlin Farmers Market",
    location: "Downtown Summerlin",
    time: "9am–2pm",
  },
  {
    weekday: 0, // Sunday
    title: "UnCommons Farmers Market",
    location: "UnCommons, Las Vegas",
    time: "10am–2pm",
  },
];

/** Sporadic events — edit this list on the fly. */
export const oneOffEvents: CalendarEvent[] = [
  { date: "2026-07-11", title: "Heartspace BLVD", kind: "bar" },
  { date: "2026-07-15", title: "Etho Founders Night", kind: "bar" },
  {
    date: "2026-07-24",
    title: "Sweat Equity Sueno 001",
    location: "Las Vegas",
    kind: "special",
  },
  {
    date: "2026-07-29",
    title: "Home Court Presence x Etho",
    location: "Las Vegas",
    kind: "special",
  },
  {
    date: "2026-08-07",
    title: "First Friday",
    location: "Arts District, Las Vegas",
    time: "5–11pm",
    kind: "special",
  },
  {
    date: "2026-08-08",
    title: "Sweat Equity Heat Wave",
    location: "Las Vegas",
    kind: "special",
  },
  {
    date: "2026-08-08",
    title: "GRIT After Dark",
    location: "Las Vegas",
    kind: "special",
  },
];

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateResidencyDates(
  now: Date,
  weeksAhead: number,
): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (const r of residencies) {
    // Days until the next occurrence of this weekday (today counts).
    const delta = (r.weekday - today.getDay() + 7) % 7;
    for (let week = 0; week < weeksAhead; week++) {
      const d = new Date(today);
      d.setDate(today.getDate() + delta + week * 7);
      out.push({
        date: toISODate(d),
        title: r.title,
        location: r.location,
        time: r.time,
        kind: "market",
      });
    }
  }
  return out;
}

/** Events from today forward, soonest first: residencies + one-offs merged. */
/**
 * Upcoming dates from the CODE list only.
 *
 * The weekly residencies used to be generated here for every Saturday
 * and Sunday. They no longer are: markets are paused until September
 * (Zach, 2026-08-12), and generating them was putting booths on the
 * public calendar that nobody was going to show up to. The Events 2026
 * sheet is the source of truth now — see upcomingEventsSynced.
 */
export function upcomingEvents(
  now = new Date(),
  weeksAhead = 4,
): CalendarEvent[] {
  void weeksAhead;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return oneOffEvents
    .filter((e) => new Date(`${e.date}T23:59:59`) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * upcomingEvents + one-offs pulled live from the Google Calendar.
 * Duplicates (same date + title, e.g. First Friday living in both the
 * code list and the calendar) collapse to one entry.
 */
export async function upcomingEventsSynced(
  now = new Date(),
  weeksAhead = 4,
  opts?: { fresh?: boolean },
): Promise<CalendarEvent[]> {
  const { googleCalendarEvents } = await import("@/lib/gcal");
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + weeksAhead * 7);
  const synced = (await googleCalendarEvents(opts)).filter((e) => {
    const d = new Date(`${e.date}T23:59:59`);
    return d >= today && d <= horizon;
  });
  // Appearances the crew added in the Command Center. Last in the merge
  // so a hand-edited entry beats the code list or the Google Calendar
  // for the same date+title — the person who typed it most recently is
  // the one who knows.
  const { readEventsSafe, contentSheetConfigured } = await import(
    "@/lib/integrations/content-sheet"
  );
  const managed: CalendarEvent[] = contentSheetConfigured()
    ? (await readEventsSafe())
        .filter((e) => {
          if (e.hidden || !e.date || !e.title) return false;
          const d = new Date(`${e.date}T23:59:59`);
          return d >= today && d <= horizon;
        })
        .map((e) => ({
          date: e.date,
          title: e.title,
          location: e.location || undefined,
          time: e.time || undefined,
          // SiteEvent calls it "event"; the calendar has always called
          // that same thing "special".
          kind: e.kind === "event" ? "special" : e.kind,
        }))
    : [];

  // The Events 2026 spreadsheet — the crew's own working document and
  // the authority on what's actually booked. Merged LAST so it beats
  // every other source on a date+title collision.
  const { readEventsSheet, eventsSheetConfigured } = await import(
    "@/lib/integrations/events-sheet"
  );
  const fromSheet: CalendarEvent[] = eventsSheetConfigured()
    ? (await readEventsSheet()).filter((e) => {
        const d = new Date(`${e.date}T23:59:59`);
        return d >= today && d <= horizon;
      })
    : [];

  const merged = new Map<string, CalendarEvent>();
  for (const e of [...upcomingEvents(now, weeksAhead), ...synced, ...managed, ...fromSheet]) {
    merged.set(`${e.date}|${e.title.toLowerCase()}`, e);
  }
  return [...merged.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function formatEventDate(iso: string): {
  weekday: string;
  month: string;
  day: string;
} {
  const d = new Date(`${iso}T12:00:00`);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    month: d.toLocaleDateString("en-US", { month: "short" }),
    day: d.toLocaleDateString("en-US", { day: "numeric" }),
  };
}

/**
 * The standing weekly schedule.
 *
 * PAUSED until September 2026 (Zach, 2026-08-12). Left here rather than
 * deleted because they return — but the cards say so plainly instead of
 * implying a booth that isn't there. Individual dates in the meantime
 * come from the EventCalendar sheet.
 *
 * The wording matters: DTS IS booked for some August Saturdays, so
 * "Returns in September" beside an August DTS date on the same page
 * reads as a contradiction. "Weekly again from September" says the
 * standing slot is what's paused, not the market.
 */
export const residenciesPaused = true;

export const weeklyResidencies = [
  {
    day: residenciesPaused ? "Weekly again from September" : "Every Saturday",
    title: "Downtown Summerlin Farmers Market",
    location: "Downtown Summerlin",
    time: "9am–2pm",
  },
  {
    day: residenciesPaused ? "Weekly again from September" : "Every Sunday",
    title: "UnCommons Farmers Market",
    location: "UnCommons, Las Vegas",
    time: "10am–2pm",
  },
];
