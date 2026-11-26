import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import {
  artworkFor,
  shortName,
  subtitleFor,
  isNew,
  HIDE_PRICES,
  gridPriceLabel,
} from "@/lib/shop-display";

/**
 * The product lineup: bottle cutouts and short names. Shared by the
 * shop page and the homepage so the two never drift apart. Callers
 * filter and sort; this only draws.
 */
export default function ProductGrid({
  products,
  size = "compact",
}: {
  products: CatalogProduct[];
  /** compact: the homepage strip. large: the shop page, two across on a
   *  phone and four on a computer, with big bottles and room to breathe. */
  size?: "compact" | "large";
}) {
  const large = size === "large";
  return (
    <>
    <div
      className={
        large
          ? "grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-4"
          : "grid grid-cols-3 gap-x-2 gap-y-5 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-5"
      }
    >
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
            <div
              className={`relative flex items-end justify-center ${
                large ? "h-60 sm:h-72 lg:h-80" : "h-28 sm:h-36 lg:h-40"
              }`}
            >
              {art ? (
                <Image
                  src={art}
                  alt={p.imageAlt ?? p.name}
                  width={340}
                  height={900}
                  sizes={
                    large
                      ? "(max-width: 1024px) 45vw, 22vw"
                      : "(max-width: 640px) 30vw, (max-width: 1024px) 22vw, 16vw"
                  }
                  className="h-full w-auto object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-1.5"
                />
              ) : (
                <div className="h-full w-full rounded-xl border border-shell/10" />
              )}
              {isNew(p.handle) && p.available && (
                <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-gold px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-abyss">
                  New
                </span>
              )}
              {!p.available && (
                <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-abyss/85 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-shell/80">
                  Sold out
                </span>
              )}
            </div>

            <h2
              className={`h-sign-med leading-tight text-shell transition-colors group-hover:text-gold ${
                large ? "mt-5 text-lg sm:text-xl" : "mt-2.5 text-[13px] sm:text-base"
              }`}
            >
              {shortName(p.handle, p.name)}
            </h2>
            {subtitleFor(p.handle) && (
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.13em] text-shell/40">
                {subtitleFor(p.handle)}
              </p>
            )}
            {!HIDE_PRICES && (
              <p
                className={`font-mono text-gold ${
                  large ? "mt-2 text-sm sm:text-base" : "mt-1 text-xs"
                }`}
              >
                {gridPriceLabel(p)}
                {p.compareAtLabel && p.variants.length <= 1 && (
                  <s className="ml-2 text-shell/45">{p.compareAtLabel}</s>
                )}
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
    </>
  );
}
