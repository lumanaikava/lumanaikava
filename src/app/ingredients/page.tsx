import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ingredients,
  categoryLabels,
  type Ingredient,
} from "@/lib/ingredients";
import { drinksWithIngredient } from "@/lib/drinks-db";

export const metadata: Metadata = {
  title: "Ingredients",
  description:
    "Every functional ingredient behind the Lumanai bar — noble kava, adaptogens, nootropics, minerals, and clean botanicals.",
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
      {/* Slim header */}
      <section className="border-b border-shell/10">
        <div className="mx-auto flex max-w-4xl flex-wrap items-end justify-between gap-4 px-6 pb-8 pt-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
              Our ingredients · Our purpose
            </p>
            <h1 className="h-sign mt-3 text-5xl text-shell sm:text-6xl">
              Every drink, <span className="text-coconut">on the record.</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "All natural",
              "Gluten-free",
              "3rd party tested",
              "Sugar-free",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-shell/20 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-shell/75"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Concise list — tap a row for benefits + where it pours */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-10">
          {orderedCategories.map((cat) => {
            const rows = ingredients.filter((i) => i.category === cat);
            if (!rows.length) return null;
            return (
              <div key={cat} className="mb-8 last:mb-0">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                  {categoryLabels[cat]}
                </h2>
                <ul className="mt-3 divide-y divide-shell/10 border-y border-shell/10">
                  {rows.map((ing) => {
                    const pouredIn = drinksWithIngredient(ing.slug);
                    return (
                      <li key={ing.slug}>
                        <details className="group">
                          <summary className="flex cursor-pointer list-none items-center gap-4 py-3.5 [&::-webkit-details-marker]:hidden">
                            <Image
                              src={`/images/ingredients/${ing.slug}.png`}
                              alt=""
                              width={32}
                              height={32}
                              className="h-8 w-8 shrink-0 opacity-90"
                              aria-hidden
                            />
                            <span className="h-sign-med flex-1 text-lg text-shell transition-colors group-hover:text-gold group-open:text-gold">
                              {ing.name}
                            </span>
                            <span
                              className="text-gold transition-transform duration-300 group-open:rotate-45"
                              aria-hidden
                            >
                              +
                            </span>
                          </summary>
                          <div className="pb-5 pl-12 pr-2">
                            <p className="max-w-xl text-sm leading-relaxed text-shell/75">
                              {ing.claim}
                            </p>
                            {pouredIn.length > 0 && (
                              <p className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/45">
                                  Found in
                                </span>
                                {pouredIn.map((d) => (
                                  <Link
                                    key={d.slug}
                                    href="/menu"
                                    className="rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-colors hover:border-gold hover:text-gold"
                                    style={{
                                      borderColor: `${d.accent}66`,
                                      color: d.accent,
                                    }}
                                  >
                                    {d.name}
                                  </Link>
                                ))}
                              </p>
                            )}
                          </div>
                        </details>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-6 py-10">
          <p className="h-sign text-2xl text-shell">Ready to taste it?</p>
          <Link
            href="/menu"
            className="btn-brush font-mono text-xs font-bold uppercase tracking-[0.2em] text-shell"
          >
            See the Menu
          </Link>
        </div>
      </section>
    </>
  );
}
