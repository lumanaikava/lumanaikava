import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import {
  isHiddenFromShop,
  shopRank,
  artworkFor,
  shortName,
  subtitleFor,
  HIDE_PRICES,
} from "@/lib/shop-display";

export const metadata: Metadata = {
  title: "Shop — Lumanai Kava",
  description:
    "Lumanai Original Naktails and RUSH instant kava — bottled for one, poured for the table.",
};

// Catalog comes from Shopify with 60s revalidation.
export const dynamic = "force-dynamic";

/**
 * Minimalist shop: artwork and a short name, nothing else.
 *
 * Prices are hidden while they're being finalised (see HIDE_PRICES), and
 * with them gone the old category tabs and the RUSH hero had nothing to
 * frame — so the page is one quiet grid instead.
 */
export default async function ProductsPage() {
  const { items } = await getCatalog();

  const products = items
    .filter((p) => !isHiddenFromShop(p.handle, p.name))
    .sort((a, b) => shopRank(a.handle) - shopRank(b.handle));

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
        Shop
      </p>
      <h1 className="h-sign mt-3 text-4xl text-shell sm:text-5xl">
        The lineup.
      </h1>

      <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const art = artworkFor(p.handle) ?? p.image;
          return (
            <Link
              key={p.handle}
              href={`/products/${p.handle}`}
              className="group block text-center"
            >
              {/* No card, no frame — the cutout sits straight on the
                  page so the bottles are the only thing you look at. */}
              <div className="relative mx-auto flex h-64 w-full items-end justify-center sm:h-72">
                {art ? (
                  <Image
                    src={art}
                    alt={p.imageAlt ?? p.name}
                    width={340}
                    height={900}
                    sizes="(max-width: 640px) 60vw, (max-width: 1024px) 30vw, 22vw"
                    className="h-full w-auto object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:-translate-y-2"
                  />
                ) : (
                  <div className="h-full w-full rounded-2xl border border-shell/10" />
                )}
                {!p.available && (
                  <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-abyss/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-shell/80">
                    Sold out
                  </span>
                )}
              </div>

              <h2 className="h-sign-med mt-6 text-xl text-shell transition-colors group-hover:text-gold">
                {shortName(p.handle, p.name)}
              </h2>
              {subtitleFor(p.handle) && (
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-shell/40">
                  {subtitleFor(p.handle)}
                </p>
              )}
              {!HIDE_PRICES && (
                <p className="mt-2 font-mono text-sm text-gold">
                  {p.priceLabel}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {products.length === 0 && (
        <p className="mt-16 text-shell/60">
          The shop is restocking — check back shortly.
        </p>
      )}
    </section>
  );
}
