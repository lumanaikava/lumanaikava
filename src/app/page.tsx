import Image from "next/image";
import Link from "next/link";
import Archipelago from "@/components/Archipelago";
import Ripple from "@/components/Ripple";
import { currentMenu } from "@/lib/menu";
import { galleryImages } from "@/lib/images";
import { upcomingEvents, formatEventDate } from "@/lib/calendar";

// The appearances strip rolls forward — refresh hourly.
export const revalidate = 3600;

const testimonials = [
  {
    quote:
      "The bar was the whole conversation. Nobody missed the alcohol — half our guests booked them the next weekend.",
    name: "Danielle H.",
    context: "Private launch, Las Vegas",
  },
  {
    quote:
      "Adapterol Spritz after a long shift, and I sleep like a baby. That's the whole review.",
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
  const nextThree = upcomingEvents().slice(0, 3);

  return (
    <>
      {/* ── Cinematic hero — the roots, the logo, the line ────────── */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
        <div
          className="hero-roots pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/roots-hero.webp)" }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-abyss/60 via-abyss/30 to-ocean" />
        <Ripple
          className="drift-slow pointer-events-none absolute -right-32 top-1/4 h-[560px] w-[560px] text-orchid/20"
          rings={6}
        />
        <Ripple
          className="pointer-events-none absolute -left-40 bottom-10 h-[420px] w-[420px] text-teal/25"
          rings={5}
          animated={false}
        />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-28 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
            Craft Kava + Functional Mocktail Bar · Las Vegas
          </p>
          <Image
            src="/lumanai-wordmark.svg"
            alt="LUMANAI"
            width={640}
            height={259}
            priority
            className="mt-10 h-auto w-[78vw] max-w-[640px]"
          />
          <h1 className="h-sign mt-10 text-4xl text-shell sm:text-6xl">
            All the buzz{" "}
            <span className="text-orchid">without the booze</span>
          </h1>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/events"
              className="rounded-full bg-gold px-9 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss transition-colors hover:bg-shell"
            >
              Build Your Event
            </Link>
            <Link
              href="/find-us"
              className="rounded-full border border-shell/30 px-9 py-4 font-mono text-xs uppercase tracking-[0.18em] text-shell transition-colors hover:border-gold hover:text-gold"
            >
              Find the Bar
            </Link>
          </div>
          <p
            className="mt-16 animate-bounce font-mono text-[10px] uppercase tracking-[0.3em] text-shell/40"
            aria-hidden
          >
            ↓ explore the islands
          </p>
        </div>
      </section>

      {/* ── The Archipelago — navigate by island ──────────────────── */}
      <Archipelago />

      {/* ── Next appearances ───────────────────────────────────────── */}
      <section className="border-b border-shell/10 bg-abyss/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 lg:flex-row lg:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">
            On the water next
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {nextThree.map((e) => {
              const d = formatEventDate(e.date);
              return (
                <p
                  key={`${e.date}-${e.title}`}
                  className="font-mono text-[11px] uppercase tracking-[0.16em] text-shell/75"
                >
                  <span className="text-orchid">
                    {d.weekday} {d.month} {d.day}
                  </span>{" "}
                  · {e.title}
                </p>
              );
            })}
          </div>
          <Link
            href="/find-us"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/60 hover:text-gold"
          >
            Full calendar →
          </Link>
        </div>
      </section>

      {/* ── Menu preview ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-shell/10 bg-abyss">
        <div className="pointer-events-none absolute -right-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-amethyst/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-orchid/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
                {currentMenu.event.title}
              </p>
              <h2 className="h-sign mt-4 text-5xl text-shell sm:text-6xl">
                What&apos;s pouring right now.
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
              <div
                key={section.title}
                className="rounded-3xl border border-shell/10 p-8"
              >
                <div className="flex items-baseline justify-between border-b border-shell/10 pb-4">
                  <div>
                    <h3 className="font-display text-2xl italic text-shell">
                      {section.title}
                    </h3>
                    {section.subtitle && (
                      <p className="mt-1 text-sm text-shell/60">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                  <p className="font-mono text-lg text-gold">
                    {section.priceLabel}
                  </p>
                </div>
                <ul className="mt-6 space-y-5">
                  {section.drinks.map((d) => (
                    <li key={d.name}>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-orchid">
                        {d.name}
                      </p>
                      <p className="mt-1 text-sm text-shell/70">
                        {d.ingredients}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-orchid">
                On the floor
              </p>
              <h2 className="h-sign mt-4 text-5xl text-shell sm:text-6xl">
                Nights we&apos;ve poured.
              </h2>
            </div>
            <Link
              href="/events"
              className="font-mono text-xs uppercase tracking-[0.18em] text-shell/70 hover:text-gold"
            >
              Book yours →
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {galleryImages.slice(0, 4).map((src) => (
              <div
                key={src}
                className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-shell/10"
              >
                <Image
                  src={src}
                  alt="Lumanai event photo"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
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

      {/* ── Closing CTA ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-abyss">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url(/images/roots-texture.webp)" }}
          aria-hidden
        />
        <Ripple
          className="drift-slow pointer-events-none absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 text-amethyst/25"
          rings={6}
          animated={false}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            Drink Different
          </p>
          <h2 className="h-sign mt-6 text-5xl text-shell sm:text-7xl">
            Your next event,
            <br />
            <span className="text-orchid">but everyone remembers it.</span>
          </h2>
          <Link
            href="/events"
            className="mt-10 inline-block rounded-full bg-gold px-10 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss transition-colors hover:bg-shell"
          >
            Build Your Event
          </Link>
        </div>
      </section>
    </>
  );
}
