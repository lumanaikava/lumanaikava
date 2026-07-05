import Image from "next/image";
import Link from "next/link";
import Ripple from "@/components/Ripple";
import { currentMenu } from "@/lib/menu";
import { eventImages, galleryImages } from "@/lib/images";

const services = [
  {
    kicker: "Bartend",
    title: "The mobile kava bar",
    copy: "Our team rolls in, sets up the full craft bar, and pours real handshaken drinks all night — from a market booth to a private penthouse.",
  },
  {
    kicker: "Design",
    title: "A menu built for the room",
    copy: "Every event gets its own menu tuned to the vibe, the guest count, and any theme you're building around.",
  },
  {
    kicker: "Feel",
    title: "Non-alcoholic, still social",
    copy: "Kava works on GABA receptors — the same reason a drink loosens the room. No hangover. Everyone drives home.",
  },
];

const ingredients = [
  { label: "All natural" },
  { label: "Gluten-free" },
  { label: "3rd party tested" },
  { label: "Sugar-free syrups" },
  { label: "Fresh-pressed juice" },
  { label: "Reverse-osmosis water" },
  { label: "No solvents, no CO₂" },
  { label: "Fiji + Vanuatu kava" },
];

const testimonials = [
  {
    quote:
      "The bar was the whole conversation. Nobody missed the alcohol — half our guests booked them the next weekend.",
    name: "Danielle H.",
    context: "Private launch, LA",
  },
  {
    quote:
      "Šavasana Spritz after a long shift, and I sleep like a baby. That's the whole review.",
    name: "Marcus O.",
    context: "Repeat customer",
  },
  {
    quote:
      "They ran our poolside cabana all afternoon. Cleanest, most creative bar setup we've ever hired.",
    name: "Jules R.",
    context: "Vegas hosting",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src={eventImages.heroToast}
          alt="Lumanai kava bar at an outdoor event, guests toasting"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-abyss/60 to-abyss" />
        <Ripple
          className="drift-slow pointer-events-none absolute -right-24 top-1/4 h-[520px] w-[520px] text-orchid/25"
          rings={6}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col justify-end px-6 pb-24 pt-40 sm:pt-48">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            Craft Kava Bar · Los Angeles · Las Vegas
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.02] text-shell sm:text-7xl">
            All the buzz
            <span className="italic text-orchid"> — none of the booze.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-shell/80">
            Lumanai bartends functional kava cocktails and zero-proof
            mocktails at events that want everyone to feel something more —
            without waking up wishing they hadn't.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/events#book"
              className="rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss transition-colors hover:bg-shell"
            >
              Book the Bar
            </Link>
            <Link
              href="/menu"
              className="rounded-full border border-shell/30 px-8 py-4 font-mono text-xs uppercase tracking-[0.18em] text-shell transition-colors hover:border-gold hover:text-gold"
            >
              See This Week's Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Ingredient marquee */}
      <section className="border-y border-shell/10 bg-abyss/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-6 font-mono text-[11px] uppercase tracking-[0.22em] text-shell/70">
          {ingredients.map((i, idx) => (
            <span key={i.label} className="flex items-center gap-3">
              <span>{i.label}</span>
              {idx < ingredients.length - 1 && (
                <span className="h-1 w-1 rounded-full bg-gold" />
              )}
            </span>
          ))}
        </div>
      </section>

      {/* What we do */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-orchid">
            What Lumanai does
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl italic leading-tight sm:text-5xl">
            A full bar experience. Zero alcohol.
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {services.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-3xl border border-shell/10 bg-lagoon/40 p-8 backdrop-blur"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">
                  0{i + 1} · {s.kicker}
                </span>
                <h3 className="mt-6 font-display text-2xl italic text-shell">
                  {s.title}
                </h3>
                <p className="mt-4 text-shell/70">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu preview */}
      <section className="relative overflow-hidden border-y border-shell/10 bg-abyss">
        <div className="pointer-events-none absolute -right-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-amethyst/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-orchid/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
                {currentMenu.event.title}
              </p>
              <h2 className="mt-4 font-display text-4xl italic sm:text-5xl">
                What's pouring right now.
              </h2>
            </div>
            <Link
              href="/menu"
              className="font-mono text-xs uppercase tracking-[0.18em] text-shell/70 hover:text-gold"
            >
              Full menu →
            </Link>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            {currentMenu.sections.map((section) => (
              <div key={section.title} className="rounded-3xl border border-shell/10 p-8">
                <div className="flex items-baseline justify-between border-b border-shell/10 pb-4">
                  <div>
                    <h3 className="font-display text-2xl italic text-shell">
                      {section.title}
                    </h3>
                    {section.subtitle && (
                      <p className="mt-1 text-sm text-shell/60">{section.subtitle}</p>
                    )}
                  </div>
                  <p className="font-mono text-lg text-gold">{section.priceLabel}</p>
                </div>
                <ul className="mt-6 space-y-5">
                  {section.drinks.map((d) => (
                    <li key={d.name}>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-orchid">
                        {d.name}
                      </p>
                      <p className="mt-1 text-sm text-shell/70">{d.ingredients}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-orchid">
                On the floor
              </p>
              <h2 className="mt-4 font-display text-4xl italic sm:text-5xl">
                Nights we've poured.
              </h2>
            </div>
            <Link
              href="/events"
              className="font-mono text-xs uppercase tracking-[0.18em] text-shell/70 hover:text-gold"
            >
              Book yours →
            </Link>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {galleryImages.map((src, i) => (
              <div
                key={src}
                className={`relative aspect-[4/5] overflow-hidden rounded-2xl border border-shell/10 ${
                  i === 0 || i === 5 ? "lg:row-span-2 lg:aspect-[4/8]" : ""
                }`}
              >
                <Image
                  src={src}
                  alt="Lumanai event photo"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-shell/10 bg-lagoon/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            From the table
          </p>
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name}>
                <blockquote className="font-display text-xl italic leading-snug text-shell">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-shell/50">
                  {t.name} · {t.context}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Coconut rewards teaser */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet/40 via-transparent to-orchid/30" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
              Coconut Rewards
            </p>
            <h2 className="mt-4 font-display text-4xl italic sm:text-5xl">
              Collect coconuts. Redeem for pours.
            </h2>
            <p className="mt-6 max-w-lg text-shell/80">
              Every dollar you spend earns a coconut. Stack them for free
              shots, drinks, growlers, and — for the loyal — private
              bartending credit toward your next event.
            </p>
            <Link
              href="/rewards"
              className="mt-8 inline-block rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss hover:bg-shell"
            >
              How it works
            </Link>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
            <div className="relative flex flex-col items-center gap-4 rounded-3xl border border-shell/15 bg-abyss/60 p-10 backdrop-blur">
              <CoconutMark className="h-20 w-20 text-coconut" />
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-shell/50">
                Balance preview
              </p>
              <p className="font-display text-6xl italic text-gold">42</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
                coconuts collected
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden border-t border-shell/10 bg-abyss">
        <Ripple
          className="drift-slow pointer-events-none absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 text-amethyst/25"
          rings={6}
          animated={false}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            Drink Different
          </p>
          <h2 className="mt-6 font-display text-4xl italic sm:text-6xl">
            Your next event, but everyone remembers it.
          </h2>
          <Link
            href="/events#book"
            className="mt-10 inline-block rounded-full bg-gold px-10 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss hover:bg-shell"
          >
            Book the Bar
          </Link>
        </div>
      </section>
    </>
  );
}

function CoconutMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 50 Q35 20 50 50 T80 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <path
        d="M20 60 Q35 30 50 60 T80 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <circle cx="42" cy="42" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="55" cy="42" r="2" fill="currentColor" opacity="0.7" />
      <path
        d="M42 55 Q50 62 58 55"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
