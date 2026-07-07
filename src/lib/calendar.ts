/**
 * Appearances calendar — where to find the Lumanai bar.
 *
 * TWO things live here:
 *
 * 1. RESIDENCIES — the weekly markets. These auto-generate every week,
 *    forever. You never touch them unless a residency changes.
 *
 * 2. ONE-OFFS — sporadic events (private bars, pop-ups, festivals).
 *    To add one: copy a line, set the date as YYYY-MM-DD. Past dates
 *    auto-hide, so you never need to delete old ones.
 *    `kind: "bar"` shows as "Private event — booked" without location;
 *    `kind: "special"` shows full details as a public appearance.
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
  { date: "2026-08-07", title: "First Friday", location: "Arts District, Las Vegas", time: "5–11pm", kind: "special" },
];

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateResidencyDates(now: Date, weeksAhead: number): CalendarEvent[] {
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
export function upcomingEvents(now = new Date(), weeksAhead = 4): CalendarEvent[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneOffs = oneOffEvents.filter(
    (e) => new Date(`${e.date}T23:59:59`) >= today
  );
  return [...generateResidencyDates(now, weeksAhead), ...oneOffs].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export function formatEventDate(iso: string): { weekday: string; month: string; day: string } {
  const d = new Date(`${iso}T12:00:00`);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    month: d.toLocaleDateString("en-US", { month: "short" }),
    day: d.toLocaleDateString("en-US", { day: "numeric" }),
  };
}

/** The standing weekly schedule, for display as "every Saturday/Sunday" cards. */
export const weeklyResidencies = [
  {
    day: "Every Saturday",
    title: "Downtown Summerlin Farmers Market",
    location: "Downtown Summerlin",
    time: "9am–2pm",
  },
  {
    day: "Every Sunday",
    title: "UnCommons Farmers Market",
    location: "UnCommons, Las Vegas",
    time: "10am–2pm",
  },
];
