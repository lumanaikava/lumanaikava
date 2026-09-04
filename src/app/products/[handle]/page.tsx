import Link from "next/link";
import { notFound } from "next/navigation";
import ProductPurchase from "@/components/ProductPurchase";
import { getCatalogProduct } from "@/lib/catalog";
import { shortName } from "@/lib/shop-display";

// Fetched from Shopify with 60s revalidation; falls back to static data.
export const dynamic = "force-dynamic";

const categoryLabel = {
  premium: "Original Naktail",
  growler: "Growler",
  rush: "Instant Kava",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getCatalogProduct(handle);
  return { title: product ? `${product.name} — Lumanai Kava` : "Lumanai Kava" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getCatalogProduct(handle);
  if (!product) notFound();

  return (
    <section className="mx-auto max-w-5xl px-6 py-8 sm:py-10">
      <Link
        href="/products"
        className="font-mono text-xs uppercase tracking-[0.2em] text-shell/50 hover:text-gold"
      >
        ← All Products
      </Link>

      <div className="mt-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
          {categoryLabel[product.category]}
        </p>
        <h1 className="h-sign mt-2 text-4xl text-shell sm:text-5xl">
          {shortName(product.handle, product.name)}
        </h1>
        {/* Open, not behind a toggle. This is the copy that sells the
            product — hiding it behind "Details" meant most visitors
            never saw a word of it. */}
        {product.descriptionHtml ? (
          <div
            className="product-copy mt-5 max-w-2xl text-sm leading-relaxed text-shell/75"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : (
          product.description && (
            <p className="mt-5 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-shell/75">
              {product.description}
            </p>
          )
        )}
      </div>

      <div className="mt-6">
        <ProductPurchase
          handle={product.handle}
          name={shortName(product.handle, product.name)}
          fallbackImage={product.image}
          imageAlt={product.imageAlt ?? product.name}
          variants={product.variants}
          available={product.available && product.live}
          singleVariantId={product.variantId}
          singlePriceLabel={product.variantPriceLabel}
          singleAmount={product.amount}
          sellingPlans={product.sellingPlans}
        />
      </div>

      <div>
          <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-shell/10 pt-8 text-sm sm:grid-cols-4">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/40">
                Source
              </dt>
              <dd className="mt-1 text-shell/80">
                Fiji &amp; Vanuatu cultivars
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/40">
                Extraction
              </dt>
              <dd className="mt-1 text-shell/80">
                Water only — no solvents, no CO₂
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/40">
                Impact
              </dt>
              <dd className="mt-1 text-shell/80">
                1% to South Pacific Islander Org.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/40">
                Coconuts earned
              </dt>
              <dd className="mt-1 text-shell/80">1 per $1 spent</dd>
            </div>
          </dl>
      </div>
    </section>
  );
}
