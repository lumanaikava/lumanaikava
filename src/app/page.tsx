import Link from "next/link";
import Ripple from "@/components/Ripple";
import { products } from "@/lib/products";

const benefits = [
  {
    label: "Ease",
    title: "Stress & anxiety",
    copy: "Kavalactones act on non-opiate pathways, taking the edge off without dulling you down.",
    rings: 2,
  },
  {
    label: "Soothe",
    title: "Inflammation",
    copy: "Kavain, one of kava's core compounds, is studied for its anti-inflammatory effects.",
    rings: 3,
  },
  {
    label: "Rest",
    title: "Quality sleep",
    copy: "Promotes deep sleep without touching restorative REM, and helps regulate your sleep-wake cycle.",
    rings: 4,
  },
  {
    label: "Lift",
    title: "Sense of well-being",
    copy: "Kavalactones bind to GABA receptors and slow dopamine and serotonin reuptake — elevated, unhurried.",
    rings: 5,
  },
];

const testimonials = [
  {
    quote:
      "First glass in and I already understood the hype. It tastes like a real cocktail, not a consolation prize.",
    name: "Maya R.",
  },
  {
    quote:
      "I host a lot. Lumanai is the first non-alcoholic option my friends ask for by name instead of settling for.",
    name: "Devon P.",
  },
  {
    quote:
      "Ginger Honey Lemon at 9pm, asleep by 11, up without a fog. That's the whole pitch for me.",
    name: "Sam K.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink/10">
        <Ripple
          className="pointer-events-none absolute -right-32 top-1/2 h-[560px] w-[560px] -translate-y-1/2 text-jade/25 sm:-right-16"
          rings={6}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-jade">
            Alcohol-free · Fiji &amp; Vanuatu kava · Since 2015
          </p>
          <h1 className="mt-6 max-w-2xl font-display text-5xl italic leading-[1.05] text-ink sm:text-6xl">
            The future of alcohol replacement,
            <span className="not-italic"> 3,000 years in the making.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink/70">
            Unrivaled alcohol-free social beverages built on premium traditional
            kava — the whole root, water-extracted, never a solvent-stripped
            extract standing in for the real thing.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-full bg-ink px-7 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:bg-jade"
            >
              Shop Now
            </Link>
            <Link
              href="/about-kava"
              className="rounded-full border border-ink/20 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-jade hover:text-jade"
            >
              Learn About Kava
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b border-bone/10 bg-bilo text-bone">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-3xl italic text-bone sm:text-4xl">
              One pour, effects that ripple outward.
            </h2>
          </div>
          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title}>
                <Ripple
                  className="h-10 w-10 text-gold"
                  rings={b.rings}
                  animated={false}
                />
                <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                  {b.label}
                </p>
                <h3 className="mt-2 font-display text-xl text-bone">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-bone/70">
                  {b.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="border-b border-ink/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-jade">
                Lumanai Premium
              </p>
              <h2 className="mt-3 font-display text-3xl italic sm:text-4xl">
                Bottled for the night ahead.
              </h2>
            </div>
            <Link
              href="/products"
              className="font-mono text-xs uppercase tracking-[0.15em] text-ink/70 hover:text-jade"
            >
              View all products →
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {products
              .filter((p) => p.category === "premium")
              .map((p) => (
                <Link
                  key={p.handle}
                  href={`/products/${p.handle}`}
                  className="group block rounded-2xl border border-ink/10 bg-white/40 p-7 transition-colors hover:border-jade"
                >
                  <Ripple
                    className="h-8 w-8 text-jade/70"
                    rings={3}
                    animated={false}
                  />
                  <h3 className="mt-6 font-display text-xl">{p.name}</h3>
                  <p className="mt-2 text-sm text-ink/60">{p.notes}</p>
                  <p className="mt-6 font-mono text-sm text-gold">
                    {p.priceLabel}
                  </p>
                </Link>
              ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-ink/10 bg-bilo px-7 py-6 text-bone">
            <div>
              <h3 className="font-display text-xl italic">
                Hosting? Get a growler.
              </h3>
              <p className="mt-1 text-sm text-bone/70">
                Share-sized batches from $35 — pick your flavor.
              </p>
            </div>
            <Link
              href="/products?category=growler"
              className="hidden shrink-0 rounded-full border border-bone/30 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-bone hover:border-gold hover:text-gold sm:block"
            >
              Shop Growlers
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-ink/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-jade">
            From the table
          </p>
          <div className="mt-8 grid gap-10 sm:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name}>
                <blockquote className="font-display text-lg italic leading-snug text-ink/90">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 font-mono text-xs uppercase tracking-[0.15em] text-ink/50">
                  {t.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="border-b border-ink/10 bg-jade text-bone">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
            Our commitment
          </p>
          <h2 className="mt-4 max-w-xl font-display text-3xl italic leading-tight sm:text-4xl">
            Kava built entire island economies. We source like it matters.
          </h2>
          <p className="mt-6 max-w-xl text-bone/80">
            Our kava is sourced exclusively from Fiji and Vanuatu, and 1% of
            every online order goes to the South Pacific Islander
            Organization, supporting Pacific Islander education — a share
            we intend to keep growing.
          </p>
          <Link
            href="/our-process"
            className="mt-8 inline-block rounded-full border border-bone/30 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-bone hover:border-bone hover:bg-bone/10"
          >
            See Our Process
          </Link>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden">
        <Ripple
          className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 text-jade/10"
          rings={6}
          animated={false}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-28 text-center">
          <h2 className="font-display text-3xl italic sm:text-4xl">
            Ready to feel different tonight?
          </h2>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-ink px-8 py-4 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:bg-jade"
          >
            Shop Lumanai
          </Link>
        </div>
      </section>
    </>
  );
}
