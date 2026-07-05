import type { Metadata } from "next";
import Ripple from "@/components/Ripple";

export const metadata: Metadata = { title: "Our Story — Lumanai Kava" };

export default function OurStoryPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10">
        <Ripple
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 text-jade/15"
          rings={5}
          animated={false}
        />
        <div className="relative mx-auto max-w-3xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-jade">
            Our Story
          </p>
          <h1 className="mt-4 font-display text-4xl italic sm:text-5xl">
            Lumana&apos;i — Samoan for &ldquo;the future.&rdquo;
          </h1>
        </div>
      </section>

      <section className="border-b border-ink/10">
        <div className="mx-auto max-w-3xl space-y-6 px-6 py-20 text-ink/80">
          <p>
            Founder and CEO Etienne Asher first encountered kava in 2015,
            after running into it as a wellness product long before he
            understood it as a beverage tradition. Two years earlier, in
            2013, he&apos;d trained under Julian Cox — at the time, LA&apos;s
            top mixologist — learning cocktail craft in the city&apos;s best
            bars.
          </p>
          <p>
            Traditional kava&apos;s flavor is an acquired taste, and Asher
            saw that as the real barrier to it ever going mainstream. So he
            applied what he&apos;d learned behind the bar: a strong,
            water-extracted kava — no solvents, no CO₂ — built into recipes
            designed to work with the plant&apos;s natural flavor instead of
            covering it up.
          </p>
          <p>
            Time in Fiji also showed him how modest conditions are for the
            farmers kava depends on. He believes wider adoption, done right,
            means more revenue reaching those growing communities directly —
            which is the whole reason Lumanai donates a share of every
            online order to the South Pacific Islander Organization,
            supporting Pacific Islander education. It&apos;s 1% today, with
            plans to grow that as margins allow.
          </p>
        </div>
      </section>
    </>
  );
}
