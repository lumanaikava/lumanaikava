import { NextResponse } from "next/server";
import { createCheckout } from "@/lib/integrations/shopify";
import { forwardBookingToGhl } from "@/lib/integrations/gohighlevel";
import { hasSmsConsent, consentNote } from "@/lib/sms-consent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: {
    variantId?: string;
    quantity?: number;
    /** SMS opt-in, only present when the buyer ticked the box. */
    smsConsent?: string;
    name?: string;
    phone?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.variantId) {
    return NextResponse.json({ error: "Missing variantId" }, { status: 400 });
  }

  const quantity = Math.min(Math.max(Number(payload.quantity) || 1, 1), 20);

  /**
   * Record the SMS opt-in BEFORE handing off to Shopify.
   *
   * After the redirect the buyer is on Shopify's domain and this code
   * never runs again, so this is the only moment we can capture it. The
   * record carries the three things that make consent provable later:
   * who, when, and the exact sentence they agreed to.
   *
   * A ticked box with no number is ignored — it permits nothing.
   */
  const phone = payload.phone?.trim();
  const granted = hasSmsConsent(payload.smsConsent) && Boolean(phone);
  if (granted) {
    try {
      await forwardBookingToGhl({
        source: "lumanai.com ticket checkout — SMS opt-in",
        name: payload.name?.trim() || "Ticket buyer",
        // Shopify collects the real email at checkout; this record exists
        // for the phone consent, so email is deliberately left blank.
        email: "",
        phone,
        message: `[SMS opt-in] Ticked the SMS consent box while buying a Lumanai Launch ticket.${consentNote(
          true,
          "ticket checkout",
        )}`,
      });
    } catch (err) {
      // Never block a sale on the CRM. The buyer still gets their ticket;
      // we lose one consent record and it's logged loudly here.
      console.error("[checkout] SMS consent record failed to reach GHL:", err);
    }
  }

  try {
    const checkoutUrl = await createCheckout(payload.variantId, quantity);
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("[checkout] cart creation failed:", err);
    return NextResponse.json(
      { error: "Checkout is unavailable right now — try again in a minute." },
      { status: 502 },
    );
  }
}
