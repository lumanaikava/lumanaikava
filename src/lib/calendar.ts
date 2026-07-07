/**
 * Upcoming events calendar — edit this file to update the public calendar.
 *
 * To add an event: copy a block, set the date as YYYY-MM-DD, and give it a
 * title + location. Past events auto-hide, so you never need to delete old ones.
 *
 * `kind`:
 *   - "market"  → public pop-up (shows "Come say bula")
 *   - "bar"     → private booked bar (shows as social proof, no location details)
 *   - "special" → anything else you want to promote
 */

export type CalendarEvent = {
  date: string; // YYYY-MM-DD
  title: string;
  location?: string;
  time?: string;
  kind: "market" | "bar" | "special";
  url?: string;
};

export const calendarEvents: CalendarEvent[] = [
  // ── July 2026 ──────────────────────────────────────────────
  { date: "2026-07-09", title: "The District", location: "Green Valley Ranch", time: "Evening", kind: "market" },
  { date: "2026-07-11", title: "Downtown Summerlin Market", location: "Downtown Summerlin", time: "Daytime", kind: "market" },
  { date: "2026-07-11", title: "Heartspace BLVD", kind: "bar" },
  { date: "2026-07-12", title: "UnCommons", location: "UnCommons, Las Vegas", time: "Daytime", kind: "market" },
  { date: "2026-07-15", title: "Etho Founders Night", kind: "bar" },
  { date: "2026-07-18", title: "Downtown Summerlin Market", location: "Downtown Summerlin", time: "Daytime", kind: "market" },
  { date: "2026-07-19", title: "UnCommons", location: "UnCommons, Las Vegas", time: "Daytime", kind: "market" },
  { date: "2026-07-25", title: "Downtown Summerlin Market", location: "Downtown Summerlin", time: "Daytime", kind: "market" },
  { date: "2026-07-26", title: "UnCommons", location: "UnCommons, Las Vegas", time: "Daytime", kind: "market" },

  // ── August 2026 ────────────────────────────────────────────
  { date: "2026-08-07", title: "First Friday", location: "Arts District, Las Vegas", time: "5–11pm", kind: "special" },
];

/** Events from today forward, soonest first. */
export function upcomingEvents(now = new Date()): CalendarEvent[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return calendarEvents
    .filter((e) => new Date(`${e.date}T23:59:59`) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function formatEventDate(iso: string): { weekday: string; month: string; day: string } {
  const d = new Date(`${iso}T12:00:00`);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    month: d.toLocaleDateString("en-US", { month: "short" }),
    day: d.toLocaleDateString("en-US", { day: "numeric" }),
  };
}
