import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import EventBuilder from "@/components/EventBuilder";
import { eventImages } from "@/lib/images";

export const metadata: Metadata = {
  title: "Build Your Event",
  description:
    "Build your own kava bar event — pick an experience, guest count, and upgrades, and get a live estimate. Las Vegas.",
};

const included = [
  "Full bar setup + signature fabric",
  "Trained kava bartenders",
  "Custom menu for your event",
  "Glassware, ice, garnishes",
  "NA spirits for mixed crowds",
];

export default function EventsPage() {
  return (
    <>
      {/* Compact hero */}
      <section className="relative overflow-hidden">
        <Image
          src={eventImages.bartenderIndoor}
          alt="Bartender shaking a Lumanai kava cocktail at a private event"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-abyss/70 to-ocean" />
        <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pt-20">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            Events · Las Vegas
          </p>
          <h1 className="h-sign mt-4 max-w-3xl text-5xl text-shell sm:text-6xl">
            Build your <span className="text-orchid">own event.</span>
          </h1>
        </div>
      </section>

      {/* What's always included — one compact strip */}
      <section className="border-y border-shell/10 bg-abyss/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2.5 px-6 py-5 font-mono text-[11px] uppercase tracking-[0.2em] text-shell/70">
          {included.map((t, i) => (
            <span key={t} className="flex items-center gap-3">
              <span>{t}</span>
              {i < included.length - 1 && (
                <span className="h-1 w-1 rounded-full bg-gold" aria-hidden />
              )}
            </span>
          ))}
        </div>
      </section>

      {/* The builder (includes the booking form) */}
      <section className="py-10">
        <EventBuilder />
      </section>

      {/* Cross-link to public appearances */}
      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <p className="font-display text-xl italic text-shell/80">
            Want to taste it before you book it?
          </p>
          <Link
            href="/find-us"
            className="prose-link mt-2 inline-block font-mono text-xs uppercase tracking-[0.2em] text-gold"
          >
            Find the bar at a market this weekend →
          </Link>
        </div>
      </section>
    </>
  );
}
