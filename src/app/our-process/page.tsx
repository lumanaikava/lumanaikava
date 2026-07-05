import type { Metadata } from "next";
import Ripple from "@/components/Ripple";

export const metadata: Metadata = { title: "Our Process — Lumanai Kava" };

const steps = [
  {
    title: "Small-batch, in-house",
    copy: "No outsourced manufacturing, no warehouse minimums. Kavalactones lose potency the longer they sit suspended in water — so we make what we're about to sell.",
  },
  {
    title: "Our own cultivar blend",
    copy: "A proprietary blend of Fijian and Vanuatu cultivars that we keep refining, alongside the method itself.",
  },
  {
    title: "Water only, always",
    copy: "Traditional preparation plus techniques we've developed ourselves — never a solvent, never CO₂. Alcohol should never touch kava, whether as a mixer or an extraction shortcut.",
  },
  {
    title: "Fresh, washed, real",
    copy: "Ginger, raspberries, coconut milk — handled with the same technique you'd expect behind a cocktail bar, produce veggie-washed to clear pesticides, water run through reverse osmosis.",
  },
];

export default function OurProcessPage() {
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
            Our Process
          </p>
          <h1 className="mt-4 font-display text-4xl italic sm:text-5xl">
            Not all kava is created equal.
          </h1>
          <p className="mt-6 text-lg text-ink/70">
            Most competitors lean on extracts and outsourced manufacturing
            that requires large minimum orders. We build every batch
            ourselves, on purpose, in a way that keeps potency intact.
          </p>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-bilo text-bone">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="space-y-12">
            {steps.map((step) => (
              <div key={step.title} className="grid gap-3 sm:grid-cols-[1fr_2fr] sm:gap-8">
                <h2 className="font-display text-xl italic text-gold">
                  {step.title}
                </h2>
                <p className="text-bone/80">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="font-display text-2xl italic text-ink">
            The result is a difference you can taste, and a potency you can
            feel.
          </p>
        </div>
      </section>
    </>
  );
}
