import { NextResponse } from "next/server";
import { createCheckout, SoldOutError } from "@/lib/integrations/shopify";
import type { CartLine } from "@/lib/integrations/shopify";
import { forwardBookingToGhl } from "@/lib/integrations/gohighlevel";
import { hasSmsConsent, consentNote } from "@/lib/sms-consent";

export const runtime = "nodejs";

/** Distinct lines one order may contain — a cart, not a wholesale order. */
const MAX_LINES = 30;

/**
 * Where the opt-in was taken. A consent record has to name the moment it
 * was given, so this is never guessed: an unrecognised context gets the
 * neutral wording rather than being filed as something it wasn't.
 */
const CONSENT_CONTEXTS = {
  ticket: {
    source: "lumanai.com ticket checkout — SMS opt-in",
    did: "while buying a Lumanai Launch ticket",
    at: "ticket checkout",
    who: "Ticket buyer",
  },
  shop: {
    source: "lumanai.com shop checkout — SMS opt-in",
    did: "while checking out in the Lumanai shop",
    at: "shop checkout",
    who: "Shop customer",
  },
} as const;

type ConsentContext = keyof typeof CONSENT_CONTEXTS;

function contextFor(value: unknown): (typeof CONSENT_CONTEXTS)[ConsentContext] {
  return (
    CONSENT_CONTEXTS[value as ConsentContext] ?? {
      source: "lumanai.com checkout — SMS opt-in",
      did: "while checking out on lumanai.com",
      at: "checkout",
      who: "Customer",
    }
  );
}

/**
 * Normalise whatever the client sent into Shopify lines.
 *
 * Accepts a cart (`lines`) or a single variant, and merges repeats so a
 * duplicated variantId can't become two separate lines on the order.
 */
function parseLines(payload: {
  lines?: unknown;
  variantId?: unknown;
  quantity?: unknown;
}): CartLine[] {
  const raw: unknown[] = Array.isArray(payload.lines)
    ? payload.lines
    : typeof payload.variantId === "string"
      ? [{ variantId: payload.variantId, quantity: payload.quantity }]
      : [];

  // Keyed by variant AND selling plan: the same growler bought once and
  // bought monthly are two lines at two prices, and merging them would
  // silently turn a one-time purchase into a recurring charge.
  const merged = new Map<
    string,
    { variantId: string; sellingPlanId?: string; quantity: number }
  >();
  for (const entry of raw.slice(0, MAX_LINES)) {
    const line = entry as {
      variantId?: unknown;
      quantity?: unknown;
      sellingPlanId?: unknown;
    };
    const variantId =
      typeof line.variantId === "string" ? line.variantId.trim() : "";
    if (!variantId || variantId.length > 255) continue;
    const rawPlan =
      typeof line.sellingPlanId === "string" ? line.sellingPlanId.trim() : "";
    // Only accept a well-formed Shopify SellingPlan GID — this value goes
    // straight into a cart mutation, and a plan id is not something the
    // buyer should be able to invent.
    const sellingPlanId = /^gid:\/\/shopify\/SellingPlan\/\d+$/.test(rawPlan)
      ? rawPlan
      : undefined;
    const quantity = Math.min(Math.max(Number(line.quantity) || 1, 1), 20);
    const key = sellingPlanId ? `${variantId}::${sellingPlanId}` : variantId;
    const prev = merged.get(key);
    merged.set(key, {
      variantId,
      sellingPlanId,
      quantity: Math.min((prev?.quantity ?? 0) + quantity, 20),
    });
  }
  return [...merged.values()];
}

export async function POST(req: Request) {
  let payload: {
    lines?: unknown;
    variantId?: unknown;
    quantity?: unknown;
    /** Which checkout this is, so the consent record says so. */
    context?: unknown;
    /** SMS opt-in, only present when the buyer ticked the box. */
    smsConsent?: unknown;
    name?: unknown;
    phone?: unknown;
    /** Liability waiver, ticked before the buy button unlocks. */
    waiverAccepted?: unknown;
    waiverText?: unknown;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const lines = parseLines(payload);
  if (lines.length === 0) {
    return NextResponse.json({ error: "Nothing to check out" }, { status: 400 });
  }

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
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const granted = hasSmsConsent(payload.smsConsent) && Boolean(phone);
  if (granted) {
    const ctx = contextFor(payload.context);
    try {
      await forwardBookingToGhl({
        source: ctx.source,
        name:
          (typeof payload.name === "string" ? payload.name.trim() : "") ||
          ctx.who,
        // Shopify collects the real email at checkout; this record exists
        // for the phone consent, so email is deliberately left blank.
        email: "",
        phone,
        message: `[SMS opt-in] Ticked the SMS consent box ${ctx.did}.${consentNote(
          true,
          ctx.at,
        )}`,
      });
    } catch (err) {
      // Never block a sale on the CRM. The buyer still gets their order;
      // we lose one consent record and it's logged loudly here.
      console.error("[checkout] SMS consent record failed to reach GHL:", err);
    }
  }

  /**
   * Record the waiver the same way, and for the same reason: after the
   * redirect we never run again.
   *
   * Filed even when there's no phone number — this one is a legal
   * record, not a marketing permission, so it must not depend on
   * someone also having opted into texts. The exact text they agreed to
   * goes in the record; a bare "accepted: true" proves nothing later.
   */
  if (payload.waiverAccepted === true) {
    const text =
      typeof payload.waiverText === "string" ? payload.waiverText.trim() : "";
    try {
      await forwardBookingToGhl({
        source: "lumanai.com — LUNA EKLIPTIKA waiver accepted",
        name:
          (typeof payload.name === "string" ? payload.name.trim() : "") ||
          "Guest",
        email: "",
        phone,
        message: `[Waiver accepted] ${new Date().toISOString()} — LUNA EKLIPTIKA, before checkout.

${text}`,
      });
    } catch (err) {
      console.error("[checkout] waiver record failed to reach GHL:", err);
    }
  }

  try {
    const checkout = await createCheckout(lines);
    // `adjusted` means Shopify dropped a sold-out line. The client shows
    // that before sending anyone on — a quietly shorter order is worse
    // than a slower one.
    return NextResponse.json({
      checkoutUrl: checkout.url,
      adjusted: checkout.adjusted,
    });
  } catch (err) {
    if (err instanceof SoldOutError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("[checkout] cart creation failed:", err);
    return NextResponse.json(
      { error: "Checkout is unavailable right now — try again in a minute." },
      { status: 502 },
    );
  }
}
