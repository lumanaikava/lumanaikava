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
  variables?: Record<string, unknown>
): Promise<T> {
  const { domain, token, configured } = shopifyConfig();
  if (!configured) {
    throw new Error(
      "Shopify Storefront not configured. Fill in NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN in .env.local."
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
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Shopify ${res.status}`);
  const json = (await res.json()) as { data: T; errors?: unknown };
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

/* ── Types ─────────────────────────────────────────────────── */

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
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
};

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
  handle: string
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
    { handle }
  );
  return data.product;
}

/**
 * Create a Shopify cart with one line item and return the hosted
 * checkout URL. The buyer finishes payment on Shopify's checkout,
 * so we never touch card data.
 */
export async function createCheckout(
  variantId: string,
  quantity = 1
): Promise<string> {
  const data = await shopifyFetch<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { message: string }[];
    };
  }>(
    /* GraphQL */ `
      mutation CartCreate($lines: [CartLineInput!]!) {
        cartCreate(input: { lines: $lines }) {
          cart {
            checkoutUrl
          }
          userErrors {
            message
          }
        }
      }
    `,
    { lines: [{ merchandiseId: variantId, quantity }] }
  );
  const err = data.cartCreate.userErrors[0]?.message;
  if (err) throw new Error(err);
  if (!data.cartCreate.cart) throw new Error("Cart creation failed");
  return data.cartCreate.cart.checkoutUrl;
}
