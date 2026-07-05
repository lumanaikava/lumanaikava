import Link from "next/link";
import type { Metadata } from "next";
import Ripple from "@/components/Ripple";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop — Lumanai Kava",
  description:
    "Lumanai Premium naktails and Growlers — bottled for one, poured for the table.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const filtered =
    category === "premium" || category === "growler"
      ? products.filter((p) => p.category === category)
      : products;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
        Shop
      </p>
      <h1 className="mt-4 font-display text-5xl italic sm:text-6xl">
        Lumanai Premium &amp; Growlers
      </h1>
      <p className="mt-4 max-w-lg text-shell/70">
        Water-extracted, traditional-strength kava — bottled for one or
        poured for the table.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {[
          { label: "All", value: undefined },
          { label: "Lumanai Premium", value: "premium" },
          { label: "Growlers", value: "growler" },
        ].map((tab) => {
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
            className="group block rounded-3xl border border-shell/10 bg-lagoon/40 p-7 backdrop-blur transition-colors hover:border-gold"
          >
            <Ripple className="h-8 w-8 text-orchid" rings={3} animated={false} />
            <h2 className="mt-6 font-display text-2xl italic text-shell">{p.name}</h2>
            <p className="mt-2 text-sm text-shell/60">{p.notes}</p>
            <div className="mt-6 flex items-center justify-between">
              <p className="font-mono text-sm text-gold">{p.priceLabel}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-shell/40">
                {p.reviewCount} reviews
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
