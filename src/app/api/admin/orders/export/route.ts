import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getRecentOrders,
  ordersToFulfillmentCsv,
  shopifyAdminConfigured,
} from "@/lib/integrations/shopify-admin";

export const runtime = "nodejs";

/**
 * Download recent Shopify orders as a CSV matching the Order
 * Fulfillment sheet — import it into the Drive sheet with
 * File → Import → Append to current sheet.
 */
export async function GET() {
  // Same cookie the Command Center login sets.
  const jar = await cookies();
  const auth = jar.get("lumanai_admin")?.value;
  if (!auth || auth !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!shopifyAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Shopify Admin API isn't connected yet — add SHOPIFY_ADMIN_TOKEN (read_orders scope) to .env.local.",
      },
      { status: 503 },
    );
  }

  try {
    const csv = ordersToFulfillmentCsv(await getRecentOrders(50));
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="fulfillment-${stamp}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Shopify Admin error" },
      { status: 502 },
    );
  }
}
