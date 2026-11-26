import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog, type CatalogProduct } from "@/lib/catalog";
import ProductGrid from "@/components/ProductGrid";
import { lifestyleImages } from "@/lib/images";
import {
  artworkFor,
  gridPriceLabel,
  HIDE_PRICES,
  isHiddenFromShop,
  shopRank,
  shortName,
} from "@/lib/shop-display";

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
 * The shop, laid out like the old Shopify store: RUSH featured at the
 * top, then the 8 oz bottles, then the growlers — big bottles, four
 * across on a computer and two on a phone.
 */

// Market-table order (Ash): Basic Batch, Ginger, Kolada, Raspberry.
const FLAVOR_ORDER = ["basic-batch", "ginger", "kolada", "raspberry"];
function flavorRank(handle: string, name: string): number {
  const key = `${handle} ${shortName(handle, name)}`.toLowerCase();
  // Shopify gave the growlers "copy-of-…" handles, so match on the
  // display name as well as the handle.
  const i = FLAVOR_ORDER.findIndex((f) =>
    key.includes(f === "basic-batch" ? "basic" : f),
  );
  return i === -1 ? FLAVOR_ORDER.length : i;
}

export default async function ProductsPage() {
  const { items } = await getCatalog();

  const products = items
    .filter((p) => !isHiddenFromShop(p.handle, p.name))
    .sort((a, b) => shopRank(a.handle) - shopRank(b.handle));

  const rush = products.find((p) => p.category === "rush");
  const byFlavor = (a: CatalogProduct, b: CatalogProduct) =>
    flavorRank(a.handle, a.name) - flavorRank(b.handle, b.name);
  const bottles = products.filter((p) => p.category === "premium").sort(byFlavor);
  const growlers = products.filter((p) => p.category === "growler").sort(byFlavor);
  const rushArt = rush ? artworkFor(rush.handle) ?? rush.image : undefined;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="sr-only">Shop Lumanai kava — RUSH, bottles and growlers</h1>

      {/* ---------- RUSH, featured ---------- */}
      {rush && (
        <Link
          href={`/products/${rush.handle}`}
          className="group grid items-center gap-8 rounded-3xl border border-shell/10 bg-lagoon/20 px-6 py-10 sm:px-10 md:grid-cols-2 md:gap-12 md:py-14"
        >
          <div className="relative flex h-72 items-center justify-center sm:h-96">
            {rushArt && (
              <Image
                src={rushArt}
                alt={rush.imageAlt ?? rush.name}
                width={627}
                height={900}
                priority
                sizes="(min-width: 768px) 40vw, 80vw"
                className="h-full w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:-translate-y-2"
              />
            )}
          </div>
          <div className="text-center md:text-left">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
              Instant kava
            </p>
            <h2 className="h-sign mt-2 text-5xl leading-[0.95] text-shell sm:text-6xl">
              RUSH
            </h2>
            <p className="h-sign-med mt-3 text-xl text-coconut sm:text-2xl">
              Ceremonial-grade instant kava, ready in seconds.
            </p>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-shell/75 md:mx-0">
              100% noble Fijian kava, sun-dried from fresh-pressed root juice.
              Up to 30 servings. Stir it into water, juice or a smoothie.
            </p>
            {!HIDE_PRICES && (
              <p className="mt-5 font-mono text-lg text-gold">
                {gridPriceLabel(rush)}
              </p>
            )}
            <span className="btn-brush mt-6 inline-block text-xs font-bold uppercase tracking-[0.2em] text-shell">
              Shop RUSH
            </span>
          </div>
        </Link>
      )}

      {/* ---------- 8 oz bottles ---------- */}
      {bottles.length > 0 && (
        <div className="mt-16 sm:mt-24">
          <h2 className="h-sign mb-10 text-center text-4xl text-shell sm:mb-14 sm:text-5xl">
            8 oz <span className="text-coconut">Bottles</span>
          </h2>
          <ProductGrid products={bottles} size="large" />
        </div>
      )}

      {/* ---------- Growlers ---------- */}
      {growlers.length > 0 && (
        <div className="mt-16 sm:mt-24">
          <h2 className="h-sign text-center text-4xl text-shell sm:text-5xl">
            <span className="text-coconut">Growlers</span>
          </h2>
          <p className="mx-auto mb-10 mt-3 max-w-md text-center font-mono text-[11px] uppercase tracking-[0.18em] text-gold sm:mb-14">
            64 or 32 oz · Las Vegas pickup only · $6 refundable bottle deposit
          </p>
          <ProductGrid products={growlers} size="large" />
        </div>
      )}

      {products.length === 0 && (
        <p className="mt-16 text-center text-shell/60">
          The shop is restocking — check back shortly.
        </p>
      )}

      {/* The Small Batch Difference — carried over from the old
          Shopify products page. Below the grid so the bottles keep
          the first screen. */}
      <div className="mx-auto mt-20 max-w-3xl text-center sm:mt-28">
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
