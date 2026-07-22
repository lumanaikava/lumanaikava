/**
 * Shopify ADMIN API client — orders + fulfillment.
 *
 * Separate from the public Storefront client (shopify.ts): reading
 * orders requires a private Admin API token with the `read_orders`
 * scope. Create one in: Shopify Admin → Settings → Apps and sales
 * channels → Develop apps → (the Lumanai headless app) → Configuration →
 * Admin API integration → enable `read_orders` → Install → reveal the
 * Admin API access token → paste into .env.local as SHOPIFY_ADMIN_TOKEN.
 *
 * Until the token exists everything here degrades gracefully — the
 * Command Center shows setup instructions instead of orders.
 */

const API_VERSION = "2026-01";

export function shopifyAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN &&
      process.env.SHOPIFY_ADMIN_TOKEN,
  );
}

export type AdminOrder = {
  name: string; // "#1012"
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  total: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  note: string;
  tags: string[];
  items: { title: string; quantity: number }[];
};

type OrdersQueryResult = {
  orders: {
    edges: {
      node: {
        name: string;
        createdAt: string;
        displayFinancialStatus: string | null;
        displayFulfillmentStatus: string | null;
        note: string | null;
        tags: string[];
        totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
        customer: {
          displayName: string | null;
          email: string | null;
          phone: string | null;
        } | null;
        shippingAddress: { address1: string | null; city: string | null } | null;
        lineItems: { edges: { node: { title: string; quantity: number } }[] };
      };
    }[];
  };
};

async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!domain || !token) {
    throw new Error(
      "Shopify Admin API not configured — set SHOPIFY_ADMIN_TOKEN in .env.local (needs read_orders scope).",
    );
  }
  const res = await fetch(
    `https://${domain}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store", // orders must always be current
    },
  );
  if (!res.ok) throw new Error(`Shopify Admin ${res.status}`);
  const json = (await res.json()) as { data: T; errors?: unknown };
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

export async function getRecentOrders(limit = 25): Promise<AdminOrder[]> {
  const data = await adminFetch<OrdersQueryResult>(
    /* GraphQL */ `
      query RecentOrders($first: Int!) {
        orders(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              note
              tags
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                displayName
                email
                phone
              }
              shippingAddress {
                address1
                city
              }
              lineItems(first: 20) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    `,
    { first: limit },
  );
  return data.orders.edges.map(({ node }) => ({
    name: node.name,
    createdAt: node.createdAt,
    financialStatus: node.displayFinancialStatus ?? "",
    fulfillmentStatus: node.displayFulfillmentStatus ?? "",
    total: `$${Number(node.totalPriceSet.shopMoney.amount).toFixed(2)}`,
    customerName: node.customer?.displayName ?? "",
    email: node.customer?.email ?? "",
    phone: node.customer?.phone ?? "",
    address: [node.shippingAddress?.address1, node.shippingAddress?.city]
      .filter(Boolean)
      .join(", "),
    note: node.note ?? "",
    tags: node.tags,
    items: node.lineItems.edges.map((e) => e.node),
  }));
}

/* ── Fulfillment sheet export ──────────────────────────────── */

/** Exact column order of the Order Fulfillment sheet in Drive. */
const FULFILLMENT_COLUMNS = [
  "Order #",
  "Name",
  "Order",
  "Status",
  "Location",
  "Fulfillment Date",
  "Time",
  "Type",
  "Contacted",
  "G Refund",
  "Returned Growler?",
  "Notes",
  "Subscription",
  "Gate Code",
  "Order Date",
  "Contact Info",
] as const;

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * Orders → CSV rows matching the Order Fulfillment sheet, ready to
 * import into the Drive sheet (File → Import → Append). Columns the
 * crew fills by hand (Contacted, Gate Code, …) ship blank.
 */
export function ordersToFulfillmentCsv(orders: AdminOrder[]): string {
  const rows = orders.map((o) => {
    const line = [
      o.name.replace(/^#/, ""),
      o.customerName,
      o.items.map((i) => `${i.quantity}x ${i.title}`).join(", "),
      o.fulfillmentStatus,
      o.address,
      "", // Fulfillment Date — set when scheduled
      "", // Time
      o.address ? "Delivery" : "Pickup",
      "", // Contacted
      "", // G Refund
      "", // Returned Growler?
      o.note,
      o.tags.some((t) => /subscription/i.test(t)) ? "Yes" : "",
      "", // Gate Code
      o.createdAt.slice(0, 10),
      [o.email, o.phone].filter(Boolean).join(" / "),
    ];
    return line.map(csvCell).join(",");
  });
  return [FULFILLMENT_COLUMNS.join(","), ...rows].join("\r\n");
}
