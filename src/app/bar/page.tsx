import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Archipelago from "@/components/Archipelago";
import { galleryImages } from "@/lib/images";
import { upcomingEventsSynced, formatEventDate } from "@/lib/calendar";

// The appearances ticker rolls forward — refresh hourly.
// See find-us: the sheet pings /api/revalidate, this is the fallback.
export const revalidate = 60;

/**
 * The events business's front door. events.lumanai.com/ is rewritten
 * here (next.config.ts), so this was the old all-in-one homepage —
 * lumanai.com itself is now the product brand's landing page.
 */
export const metadata: Metadata = {
  title: { absolute: "Lumanai — Craft Kava & Functional Mocktail Bar for Events" },
  description:
    "Premium craft kava and functional mocktail bar for events across Las Vegas. All the buzz — without the booze.",
};

export default async function BarHome() {
  const tickerEvents = (await upcomingEventsSynced(new Date(), 8))
    .slice(0, 12)
    .map((e) => {
      const d = formatEventDate(e.date);
      return {
        date: `${d.month} ${d.day}`,
        label: e.title,
        kind: e.kind,
      };
    });

  return (
    <>
      {/* Everything important in one viewport: logo, slogan, drinks, dates */}
      <Archipelago
        events={tickerEvents}
        tagline="Premium craft kava & functional mocktail bar for events"
      />

      {/* The word we own — dictionary entry, wording set by Ash */}
      <section className="border-b border-shell/10 bg-abyss/60">
        <div className="mx-auto max-w-3xl px-6 py-9 sm:py-14 text-center">
          <p className="h-sign text-5xl text-shell sm:text-6xl">NAKTAIL</p>
          <p className="mt-2 text-sm tracking-[0.2em] text-shell/50">
            (nak-TAYL) <span className="italic">n.</span>
          </p>
          <p className="mx-auto mt-5 max-w-xl text-shell/70">
            From <span className="italic text-shell">nakamal</span> — the
            traditional gathering house where kava is consumed in Vanuatu.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg text-shell/90">
            A cocktail built on kava, not alcohol. Mixologist-formulated,
            built with real craft cocktail technique. Zero proof.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-shell/50">
            Coined behind the bar at LUMANAI.
          </p>
        </div>
      </section>

      {/* One row of real nights + the ask */}
      <section className="relative overflow-hidden bg-abyss">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url(/images/roots-texture.webp)" }}
          aria-hidden
        />
        {/* One photo beside the ask, not a four-up strip above it — the
            strip made the section read as a gallery with a caption. */}
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="order-2 md:order-1">
              {/* Two lines, deliberately: the break is placed, not left
                  to wrap wherever the viewport happens to end. */}
              <h2 className="h-sign text-[2.1rem] leading-[1.05] text-shell sm:text-5xl">
                Make your next event
                <br />
                <span className="text-coconut">
                  an unforgettable sober experience.
                </span>
              </h2>
              <Link
                href="/events"
                className="btn-brush mt-7 inline-block font-mono text-xs font-bold uppercase tracking-[0.2em] text-shell"
                style={{ "--brush-bg": "var(--amethyst)" } as React.CSSProperties}
              >
                Build Your Event
              </Link>
            </div>

            <div className="brush-mask relative order-1 aspect-[4/3] overflow-hidden md:order-2">
              <Image
                src={galleryImages[0]}
                alt="The Lumanai bar at a private event"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
