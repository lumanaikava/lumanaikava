import { upcomingEventsSynced } from "@/lib/calendar";
import FindUsCalendar from "@/components/FindUsCalendar";

/**
 * Server half: fetch the merged schedule (weekly residencies + Google
 * Calendar + anything the crew added in the Command Center) and hand it
 * to the client component that renders the month grid.
 */
export default async function EventsCalendar() {
  // Twelve weeks so the grid has something to show when you page a
  // month or two forward.
  const events = await upcomingEventsSynced(new Date(), 12);
  return <FindUsCalendar events={events} />;
}
