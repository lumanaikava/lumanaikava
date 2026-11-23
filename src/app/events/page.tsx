import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ExperienceBuilder from "@/components/ExperienceBuilder";
import { eventImages } from "@/lib/images";
import { EVENTS_ORIGIN } from "@/lib/canonical";

const TITLE = "Mobile Kava & Mocktail Bar for Las Vegas Events";
const DESCRIPTION =
  "Book Lumanai's alcohol-free craft kava and functional mocktail bar for your private event in Las Vegas. Pick the format, the size and the add-ons, and we'll reach out to plan it.";

// The booking page of the events site. Its home page is the bar landing
// page (src/app/bar, served at events.lumanai.com/), so this one's
// canonical is events.lumanai.com/events, whichever host serves it.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${EVENTS_ORIGIN}/events` },
  openGraph: {
    title: `${TITLE} — Lumanai Kava`,
    description: DESCRIPTION,
    url: `${EVENTS_ORIGIN}/events`,
    siteName: "Lumanai Kava",
    locale: "en_US",
    type: "website",
  },
};

// The bar as a bookable service, so search engines read this page as the
// events business rather than the shop. Same details as the business
// schema in the root layout.
const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Lumanai mobile kava and functional mocktail bar",
  serviceType: "Mobile alcohol-free bar for private events",
  description: DESCRIPTION,
  url: `${EVENTS_ORIGIN}/events`,
  areaServed: [
    { "@type": "City", name: "Las Vegas" },
    { "@type": "City", name: "North Las Vegas" },
  ],
  provider: {
    "@type": "LocalBusiness",
    name: "Lumanai Kava",
    url: `${EVENTS_ORIGIN}/`,
    telephone: "+17026260858",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1370 W Cheyenne Ave",
      addressLocality: "North Las Vegas",
      addressRegion: "NV",
      postalCode: "89030",
      addressCountry: "US",
    },
    sameAs: ["https://www.instagram.com/lumanaikava"],
  },
};

/**
 * Booking — "build an experience".
 *
 * No prices anywhere: every event is quoted after a conversation, and a
 * number on the page either anchors the wrong figure or forces a fake
 * one. The photo strip and the "full bar setup · trained bartenders ·"
 * ticker that used to sit above the builder are gone — those photos now
 * live inside the choice buttons, where they do actual work.
 */
export default function EventsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <section className="relative overflow-hidden border-b border-shell/10">
        <div
          className="ether-drift pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-amethyst/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-6 py-9 sm:py-20">
          <p className="ether-in font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            Private events · Las Vegas
          </p>
          <h1 className="h-sign ether-in mt-4 max-w-3xl text-5xl leading-[0.92] text-shell sm:text-7xl">
            Build an
            <br />
            <span className="text-coconut">experience.</span>
          </h1>
          <p className="ether-in mt-6 max-w-xl text-lg text-shell/70">
            Pick the shape of your night. Tell us who it&apos;s for. We&apos;ll
            reach out and build the rest together — the menu, the pours, the
            room.
          </p>
        </div>
        {/* Hero photo: the bar mid-pour with guests leaning in — sells the
            night before a word of copy does. */}
        <div className="relative mx-auto max-w-5xl px-6 pb-9 sm:pb-14">
          <div className="relative aspect-[3/2] overflow-hidden rounded-3xl border border-shell/10">
            <Image
              src={eventImages.nightPour}
              alt="Lumanai bartender pouring kava for guests under lantern light, Las Vegas Strip behind"
              fill
              priority
              sizes="(min-width: 1024px) 976px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-9 sm:py-14">
        <ExperienceBuilder />
      </section>

      {/* The room — social proof: real guests, real nights. */}
      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-5xl px-6 py-9 sm:py-14">
          <h2 className="h-sign text-4xl text-shell sm:text-5xl">
            What the night <span className="text-coconut">looks like.</span>
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                src: eventImages.rooftopDusk,
                alt: "Lumanai bartenders serving a guest at a rooftop private event at dusk",
              },
              {
                src: eventImages.nightCrowd,
                alt: "A crowd gathered around the Lumanai kava bar at night",
              },
              {
                src: eventImages.guestsTasting,
                alt: "Three guests smiling as they taste kava at the Lumanai bar",
              },
            ].map((img) => (
              <div
                key={img.src}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-shell/10"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 640px) 320px, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-link to public appearances */}
      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-4xl px-6 py-10 text-center">
          <p className="text-lg font-medium text-shell/80">
            Want to taste it before you book it?
          </p>
          <Link
            href="/find-us"
            className="prose-link mt-1 inline-block py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold"
          >
            Find the bar at a market →
          </Link>
        </div>
      </section>
    </>
  );
}
