import Link from "next/link";
import type { Metadata } from "next";
import Ripple from "@/components/Ripple";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products — Lumanai Kava",
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
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-jade">
        Shop
      </p>
      <h1 className="mt-3 font-display text-4xl italic sm:text-5xl">
        Lumanai Premium &amp; Growlers
      </h1>
      <p className="mt-4 max-w-lg text-ink/70">
        Water-extracted, traditional-strength kava — bottled for one or
        poured for the table.
      </p>

      <div className="mt-8 flex gap-3">
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
              className={`rounded-full border px-5 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors ${
                active
                  ? "border-ink bg-ink text-bone"
                  : "border-ink/20 text-ink/70 hover:border-jade hover:text-jade"
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
            className="group block rounded-2xl border border-ink/10 bg-white/40 p-7 transition-colors hover:border-jade"
          >
            <Ripple className="h-8 w-8 text-jade/70" rings={3} animated={false} />
            <h2 className="mt-6 font-display text-xl">{p.name}</h2>
            <p className="mt-2 text-sm text-ink/60">{p.notes}</p>
            <div className="mt-6 flex items-center justify-between">
              <p className="font-mono text-sm text-gold">{p.priceLabel}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/40">
                {p.reviewCount} reviews
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
