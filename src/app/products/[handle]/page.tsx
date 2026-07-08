import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Ripple from "@/components/Ripple";
import BuyNowButton from "@/components/BuyNowButton";
import { getCatalogProduct } from "@/lib/catalog";

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
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Link
        href="/products"
        className="font-mono text-xs uppercase tracking-[0.2em] text-shell/50 hover:text-gold"
      >
        ← All Products
      </Link>

      <div className="mt-8 grid gap-16 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-shell/10 bg-shell">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.imageAlt ?? product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain object-center p-10"
              priority
            />
          ) : (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amethyst/40 via-transparent to-amethyst/40">
              <Ripple className="h-2/3 w-2/3 text-gold" rings={6} />
            </div>
          )}
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            {categoryLabel[product.category]}
          </p>
          <h1 className="h-sign mt-3 text-5xl text-shell sm:text-6xl">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-6 max-w-md whitespace-pre-line text-shell/70">
              {product.description}
            </p>
          )}
          <p className="mt-8 font-mono text-2xl text-gold">
            {product.priceLabel}
          </p>

          <div className="mt-8">
            <BuyNowButton
              variantId={product.variantId}
              available={product.available && product.live}
              productName={product.name}
            />
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-shell/10 pt-8 text-sm">
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
      </div>
    </section>
  );
}
