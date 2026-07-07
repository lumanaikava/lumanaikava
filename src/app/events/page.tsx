import Image from "next/image";
import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import EventsCalendar from "@/components/EventsCalendar";
import Ripple from "@/components/Ripple";
import { eventImages } from "@/lib/images";
import { eventPackages, experienceUpgrades, upgradeBundle } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Book the Bar — Lumanai Kava",
  description:
    "Hire the Lumanai craft kava bar for private parties, launches, weddings, retreats, and pop-ups. Los Angeles and Las Vegas.",
};

const eventTypes = [
  "Private launches",
  "Weddings & receptions",
  "Corporate & brand activations",
  "Retreats & wellness pop-ups",
  "Poolside cabanas",
  "Sober-curious dinners",
  "Market booths",
  "Bachelor(ette) parties",
];

const included = [
  {
    title: "The full setup",
    copy: "Bar, glassware, ice, tools, garnishes, coconut bowls, our signature swirled bar fabric — we bring the whole room.",
  },
  {
    title: "Trained bartenders",
    copy: "Real hands. Real technique. Trained under LA mixology veterans and versed in kava specifically.",
  },
  {
    title: "A custom menu",
    copy: "Built around your event's vibe, dietary needs, and — if you want — a themed name or two for the drinks.",
  },
  {
    title: "Non-alcoholic spirits",
    copy: "We can layer in premium NA spirits, aperitifs, or wine for mixed-crowd events at no extra fuss.",
  },
];

export default function EventsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src={eventImages.bartenderIndoor}
          alt="Bartender shaking a Lumanai kava cocktail at a private event"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-abyss/60 to-abyss" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-40 sm:pt-48">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            Events · LA · Vegas
          </p>
          <h1 className="h-sign mt-6 max-w-3xl text-6xl text-shell sm:text-8xl">
            The bar people
            <br />
            <span className="text-orchid">will talk about.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-shell/80">
            A full craft cocktail experience for your event — poured entirely
            without alcohol, entirely with intention.
          </p>
          <a
            href="#book"
            className="mt-10 inline-block rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss hover:bg-shell"
          >
            Request a Quote
          </a>
        </div>
      </section>

      {/* Event types marquee */}
      <section className="border-y border-shell/10 bg-abyss/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 py-6 font-mono text-[11px] uppercase tracking-[0.22em] text-shell/70">
          {eventTypes.map((t, i) => (
            <span key={t} className="flex items-center gap-3">
              <span>{t}</span>
              {i < eventTypes.length - 1 && (
                <span className="h-1 w-1 rounded-full bg-orchid" />
              )}
            </span>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-orchid">
            What&apos;s included
          </p>
          <h2 className="h-sign mt-4 max-w-2xl text-5xl text-shell sm:text-6xl">
            One package. Everything you need at the bar.
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {included.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-shell/10 bg-lagoon/40 p-7 backdrop-blur"
              >
                <Ripple className="h-8 w-8 text-gold" rings={3} animated={false} />
                <h3 className="mt-6 font-display text-xl italic text-shell">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-shell/70">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            Packages
          </p>
          <h2 className="h-sign mt-4 max-w-2xl text-5xl text-shell sm:text-6xl">
            Pick your experience.
          </h2>
          <p className="mt-4 max-w-xl text-shell/60">
            Pricing reflects events within the Las Vegas metro area. Final
            pricing may vary with guest count, duration, and customization.
          </p>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {eventPackages.map((pkg) => (
              <div
                key={pkg.number}
                className={`flex flex-col rounded-3xl border p-8 backdrop-blur ${
                  pkg.highlight
                    ? "border-gold/50 bg-violet/40"
                    : "border-shell/10 bg-lagoon/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-display text-4xl italic text-shell/30">
                    {pkg.number}.
                  </p>
                  {pkg.highlight && (
                    <p className="rounded-full border border-gold/50 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                      Signature experience
                    </p>
                  )}
                </div>
                <h3 className="h-sign-med mt-3 text-2xl text-shell">
                  {pkg.name}
                </h3>
                <ul className="mt-5 space-y-2.5">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-shell/75">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orchid"
                        aria-hidden
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <dl className="mt-auto space-y-1 pt-7">
                  {pkg.tiers.map((t) => (
                    <div
                      key={t.guests}
                      className="flex items-baseline justify-between border-t border-shell/10 py-2"
                    >
                      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-shell/50">
                        {t.guests}
                      </dt>
                      <dd className="font-mono text-lg text-gold">{t.price}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience upgrades */}
      <section className="border-t border-shell/10 bg-abyss/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-orchid">
            Experience upgrades
          </p>
          <h2 className="h-sign mt-4 max-w-2xl text-5xl text-shell sm:text-6xl">
            Tune the bar to your crowd.
          </h2>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {experienceUpgrades.map((u) => (
              <div
                key={u.name}
                className="rounded-3xl border border-shell/10 bg-lagoon/40 p-7"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="h-sign-med text-lg text-shell">{u.name}</h3>
                  <p className="font-display text-2xl italic text-gold">
                    {u.price}
                  </p>
                </div>
                <ul className="mt-5 space-y-4">
                  {u.items.map((item) => (
                    <li key={item.name}>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-orchid">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-shell/70">{item.copy}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl border border-gold/40 bg-violet/30 px-8 py-6 sm:flex-row">
            <p className="h-sign-med text-xl text-shell">{upgradeBundle.name}</p>
            <p className="font-display text-3xl italic text-gold">
              {upgradeBundle.price}
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming events calendar */}
      <section id="calendar" className="border-t border-shell/10">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            Find the booth
          </p>
          <h2 className="h-sign mt-4 text-5xl text-shell sm:text-6xl">
            Upcoming events.
          </h2>
          <p className="mt-4 max-w-xl text-shell/60">
            Try the full craft kava &amp; functional mocktail bar before you
            book it. Come say bula.
          </p>
          <div className="mt-12">
            <EventsCalendar />
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-3 sm:grid-cols-3">
            {[eventImages.pouring, eventImages.bartenderShaker, eventImages.actionIndoor2].map(
              (src) => (
                <div
                  key={src}
                  className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-shell/10"
                >
                  <Image
                    src={src}
                    alt="Lumanai event photo"
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Booking form */}
      <section id="book" className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
              Book the bar
            </p>
            <h2 className="h-sign mt-4 text-5xl text-shell sm:text-6xl">
              Tell us about your night.
            </h2>
            <p className="mt-6 text-shell/70">
              Currently booking Los Angeles and Las Vegas. Fall 2026
              availability is open. Rush jobs? Text us — we do our best.
            </p>
            <div className="mt-10 space-y-4 text-shell/70">
              <p>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-shell/50">
                  Email
                </span>
                <br />
                <a
                  href="mailto:lumanai.events@gmail.com"
                  className="prose-link text-shell hover:text-gold"
                >
                  lumanai.events@gmail.com
                </a>
              </p>
              <p>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-shell/50">
                  Text
                </span>
                <br />
                <a href="tel:+17026260858" className="prose-link text-shell hover:text-gold">
                  (702) 626-0858
                </a>
              </p>
            </div>
          </div>
          <BookingForm />
        </div>
      </section>
    </>
  );
}
