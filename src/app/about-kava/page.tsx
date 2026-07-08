import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Ripple from "@/components/Ripple";
import { eventImages } from "@/lib/images";

export const metadata: Metadata = { title: "Our Kava — Lumanai Kava" };

export default function AboutKavaPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <Image
          src={eventImages.drinkClose3}
          alt="A Lumanai kava drink garnished with fresh fruit"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-abyss/70 to-abyss" />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-40 text-center sm:pt-48">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            Our Kava
          </p>
          <h1 className="h-sign mt-6 text-6xl text-shell sm:text-8xl">
            A root. A bowl.
            <span className="block text-coconut">3,000 years of practice.</span>
          </h1>
          <p className="mt-6 text-lg text-shell/80">
            Kava is a pepper-family plant whose root has been prepared as a
            beverage across the South Pacific for roughly three millennia —
            valued for relaxing, mood-lifting properties that are mild by nature
            but real.
          </p>
        </div>
      </section>

      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-coconut">
            How it works
          </p>
          <h2 className="h-sign mt-4 text-4xl text-shell sm:text-5xl">
            Same receptors as a drink, none of the fallout.
          </h2>
          <p className="mt-6 text-shell/80">
            The active compounds — kavalactones — bind to GABA receptors and
            slow the reuptake of serotonin and dopamine. Alcohol works on the
            same GABA system, which is exactly why kava works as a social drink:
            it loosens the room without the wreckage. Plenty of people use it
            specifically to cut back on drinking.
          </p>
        </div>
      </section>

      <section className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            About the liver-damage claims
          </p>
          <h2 className="h-sign mt-4 text-4xl text-shell sm:text-5xl">
            Straight answer: not from kava like ours.
          </h2>
          <div className="mt-6 space-y-4 text-shell/80">
            <p>
              The alarming research from the 1990s used solvent-extracted,
              isolated kavalactones — in tablet form, taken alongside alcohol.
              The liver failure cases on record involved concurrent
              acetaminophen. That&apos;s not what you&apos;re drinking at a
              Lumanai bar.
            </p>
            <p>
              A 2007 WHO review found traditional, water-based kava rarely
              causes hepatic issues. Current evidence points to water-extracted
              kava having no meaningful potential for liver damage. It&apos;s
              why we extract with water only.
            </p>
            <p className="text-sm text-shell/50">
              This isn&apos;t medical advice. Talk to a doctor if you have
              specific concerns.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Ripple
            className="mx-auto h-16 w-16 text-coconut/70"
            rings={4}
            animated={false}
          />
          <h2 className="h-sign mt-8 text-4xl text-shell sm:text-5xl">
            Ready to try it?
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/menu"
              className="rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell"
            >
              See The Menu
            </Link>
            <Link
              href="/events#book"
              className="rounded-full border border-shell/30 px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-shell hover:border-gold hover:text-gold"
            >
              Book the Bar
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
