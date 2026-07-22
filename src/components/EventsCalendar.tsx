import { upcomingEventsSynced, formatEventDate } from "@/lib/calendar";

const kindLabel = {
  market: "Market",
  bar: "Private event — booked",
  special: "Event",
} as const;

/* Color code: markets pour purple, events pour blue. */
const kindColor = {
  market: "#c9a7ee",
  bar: "#9ec5ea",
  special: "#9ec5ea",
} as const;

export default async function EventsCalendar() {
  const events = await upcomingEventsSynced();

  if (events.length === 0) {
    return (
      <p className="rounded-3xl border border-shell/10 bg-lagoon/40 p-8 text-shell/70">
        New dates drop soon — follow{" "}
        <a
          href="https://www.instagram.com/lumanaikava"
          target="_blank"
          rel="noopener noreferrer"
          className="prose-link text-shell hover:text-gold"
        >
          @lumanaikava
        </a>{" "}
        to catch the next one.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-shell/10 border-y border-shell/10">
      {events.map((e) => {
        const d = formatEventDate(e.date);
        const isPrivate = e.kind === "bar";
        const tint = kindColor[e.kind];
        return (
          <li
            key={`${e.date}-${e.title}`}
            className="grid grid-cols-[72px_1fr] items-center gap-6 py-5 sm:grid-cols-[88px_1fr_auto]"
          >
            <div className="text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-coconut">
                {d.weekday}
              </p>
              <p className="h-sign text-3xl" style={{ color: tint }}>
                {d.day}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
                {d.month}
              </p>
            </div>
            <div>
              <h3
                className={`text-xl  ${isPrivate ? "text-shell/60" : "text-shell"}`}
              >
                {e.title}
              </h3>
              <p className="mt-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: tint }}
                  aria-hidden
                />
                {kindLabel[e.kind]}
                {e.location ? ` · ${e.location}` : ""}
                {e.time ? ` · ${e.time}` : ""}
              </p>
            </div>
            {!isPrivate && (
              <p className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-gold sm:block">
                Come say bula →
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
