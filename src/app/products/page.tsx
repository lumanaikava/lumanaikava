import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import ProductGrid from "@/components/ProductGrid";
import { lifestyleImages } from "@/lib/images";
import { isHiddenFromShop, shopRank } from "@/lib/shop-display";

export const metadata: Metadata = {
  // The root layout appends " — Lumanai Kava"; naming the brand
  // here too rendered "Shop — Lumanai Kava — Lumanai Kava".
  title: "Shop",
  description:
    "Lumanai kava cocktails, growlers and RUSH instant kava.",
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
      {/* The page deliberately shows no title — the bottles are the
          content. Search engines and screen readers still need one, so
          it's here and invisible rather than absent. */}
      <h1 className="sr-only">Shop Lumanai kava — bottles, growlers and RUSH</h1>
      <ProductGrid products={products} />

      {/* The Small Batch Difference — carried over from the old
          Shopify products page. Below the grid so the bottles keep
          the first screen. */}
      <div className="mx-auto mt-14 max-w-3xl text-center sm:mt-20">
        <h2 className="h-sign text-4xl leading-[0.95] text-shell sm:text-5xl">
          The small batch <span className="text-coconut">difference.</span>
        </h2>
        <p className="h-sign-med mt-4 text-lg text-gold sm:text-xl">
          You&apos;ve never tried ready-to-drink kava like this.
        </p>
        <p className="mt-6 leading-relaxed text-shell/75">
          We spent years formulating these delicious, hand-crafted
          non-alcoholic cocktails using advanced craft cocktail and culinary
          techniques. Each 8 oz bottle is roughly the same strength as 8 oz of
          your average kava bar kava, with the exception of our Basic Batch,
          which is nearly twice as strong.{" "}
          <strong className="font-semibold text-shell">
            Our premium noble kava is hand-pressed without the use of CO2 or
            solvents and is third party tested for purity.
          </strong>{" "}
          Read more about our process{" "}
          <Link href="/our-process" className="prose-link text-gold">
            here
          </Link>
          .
        </p>
        <p className="mt-4 leading-relaxed text-shell/75">
          We only use high-quality, all-natural ingredients and reverse
          osmosis water.
        </p>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.22em] text-gold">
          Bundle and subscription discounts available
        </p>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.22em] text-gold">
          4 bottle order minimum
        </p>
      </div>

      {/* Lifestyle band — below the lineup so the bottles still own the
          first screen. */}
      <div className="mt-12 grid items-center gap-6 overflow-hidden rounded-3xl border border-shell/10 bg-lagoon/30 sm:mt-16 sm:grid-cols-2">
        <div className="relative aspect-[3/4] sm:aspect-[4/5]">
          <Image
            src={lifestyleImages.trailSip}
            alt="Sipping Lumanai kava on a boulder in the mountains outside Las Vegas"
            fill
            sizes="(min-width: 640px) 560px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="px-6 pb-8 sm:px-8 sm:pb-0">
          <h2 className="h-sign text-4xl text-shell sm:text-5xl">
            Take it <span className="text-coconut">out.</span>
          </h2>
          <p className="mt-4 max-w-sm text-shell/70">
            The bar, bottled. Trailhead, rooftop, your couch.
          </p>
        </div>
      </div>
    </section>
  );
}
