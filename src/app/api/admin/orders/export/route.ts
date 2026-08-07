import { NextResponse } from "next/server";
import {
  getRecentOrders,
  ordersToFulfillmentCsv,
  shopifyAdminConfigured,
} from "@/lib/integrations/shopify-admin";
import { getSession } from "@/lib/admin-session";

export const runtime = "nodejs";

/**
 * Download recent Shopify orders as a CSV matching the Order
 * Fulfillment sheet — import it into the Drive sheet with
 * File → Import → Append to current sheet.
 */
export async function GET() {
  // Customer names, addresses and phone numbers — owners only.
  const session = await getSession();
  if (!session.isOwner) {
    return NextResponse.json(
      { error: session.authed ? "Owners only." : "Not signed in." },
      { status: session.authed ? 403 : 401 },
    );
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
