/**
 * Catalog view-model — one shape the shop pages render, whether the data
 * came live from Shopify or from the static fallback in products.ts.
 * If Shopify is unreachable (or env vars are missing), the shop still works.
 */

import { getAllProducts, getProductByHandle, formatPrice } from "@/lib/integrations/shopify";
import type { ShopifyProduct } from "@/lib/integrations/shopify";
import { products as staticProducts, getProduct as getStaticProduct } from "@/lib/products";

export type CatalogProduct = {
  handle: string;
  name: string;
  notes: string;
  description: string;
  priceLabel: string;
  category: "premium" | "growler" | "rush";
  image?: string;
  imageAlt?: string;
  available: boolean;
  /** Shopify variant GID — present only when the product came from the live catalog. */
  variantId?: string;
  live: boolean;
};

function inferCategory(title: string): CatalogProduct["category"] {
  const t = title.toLowerCase();
  if (t.includes("rush")) return "rush";
  if (t.includes("growler") || t.includes("64 oz")) return "growler";
  return "premium";
}

/** First sentence, capped at a word boundary with an ellipsis. */
function blurb(text: string, max = 90): string {
  const first = text.split(".")[0] ?? "";
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

function fromShopify(p: ShopifyProduct): CatalogProduct {
  const firstAvailable =
    p.variants.edges.find((v) => v.node.availableForSale)?.node ??
    p.variants.edges[0]?.node;
  return {
    handle: p.handle,
    name: p.title,
    notes: blurb(p.description),
    description: p.description,
    priceLabel: formatPrice(
      p.priceRange.minVariantPrice.amount,
      p.priceRange.minVariantPrice.currencyCode
    ),
    category: inferCategory(p.title),
    image: p.featuredImage?.url,
    imageAlt: p.featuredImage?.altText ?? p.title,
    available: p.availableForSale,
    variantId: firstAvailable?.id,
    live: true,
  };
}

function fromStatic(p: (typeof staticProducts)[number]): CatalogProduct {
  return {
    handle: p.handle,
    name: p.name,
    notes: p.notes,
    description: p.description,
    priceLabel: p.priceLabel,
    category: p.category === "growler" ? "growler" : "premium",
    image: p.image,
    imageAlt: p.name,
    available: true,
    live: false,
  };
}

export async function getCatalog(): Promise<{ items: CatalogProduct[]; live: boolean }> {
  try {
    const live = await getAllProducts();
    if (live.length > 0) return { items: live.map(fromShopify), live: true };
  } catch (err) {
    console.error("[catalog] Shopify unavailable, using static fallback:", err);
  }
  return { items: staticProducts.map(fromStatic), live: false };
}

export async function getCatalogProduct(handle: string): Promise<CatalogProduct | null> {
  try {
    const live = await getProductByHandle(handle);
    if (live) return fromShopify(live);
  } catch (err) {
    console.error("[catalog] Shopify unavailable, using static fallback:", err);
  }
  const fallback = getStaticProduct(handle);
  return fallback ? fromStatic(fallback) : null;
}
