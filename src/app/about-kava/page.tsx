import type { Metadata } from "next";
import Link from "next/link";
import Ripple from "@/components/Ripple";

export const metadata: Metadata = { title: "About Kava — Lumanai Kava" };

export default function AboutKavaPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10">
        <Ripple
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 text-jade/15"
          rings={5}
          animated={false}
        />
        <div className="relative mx-auto max-w-3xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-jade">
            About Kava
          </p>
          <h1 className="mt-4 font-display text-4xl italic sm:text-5xl">
            A root, a bowl, 3,000 years of practice.
          </h1>
          <p className="mt-6 text-lg text-ink/70">
            Kava (Piper methysticum) is a pepper-family plant whose rootstock
            has been prepared as a beverage across Fiji, Tonga, Samoa, and
            Hawai&apos;i for roughly three millennia. It&apos;s valued for
            relaxing, anxiolytic, and mood-lifting properties — generally
            mild, though effects intensify at higher doses.
          </p>
        </div>
      </section>

      <section className="border-b border-ink/10">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-display text-2xl italic">How it works</h2>
          <p className="mt-4 text-ink/70">
            The active compounds, kavalactones, interact with the brain&apos;s
            GABA receptors and slow the reuptake of serotonin and dopamine.
            Like alcohol, kava engages GABA receptors — which is exactly why
            it works as a social facilitator. Plenty of people use it
            specifically to cut back on drinking.
          </p>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-bilo text-bone">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-display text-2xl italic">
            On the liver-damage claims
          </h2>
          <div className="mt-4 space-y-4 text-bone/80">
            <p>
              We don&apos;t wave this away — we address it directly. The
              concerning research from the 1990s used isolated kavalactones
              in tablet form, solvent-extracted, with participants who were
              also drinking alcohol. The liver failure cases on record
              involved concurrent acetaminophen use, not kava alone.
            </p>
            <p>
              A 2007 WHO review found that traditional, water-based kava
              rarely causes liver issues — solvent-extracted products carried
              the real risk. Current evidence points to traditional aqueous
              kava having no meaningful potential for liver damage. It&apos;s
              why we extract with water only, never solvents or CO₂.
            </p>
            <p className="text-sm text-bone/50">
              This isn&apos;t medical advice. Talk to a doctor if you have
              specific concerns.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-2xl italic">
            Curious how it tastes?
          </h2>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-ink px-7 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-bone hover:bg-jade"
          >
            Shop Lumanai
          </Link>
        </div>
      </section>
    </>
  );
}
