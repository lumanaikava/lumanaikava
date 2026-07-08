import type { Metadata } from "next";
import Image from "next/image";
import { eventImages } from "@/lib/images";

export const metadata: Metadata = { title: "Our Story — Lumanai Kava" };

export default function OurStoryPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <Image
          src={eventImages.bartenderShaker}
          alt="Etienne shaking a drink at a Lumanai booth"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-abyss/70 to-abyss" />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-40 text-center sm:pt-48">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            Our Story
          </p>
          <h1 className="h-sign mt-6 text-6xl text-shell sm:text-8xl">
            Lumana&apos;i.
            <span className="block text-orchid">
              Samoan for &ldquo;the future.&rdquo;
            </span>
          </h1>
        </div>
      </section>

      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-3xl space-y-6 px-6 py-20 text-shell/80">
          <p>
            Founder Etienne Asher first ran into kava in 2015, after coming
            across it as a wellness product long before he understood it as a
            beverage tradition. Two years earlier, in 2013, he&apos;d trained
            under Julian Cox — at the time, LA&apos;s top mixologist — learning
            cocktail craft in the city&apos;s best bars.
          </p>
          <p>
            Traditional kava&apos;s flavor is an acquired taste. Etienne saw
            that as the real barrier to it ever going mainstream. So he applied
            what he&apos;d learned behind the bar: a strong, water-extracted
            kava — no solvents, no CO₂ — built into recipes designed to work
            with the plant&apos;s natural flavor instead of covering it up.
          </p>
          <p>
            Time in Fiji also showed him how modest conditions are for the
            farmers kava depends on. He believes wider adoption, done right,
            means more revenue reaching those growing communities directly.
            It&apos;s why Lumanai donates a share of every order to the South
            Pacific Islander Organization, supporting Pacific Islander education
            — 1% today, with plans to grow that as margins allow.
          </p>
        </div>
      </section>

      <section className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-3xl text-shell sm:text-4xl">Drink Different.</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-gold">
            All the buzz — none of the booze.
          </p>
        </div>
      </section>
    </>
  );
}
