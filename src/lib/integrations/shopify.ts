/**
 * Shopify Storefront API client — LIVE.
 *
 * Products on /products come straight from the lumanai-kava.myshopify.com
 * catalog (Headless sales channel). Checkout happens on Shopify via a
 * Storefront-API cart. If the env vars are missing or Shopify is down,
 * pages fall back to the static list in src/lib/products.ts.
 */

const API_VERSION = "2026-01";

export function shopifyConfig() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
  return { domain, token, configured: Boolean(domain && token) };
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  /**
   * Mutations opt out of the data cache. Every Storefront call is an
   * HTTP POST, catalog reads included, so the method alone can't be
   * trusted to keep a cached cartCreate from handing two buyers the
   * same checkout URL.
   */
  options: { mutation?: boolean; revalidate?: number } = {},
): Promise<T> {
  const { domain, token, configured } = shopifyConfig();
  if (!configured) {
    throw new Error(
      "Shopify Storefront not configured. Fill in NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN in .env.local.",
    );
  }
  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token!,
    },
    body: JSON.stringify({ query, variables }),
    // Revalidate the catalog every minute so price/stock edits in the
    // Shopify admin show up without a redeploy.
    ...(options.mutation
      ? { cache: "no-store" as const }
      : { next: { revalidate: options.revalidate ?? 60 } }),
  });
  if (!res.ok) throw new Error(`Shopify ${res.status}`);
  const json = (await res.json()) as { data: T; errors?: unknown };
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

/* ── Types ─────────────────────────────────────────────────── */

/**
 * One "Subscribe & save" option, flattened out of Shopify's
 * group→plan→priceAdjustment nesting.
 *
 * The plans come from Seal Subscriptions, which owns them app-side —
 * the Admin API won't return them to our token, but the Storefront API
 * exposes them fully, which is all the shop needs.
 */
export type SellingPlan = {
  id: string;
  name: string;
  /** Percent off, when the plan discounts by percentage. */
  percentOff: number | null;
};

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: { amount: string; currencyCode: string };
      };
    }[];
  };
  sellingPlanGroups?: {
    edges: {
      node: {
        name: string;
        sellingPlans: {
          edges: {
            node: {
              id: string;
              name: string;
              priceAdjustments: {
                adjustmentValue:
                  | { adjustmentPercentage?: number }
                  | Record<string, unknown>;
              }[];
            };
          }[];
        };
      };
    }[];
  };
};

/** Flatten a product's selling-plan groups into a simple option list. */
export function sellingPlansOf(p: ShopifyProduct): SellingPlan[] {
  const groups = p.sellingPlanGroups?.edges ?? [];
  return groups.flatMap((g) =>
    g.node.sellingPlans.edges.map(({ node }) => {
      const adj = node.priceAdjustments?.[0]?.adjustmentValue as
        | { adjustmentPercentage?: number }
        | undefined;
      const pct = Number(adj?.adjustmentPercentage);
      return {
        id: node.id,
        name: node.name,
        percentOff: Number.isFinite(pct) && pct > 0 ? pct : null,
      };
    }),
  );
}

export function formatPrice(amount: string, currencyCode = "USD"): string {
  const n = Number(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

/* ── Queries ───────────────────────────────────────────────── */

const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    availableForSale
    featuredImage {
      url
      altText
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 10) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
    sellingPlanGroups(first: 3) {
      edges {
        node {
          name
          sellingPlans(first: 6) {
            edges {
              node {
                id
                name
                priceAdjustments {
                  adjustmentValue {
                    ... on SellingPlanPercentagePriceAdjustment {
                      adjustmentPercentage
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] };
  }>(/* GraphQL */ `
    ${PRODUCT_FIELDS}
    query AllProducts {
      products(first: 50, sortKey: BEST_SELLING) {
        edges {
          node {
            ...ProductFields
          }
        }
      }
    }
  `);
  return data.products.edges.map((e) => e.node);
}

export async function getProductByHandle(
  handle: string,
): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
    /* GraphQL */ `
      ${PRODUCT_FIELDS}
      query ProductByHandle($handle: String!) {
        product(handle: $handle) {
          ...ProductFields
        }
      }
    `,
    { handle },
  );
  return data.product;
}

export type CartLine = {
  variantId: string;
  quantity: number;
  /**
   * Subscribe & save. When present, Shopify prices the line off the
   * plan (and its discount) rather than the variant, and the resulting
   * order becomes a recurring contract in Seal Subscriptions.
   */
  sellingPlanId?: string;
};

export type Checkout = {
  url: string;
  /**
   * True when Shopify built a smaller cart than we asked for — a line
   * sold out between the buyer adding it and checking out. The caller
   * has to say so; a quietly shorter order is exactly the kind of silent
   * failure this codebase refuses to ship.
   */
  adjusted: boolean;
};

/** Per-line ceiling, matching MAX_PER_LINE in the cart provider. */
const MAX_LINE_QUANTITY = 20;

/**
 * Nothing the buyer chose is still for sale. Separate from a transport
 * failure because "sold out" and "try again in a minute" are opposite
 * instructions.
 */
export class SoldOutError extends Error {}

/**
 * Create a Shopify cart from one or more lines and return the hosted
 * checkout URL. The buyer finishes payment on Shopify, so we never touch
 * card data.
 */
export async function createCheckout(lines: CartLine[]): Promise<Checkout> {
  if (lines.length === 0) throw new Error("No lines to check out");

  const input = lines.map((l) => ({
    merchandiseId: l.variantId,
    quantity: Math.min(Math.max(Math.round(l.quantity) || 1, 1), MAX_LINE_QUANTITY),
    // Omitted entirely for one-time purchases — Shopify rejects a null
    // sellingPlanId, so the key must be absent rather than empty.
    ...(l.sellingPlanId ? { sellingPlanId: l.sellingPlanId } : {}),
  }));
  const requested = input.reduce((n, l) => n + l.quantity, 0);

  const data = await shopifyFetch<{
    cartCreate: {
      cart: { checkoutUrl: string; totalQuantity: number } | null;
      userErrors: { message: string }[];
    };
  }>(
    /* GraphQL */ `
      mutation CartCreate($lines: [CartLineInput!]!) {
        cartCreate(input: { lines: $lines }) {
          cart {
            checkoutUrl
            totalQuantity
          }
          userErrors {
            message
          }
        }
      }
    `,
    { lines: input },
    { mutation: true },
  );
  const err = data.cartCreate.userErrors[0]?.message;
  if (err) throw new Error(err);
  const cart = data.cartCreate.cart;
  if (!cart) throw new Error("Cart creation failed");
  // Shopify drops unavailable lines rather than failing the mutation, so
  // an empty cart means nothing the buyer chose is still for sale.
  if (cart.totalQuantity === 0) {
    throw new SoldOutError(
      "Everything in your cart just sold out. Nothing has been charged.",
    );
  }
  return { url: cart.checkoutUrl, adjusted: cart.totalQuantity < requested };
}
