/**
 * Catalog view-model — one shape the shop pages render, whether the data
 * came live from Shopify or from the static fallback in products.ts.
 * If Shopify is unreachable (or env vars are missing), the shop still works.
 */

import {
  getAllProducts,
  getProductByHandle,
  formatPrice,
} from "@/lib/integrations/shopify";
import type { ShopifyProduct, SellingPlan } from "@/lib/integrations/shopify";
import { sellingPlansOf } from "@/lib/integrations/shopify";
import {
  products as staticProducts,
  getProduct as getStaticProduct,
} from "@/lib/products";

/**
 * The Aug 28 party ticket lives in Shopify under this handle but never
 * appears in shop listings — it's only purchasable through the
 * password-gated /invited page.
 */
export const PARTY_TICKET_HANDLE = "kava-party-ticket";

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
  /**
   * The chosen variant's own price, as a number and as a label.
   *
   * `priceLabel` above is the range's minimum — right for a grid that
   * says "from $35" — but the cart has to total what will actually be
   * charged for the variant going into it.
   */
  amount: number;
  variantPriceLabel: string;
  /** Variant title, when the product has a real one to show. */
  variantName?: string;
  /**
   * Every purchasable variant, for products sold in more than one size.
   * The page picks one; the cart line follows whichever is chosen.
   */
  variants: {
    variantId: string;
    title: string;
    amount: number;
    priceLabel: string;
    available: boolean;
  }[];
  /**
   * Subscribe & save options, when the product has any. Empty for
   * one-time-only products (RUSH, party tickets), which is what keeps
   * the selector off pages where it would be meaningless.
   */
  sellingPlans: SellingPlan[];
  live: boolean;
};

/** Shopify's name for the lone variant of a single-variant product. */
const DEFAULT_VARIANT_TITLE = "Default Title";

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
  const variantPrice =
    firstAvailable?.price ?? p.priceRange.minVariantPrice;
  return {
    handle: p.handle,
    name: p.title,
    notes: blurb(p.description),
    description: p.description,
    priceLabel: formatPrice(
      p.priceRange.minVariantPrice.amount,
      p.priceRange.minVariantPrice.currencyCode,
    ),
    category: inferCategory(p.title),
    image: p.featuredImage?.url,
    imageAlt: p.featuredImage?.altText ?? p.title,
    available: p.availableForSale,
    variantId: firstAvailable?.id,
    amount: Number(variantPrice.amount),
    variantPriceLabel: formatPrice(
      variantPrice.amount,
      variantPrice.currencyCode,
    ),
    variantName:
      firstAvailable && firstAvailable.title !== DEFAULT_VARIANT_TITLE
        ? firstAvailable.title
        : undefined,
    variants: p.variants.edges
      .filter(({ node }) => node.title !== DEFAULT_VARIANT_TITLE)
      .map(({ node }) => ({
        variantId: node.id,
        title: node.title,
        amount: Number(node.price.amount),
        priceLabel: formatPrice(node.price.amount, node.price.currencyCode),
        available: node.availableForSale,
      })),
    sellingPlans: sellingPlansOf(p),
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
    // Static fallback data has no Shopify ids, so it can't offer a
    // subscription — the plan ids only exist on the live product.
    sellingPlans: [],
    amount: p.price,
    // The static labels read "From $35.00", which would be a lie on a
    // cart line. Nothing static is buyable (no variantId), but the
    // number is the honest one either way.
    variantPriceLabel: formatPrice(String(p.price)),
    variants: [],
    live: false,
  };
}

export async function getCatalog(): Promise<{
  items: CatalogProduct[];
  live: boolean;
}> {
  try {
    const live = (await getAllProducts()).filter(
      (p) => p.handle !== PARTY_TICKET_HANDLE,
    );
    if (live.length > 0) return { items: live.map(fromShopify), live: true };
  } catch (err) {
    console.error("[catalog] Shopify unavailable, using static fallback:", err);
  }
  return { items: staticProducts.map(fromStatic), live: false };
}

export async function getCatalogProduct(
  handle: string,
): Promise<CatalogProduct | null> {
  try {
    const live = await getProductByHandle(handle);
    if (live) return fromShopify(live);
  } catch (err) {
    console.error("[catalog] Shopify unavailable, using static fallback:", err);
  }
  const fallback = getStaticProduct(handle);
  return fallback ? fromStatic(fallback) : null;
}
