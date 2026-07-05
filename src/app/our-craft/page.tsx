import Image from "next/image";
import type { Metadata } from "next";
import Ripple from "@/components/Ripple";
import { eventImages } from "@/lib/images";

export const metadata: Metadata = {
  title: "Our Craft — Lumanai Kava",
  description:
    "Every ingredient in a Lumanai drink was chosen on purpose — from Fijian kava root to sugar-free vanilla to the water we use.",
};

const principles = [
  {
    kicker: "Water only",
    title: "No solvents. No CO₂.",
    copy: "Every batch is water-extracted from whole Fijian and Vanuatu kava root. Alcohol and CO₂ pull compounds that don't belong in your drink — so we don't use them.",
  },
  {
    kicker: "Small-batch",
    title: "Made when it's ordered.",
    copy: "Kavalactones lose strength the longer they sit suspended in water, so we don't warehouse product. What you drink was made recently, on purpose.",
  },
  {
    kicker: "Real bar craft",
    title: "Handled like a real cocktail.",
    copy: "Fresh-pressed juice, muddled fruit, aquafaba foam, house-made sugar-free syrups. Every drink is built with technique — not shortcuts.",
  },
  {
    kicker: "Clean base",
    title: "Reverse-osmosis water.",
    copy: "The water is the biggest ingredient in every drink. We start with reverse-osmosis, so nothing in the tap ever makes it into your glass.",
  },
];

const specs = [
  { label: "Kava source", value: "Fiji + Vanuatu noble cultivars" },
  { label: "Extraction", value: "Water only — no solvents, no CO₂" },
  { label: "Testing", value: "Third-party lab, every batch" },
  { label: "Sweeteners", value: "House-made sugar-free syrups" },
  { label: "Produce", value: "Veggie-washed to clear pesticides" },
  { label: "Water", value: "Reverse-osmosis" },
  { label: "Certified", value: "Gluten-free · All-natural" },
];

export default function OurCraftPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src={eventImages.pouring}
          alt="Fresh-pressed pour from a Lumanai bar"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-abyss/70 to-abyss" />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-40 text-center sm:pt-48">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            Our Craft
          </p>
          <h1 className="mt-6 font-display text-5xl italic sm:text-7xl">
            Not all kava
            <span className="block text-orchid">is made equal.</span>
          </h1>
          <p className="mt-6 text-lg text-shell/80">
            Most brands buy an extract, cut it into a syrup, and slap a label
            on it. We don&apos;t. Everything at Lumanai starts from the root.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-6 md:grid-cols-2">
            {principles.map((p, i) => (
              <div
                key={p.title}
                className="rounded-3xl border border-shell/10 bg-lagoon/40 p-8 backdrop-blur"
              >
                <div className="flex items-center gap-4">
                  <Ripple className="h-9 w-9 text-orchid" rings={3} animated={false} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">
                    0{i + 1} · {p.kicker}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl italic text-shell">
                  {p.title}
                </h3>
                <p className="mt-4 text-shell/70">{p.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spec sheet */}
      <section className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-orchid">
            Spec sheet
          </p>
          <h2 className="mt-4 font-display text-3xl italic sm:text-4xl">
            Everything, on the record.
          </h2>
          <dl className="mt-10 divide-y divide-shell/10 border-y border-shell/10">
            {specs.map((s) => (
              <div
                key={s.label}
                className="grid gap-2 py-5 sm:grid-cols-[1fr_2fr] sm:gap-6"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-shell/50">
                  {s.label}
                </dt>
                <dd className="text-shell">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Bottom line */}
      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="font-display text-3xl italic text-shell sm:text-4xl">
            A difference you can taste, a potency you can feel.
          </p>
        </div>
      </section>
    </>
  );
}
