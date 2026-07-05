import Link from "next/link";
import { notFound } from "next/navigation";
import Ripple from "@/components/Ripple";
import AddToCartButton from "@/components/AddToCartButton";
import { products, getProduct } from "@/lib/products";

export function generateStaticParams() {
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = getProduct(handle);
  return { title: product ? `${product.name} — Lumanai Kava` : "Lumanai Kava" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Link
        href="/products"
        className="font-mono text-xs uppercase tracking-[0.15em] text-ink/50 hover:text-jade"
      >
        ← All Products
      </Link>

      <div className="mt-8 grid gap-16 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-3xl border border-ink/10 bg-bilo">
          <Ripple className="h-2/3 w-2/3 text-gold" rings={6} />
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-jade">
            {product.category === "premium" ? "Lumanai Premium" : "Growler"}
          </p>
          <h1 className="mt-3 font-display text-4xl italic">{product.name}</h1>
          <p className="mt-3 font-mono text-sm text-ink/50">{product.notes}</p>
          <p className="mt-6 max-w-md text-ink/70">{product.description}</p>
          <p className="mt-8 font-mono text-2xl text-gold">{product.priceLabel}</p>

          <div className="mt-8">
            <AddToCartButton productName={product.name} />
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-ink/10 pt-8 text-sm">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/40">
                Source
              </dt>
              <dd className="mt-1 text-ink/80">Fiji &amp; Vanuatu cultivars</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/40">
                Extraction
              </dt>
              <dd className="mt-1 text-ink/80">Water only — no solvents, no CO₂</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/40">
                Reviews
              </dt>
              <dd className="mt-1 text-ink/80">{product.reviewCount} reviews</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/40">
                Impact
              </dt>
              <dd className="mt-1 text-ink/80">1% to South Pacific Islander Org.</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
