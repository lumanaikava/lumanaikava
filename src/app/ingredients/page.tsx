import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ingredients,
  categoryLabels,
  type Ingredient,
} from "@/lib/ingredients";

export const metadata: Metadata = {
  title: "Ingredients",
  description:
    "Every functional ingredient behind the Lumanai bar — noble kava, adaptogens, nootropics, minerals, and clean botanicals.",
};

// Real botanical photography from the brand's Canva deck, per category.
const categoryPhotos: Partial<Record<Ingredient["category"], string>> = {
  kava: "/images/botanicals/kava-root.webp",
  adaptogen: "/images/botanicals/schisandra.webp",
  nootropic: "/images/botanicals/lions-mane.webp",
  botanical: "/images/botanicals/damiana.webp",
  sweetener: "/images/botanicals/kanna.webp",
  mineral: "/images/botanicals/reishi.webp",
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
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-6 pb-8 pt-12">
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

      {/* Category cards: real photo + ingredient rows */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-5 px-6 py-10 md:grid-cols-2">
          {orderedCategories.map((cat) => {
            const rows = ingredients.filter((i) => i.category === cat);
            if (!rows.length) return null;
            const photo = categoryPhotos[cat];
            return (
              <div
                key={cat}
                className="overflow-hidden rounded-3xl border border-shell/10 bg-lagoon/30"
              >
                {photo && (
                  <div className="relative h-36 sm:h-44">
                    <Image
                      src={photo}
                      alt={categoryLabels[cat]}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-abyss/90 via-abyss/20 to-transparent" />
                    <h2 className="h-sign absolute bottom-3 left-5 text-3xl text-shell">
                      {categoryLabels[cat]}
                    </h2>
                  </div>
                )}
                <ul className="divide-y divide-shell/10 px-5">
                  {rows.map((ing) => (
                    <li
                      key={ing.slug}
                      className="flex items-center gap-4 py-3.5"
                    >
                      <Image
                        src={`/images/ingredients/${ing.slug}.png`}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 opacity-90"
                        aria-hidden
                      />
                      <div>
                        <h3 className="h-sign-med text-lg text-shell">
                          {ing.name}
                        </h3>
                        <p className="text-xs leading-relaxed text-shell/65">
                          {ing.claim}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-5 px-6 py-10">
          <p className="h-sign text-2xl text-shell">Ready to taste it?</p>
          <Link
            href="/menu"
            className="rounded-full bg-gold px-7 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell"
          >
            See the Menu
          </Link>
        </div>
      </section>
    </>
  );
}
