import type { Metadata } from "next";
import Link from "next/link";
import Ripple from "@/components/Ripple";

export const metadata: Metadata = { title: "Private Catering — Lumanai Kava" };

export default function PrivateCateringPage() {
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
            Private Catering
          </p>
          <h1 className="mt-4 font-display text-4xl italic sm:text-5xl">
            The non-alcohol experience you can feel.
          </h1>
          <p className="mt-6 text-lg text-ink/70">
            Founder and mixologist Etienne Asher builds a personalized menu
            of kava cocktails and non-alcoholic spirits around your event —
            as a standalone bar, or alongside a traditional one at a
            mixed-soirée.
          </p>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-bilo text-bone">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-xl italic text-gold">
                What's included
              </h2>
              <p className="mt-3 text-bone/80">
                The freshest, highest-quality ingredients in every glass,
                trained staff who anticipate what your guests need, and a
                menu shaped around your event from first consultation
                through last call.
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl italic text-gold">
                Where we work
              </h2>
              <p className="mt-3 text-bone/80">
                Currently booking Los Angeles and Las Vegas events, with
                availability open for Fall 2026.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-2xl italic">
            Planning an event?
          </h2>
          <p className="mt-3 text-ink/70">
            Reach out for a quote — tell us your date, city, and guest count.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-ink px-7 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-bone hover:bg-jade"
          >
            Request a Quote
          </Link>
        </div>
      </section>
    </>
  );
}
