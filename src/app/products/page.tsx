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
  isNew,
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
    /* Sized so the whole lineup lands in one screen — no title, no
       eyebrow, no tabs. Three across on a phone, five on a desktop,
       which puts nine products in three short rows or two. */
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid grid-cols-3 gap-x-2 gap-y-5 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-5">
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
              <div className="relative flex h-28 items-end justify-center sm:h-36 lg:h-40">
                {art ? (
                  <Image
                    src={art}
                    alt={p.imageAlt ?? p.name}
                    width={340}
                    height={900}
                    sizes="(max-width: 640px) 30vw, (max-width: 1024px) 22vw, 16vw"
                    className="h-full w-auto object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-1.5"
                  />
                ) : (
                  <div className="h-full w-full rounded-xl border border-shell/10" />
                )}
                {isNew(p.handle) && p.available && (
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-gold px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-abyss">
                    New
                  </span>
                )}
                {!p.available && (
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-abyss/85 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-shell/80">
                    Sold out
                  </span>
                )}
              </div>

              <h2 className="h-sign-med mt-2.5 text-[13px] leading-tight text-shell transition-colors group-hover:text-gold sm:text-base">
                {shortName(p.handle, p.name)}
              </h2>
              {subtitleFor(p.handle) && (
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-shell/35 sm:text-[10px]">
                  {subtitleFor(p.handle)}
                </p>
              )}
              {!HIDE_PRICES && (
                <p className="mt-1 font-mono text-xs text-gold">
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
