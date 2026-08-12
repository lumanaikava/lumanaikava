"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CalendarEvent } from "@/lib/calendar";
import { eventSlug } from "@/lib/event-menu";

/**
 * Month grid + agenda, the same shape as the Grizzly Health events page.
 *
 * The grid is the desktop view; on a phone it's hidden entirely and the
 * agenda takes over. A seven-column month squeezed onto a 375px screen
 * gives cells too small to read a venue name in, and the honest answer
 * there is a list, not a smaller grid.
 */

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const KIND_COLOR: Record<string, string> = {
  market: "#c9a7ee",
  bar: "#9ec5ea",
  special: "#9ec5ea",
};
const KIND_LABEL: Record<string, string> = {
  market: "Market",
  bar: "Private event",
  special: "Event",
};

/** Local-time parse. `new Date("2026-08-20")` is UTC and can slip a day. */
function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

export default function FindUsCalendar({
  events,
}: {
  events: CalendarEvent[];
}) {
  // Open on the month of the next event, not necessarily this month —
  // if nothing's on until September, September is what you want to see.
  const first = events[0]?.date;
  const start = first ? parseDay(first) : new Date();
  const [cursor, setCursor] = useState({
    y: start.getFullYear(),
    m: start.getMonth(),
  });

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      map.set(e.date, [...(map.get(e.date) ?? []), e]);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const firstDow = new Date(cursor.y, cursor.m, 1).getDay();
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const out: (Date | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= days; d++) out.push(new Date(cursor.y, cursor.m, d));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [cursor]);

  const step = (n: number) => {
    const d = new Date(cursor.y, cursor.m + n, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  const todayISO = iso(new Date());

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
        for the next pour.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Month grid (desktop) ──────────────────────────── */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => step(-1)}
            aria-label="Previous month"
            className="rounded-full border border-shell/20 px-3.5 py-1.5 text-shell/70 transition-colors hover:border-gold hover:text-gold"
          >
            ‹
          </button>
          <h3 className="h-sign-med text-2xl text-shell">
            {MONTHS[cursor.m]} {cursor.y}
          </h3>
          <button
            onClick={() => step(1)}
            aria-label="Next month"
            className="rounded-full border border-shell/20 px-3.5 py-1.5 text-shell/70 transition-colors hover:border-gold hover:text-gold"
          >
            ›
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-shell/10 bg-shell/10">
          {DOW.map((d) => (
            <div
              key={d}
              className="bg-abyss/70 py-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-shell/40"
            >
              {d}
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="min-h-[86px] bg-abyss/30" />;
            const key = iso(d);
            const evs = byDay.get(key) ?? [];
            const isToday = key === todayISO;
            return (
              <div
                key={key}
                className={`min-h-[86px] bg-lagoon/25 p-1.5 ${
                  evs.length ? "bg-lagoon/50" : ""
                }`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] ${
                    isToday
                      ? "bg-gold font-bold text-abyss"
                      : "text-shell/45"
                  }`}
                >
                  {d.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {evs.slice(0, 2).map((e) => (
                    <p
                      key={e.title}
                      title={`${e.title}${e.time ? ` · ${e.time}` : ""}`}
                      className="truncate rounded px-1 py-0.5 text-[10px] leading-tight"
                      style={{
                        color: KIND_COLOR[e.kind],
                        background: `${KIND_COLOR[e.kind]}1a`,
                      }}
                    >
                      {e.title}
                    </p>
                  ))}
                  {evs.length > 2 && (
                    <p className="px-1 font-mono text-[9px] text-shell/40">
                      +{evs.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Agenda (primary on mobile, still useful on desktop) ── */}
      <ul className="divide-y divide-shell/10 overflow-hidden rounded-3xl border border-shell/10 bg-lagoon/25">
        {events.map((e) => {
          const d = parseDay(e.date);
          return (
            <li key={`${e.date}-${e.title}`}>
              <Link
                href={`/menu/${eventSlug(e.date, e.title)}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-shell/[0.04]"
              >
              <div className="w-14 shrink-0 text-center">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: KIND_COLOR[e.kind] }}
                >
                  {DOW[d.getDay()]}
                </p>
                <p className="h-sign text-2xl leading-none text-shell">
                  {d.getDate()}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-shell/40">
                  {MONTHS[d.getMonth()].slice(0, 3)}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-shell">
                  {e.title}
                </p>
                <p className="truncate text-xs text-shell/50">
                  {[KIND_LABEL[e.kind], e.time, e.location]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <span
                aria-hidden
                className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-shell/35"
              >
                Menu →
              </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
