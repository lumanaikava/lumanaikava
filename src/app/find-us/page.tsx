import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import EventsCalendar from "@/components/EventsCalendar";
import { weeklyResidencies } from "@/lib/calendar";
import { eventImages } from "@/lib/images";

export const metadata: Metadata = {
  title: "Find Us",
  description:
    "Where the Lumanai kava bar is pouring this week — Downtown Summerlin Farmers Market every Saturday, UnCommons every Sunday, plus pop-ups across Las Vegas.",
};

// Re-render hourly so the rolling calendar stays current.
export const revalidate = 3600;

export default function FindUsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src={eventImages.boothSignage}
          alt="The Lumanai booth at a Las Vegas market"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-abyss/70 to-abyss" />
        <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pt-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            Find the bar · Las Vegas
          </p>
          <h1 className="h-sign mt-4 max-w-3xl text-5xl text-shell sm:text-6xl">
            Come say <span className="text-coconut">bula.</span>
          </h1>
        </div>
      </section>

      {/* Weekly residencies */}
      <section className="border-y border-shell/10 bg-abyss/70">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-2">
          {weeklyResidencies.map((r) => (
            <div
              key={r.title}
              className="relative overflow-hidden rounded-3xl border border-gold/30 p-8"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: "url(/images/roots-texture.webp)" }}
                aria-hidden
              />
              <div className="relative">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                  {r.day}
                </p>
                <h2 className="h-sign-med mt-3 text-3xl text-shell">
                  {r.title}
                </h2>
                <p className="mt-3 font-mono text-sm text-shell/70">
                  {r.location} · {r.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rolling calendar */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-coconut">
            Next four weeks
          </p>
          <h2 className="h-sign mt-4 text-5xl text-shell sm:text-6xl">
            Upcoming appearances.
          </h2>
          <div className="mt-8">
            <EventsCalendar />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-2xl text-shell">
            Want the bar to appear at your event next?
          </p>
          <Link
            href="/events"
            className="mt-6 inline-block rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell"
          >
            Build Your Event
          </Link>
        </div>
      </section>
    </>
  );
}
