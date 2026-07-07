import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Ripple from "@/components/Ripple";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop — Lumanai Kava",
  description:
    "Lumanai Original Naktails, Growlers, and RUSH instant kava — bottled for one, poured for the table.",
};

// Catalog comes from Shopify with 60s revalidation.
export const dynamic = "force-dynamic";

const tabs = [
  { label: "All", value: undefined },
  { label: "Original Naktails", value: "premium" },
  { label: "Growlers", value: "growler" },
  { label: "RUSH", value: "rush" },
] as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const { items } = await getCatalog();

  // RUSH instant kava is the featured hero product; everything else grids below.
  const featured = items.find((p) => p.category === "rush");
  const rest = featured ? items.filter((p) => p.handle !== featured.handle) : items;

  const filtered =
    category === "premium" || category === "growler" || category === "rush"
      ? items.filter((p) => p.category === category)
      : rest;
  const showFeatured = !category && featured;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
        Shop
      </p>
      <h1 className="h-sign mt-3 text-4xl text-shell sm:text-5xl">
        Lumanai Original Naktails <span className="text-orchid">&amp; Growlers</span>
      </h1>

      {showFeatured && (
        <Link
          href={`/products/${featured.handle}`}
          className="group relative mt-8 block overflow-hidden rounded-3xl border border-gold/40 bg-abyss transition-colors hover:border-gold"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: "url(/images/roots-texture.webp)" }}
            aria-hidden
          />
          <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-shell sm:aspect-[4/3] lg:aspect-square">
              {featured.image ? (
                <Image
                  src={featured.image}
                  alt={featured.imageAlt ?? featured.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain object-center p-8 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <Ripple className="h-1/2 w-1/2 text-abyss/60" rings={5} animated={false} />
              )}
            </div>
            <div>
              <p className="inline-block rounded-full border border-gold/50 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                Featured · New
              </p>
              <h2 className="h-sign mt-5 text-4xl text-shell sm:text-6xl">
                {featured.name}
              </h2>
              <p className="mt-4 max-w-md text-shell/75">
                Kava anywhere, in seconds — tear, pour, stir. Traditional
                strength without the brew time.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <span className="rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss transition-colors group-hover:bg-shell">
                  Shop RUSH
                </span>
                <span className="font-mono text-2xl text-gold">
                  {featured.priceLabel}
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="mt-12 flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const active = category === tab.value || (!category && !tab.value);
          return (
            <Link
              key={tab.label}
              href={tab.value ? `/products?category=${tab.value}` : "/products"}
              className={`rounded-full border px-5 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors ${
                active
                  ? "border-gold bg-gold text-abyss"
                  : "border-shell/20 text-shell/70 hover:border-gold hover:text-gold"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Link
            key={p.handle}
            href={`/products/${p.handle}`}
            className="group block overflow-hidden rounded-3xl border border-shell/10 bg-lagoon/40 backdrop-blur transition-colors hover:border-gold"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-shell">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.imageAlt ?? p.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain object-center p-6 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Ripple className="h-1/2 w-1/2 text-abyss/60" rings={5} animated={false} />
                </div>
              )}
              {!p.available && (
                <p className="absolute left-4 top-4 rounded-full bg-abyss/85 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-shell">
                  Sold out
                </p>
              )}
            </div>
            <div className="p-7">
              <h2 className="h-sign-med text-2xl text-shell">{p.name}</h2>
              {p.notes && <p className="mt-2 text-sm text-shell/60">{p.notes}</p>}
              <p className="mt-6 font-mono text-sm text-gold">{p.priceLabel}</p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-shell/60">
          Nothing in this category right now — check{" "}
          <Link href="/products" className="prose-link text-shell hover:text-gold">
            the full shop
          </Link>
          .
        </p>
      )}
    </section>
  );
}
