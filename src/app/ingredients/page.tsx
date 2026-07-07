import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ingredients, categoryLabels, type Ingredient } from "@/lib/ingredients";

export const metadata: Metadata = {
  title: "Ingredients — Lumanai Kava",
  description:
    "Every functional ingredient behind the Lumanai bar — noble kava, adaptogens, nootropics, minerals, and clean botanicals — and exactly what each one is doing in your glass.",
};

const orderedCategories: Ingredient["category"][] = [
  "kava",
  "adaptogen",
  "nootropic",
  "mineral",
  "botanical",
  "sweetener",
];

export default function IngredientsPage() {
  return (
    <>
      {/* Hero — signature roots pattern, straight off the bar sign */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url(/images/roots-hero.webp)" }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-abyss/40 via-transparent to-ocean" />
        <div className="pointer-events-none absolute -right-32 top-16 h-[420px] w-[420px] rounded-full bg-orchid/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-amethyst/30 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-32 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            Our ingredients · Our purpose
          </p>
          <h1 className="h-sign mt-6 text-6xl text-shell sm:text-8xl">
            Every drink,
            <br />
            <span className="text-orchid">on the record.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-shell/80">
            Nothing in a Lumanai glass is decoration. Every botanical, root,
            berry, and mineral is here for a reason — and here&apos;s exactly
            what each one is doing while you sip.
          </p>
        </div>
      </section>

      {/* Ingredients grouped by category */}
      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          {orderedCategories.map((cat) => {
            const rows = ingredients.filter((i) => i.category === cat);
            if (!rows.length) return null;
            return (
              <div key={cat} className="mt-16 first:mt-0">
                <div className="flex items-end justify-between border-b border-shell/15 pb-4">
                  <h2 className="h-sign-med text-3xl text-gold sm:text-4xl">
                    {categoryLabels[cat]}
                  </h2>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-shell/50">
                    {rows.length} {rows.length === 1 ? "ingredient" : "ingredients"}
                  </p>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {rows.map((ing) => (
                    <div
                      key={ing.slug}
                      className="rounded-2xl border border-shell/10 bg-lagoon/40 p-6 backdrop-blur"
                    >
                      <div className="flex items-start gap-5">
                        <Image
                          src={`/images/ingredients/${ing.slug}.png`}
                          alt=""
                          width={56}
                          height={56}
                          className="mt-1 h-14 w-14 shrink-0 opacity-90"
                          aria-hidden
                        />
                        <div>
                          <h3 className="h-sign-med text-2xl text-shell">
                            {ing.name}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-shell/70">
                            {ing.claim}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Purity strip */}
      <section className="border-y border-shell/10 bg-abyss">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            The clean-list
          </p>
          <h2 className="h-sign mt-4 text-4xl text-shell sm:text-5xl">
            Nothing sketchy behind the bar.
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "All natural",
              "Gluten-free",
              "3rd party tested",
              "Sugar-free syrups",
              "No solvents",
              "No CO₂ extraction",
              "Reverse-osmosis water",
              "Veggie-washed produce",
            ].map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-shell/15 px-5 py-3 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-shell/80"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="h-sign text-4xl text-shell sm:text-5xl">
            Ready to taste it?
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/menu"
              className="rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss hover:bg-shell"
            >
              See The Menu
            </Link>
            <Link
              href="/events#book"
              className="rounded-full border border-shell/30 px-8 py-4 font-mono text-xs uppercase tracking-[0.18em] text-shell hover:border-gold hover:text-gold"
            >
              Book the Bar
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
