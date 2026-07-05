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
        className="font-mono text-xs uppercase tracking-[0.18em] text-shell/50 hover:text-gold"
      >
        ← All Products
      </Link>

      <div className="mt-8 grid gap-16 lg:grid-cols-2">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-shell/10 bg-abyss">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amethyst/40 via-transparent to-orchid/40" />
          <Ripple className="relative h-2/3 w-2/3 text-gold" rings={6} />
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            {product.category === "premium" ? "Lumanai Premium" : "Growler"}
          </p>
          <h1 className="mt-3 font-display text-5xl italic text-shell">
            {product.name}
          </h1>
          <p className="mt-3 font-mono text-sm text-shell/50">{product.notes}</p>
          <p className="mt-6 max-w-md text-shell/70">{product.description}</p>
          <p className="mt-8 font-mono text-2xl text-gold">{product.priceLabel}</p>

          <div className="mt-8">
            <AddToCartButton productName={product.name} />
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-shell/10 pt-8 text-sm">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-shell/40">
                Source
              </dt>
              <dd className="mt-1 text-shell/80">Fiji &amp; Vanuatu cultivars</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-shell/40">
                Extraction
              </dt>
              <dd className="mt-1 text-shell/80">Water only — no solvents, no CO₂</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-shell/40">
                Reviews
              </dt>
              <dd className="mt-1 text-shell/80">{product.reviewCount} reviews</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-shell/40">
                Coconuts earned
              </dt>
              <dd className="mt-1 text-shell/80">
                {product.price} coconuts per bottle
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
