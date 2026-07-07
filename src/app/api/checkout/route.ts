import { NextResponse } from "next/server";
import { createCheckout } from "@/lib/integrations/shopify";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: { variantId?: string; quantity?: number };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.variantId) {
    return NextResponse.json({ error: "Missing variantId" }, { status: 400 });
  }

  const quantity = Math.min(Math.max(Number(payload.quantity) || 1, 1), 20);

  try {
    const checkoutUrl = await createCheckout(payload.variantId, quantity);
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("[checkout] cart creation failed:", err);
    return NextResponse.json(
      { error: "Checkout is unavailable right now — try again in a minute." },
      { status: 502 }
    );
  }
}
