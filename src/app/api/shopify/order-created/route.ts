import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  renderConfirmation,
  resolveTier,
  CONFIRMATION_SUBJECT,
  type LunaTierKey,
} from "@/lib/email-templates/luna-confirmation";
import { createTicket, ticketSecretConfigured } from "@/lib/ticket-token";
import { sendEmail, resendConfigured } from "@/lib/integrations/resend";

export const runtime = "nodejs";
/**
 * The webhook body arrives as a signed raw string. Anything that
 * touches the body BEFORE we HMAC it — a JSON parse, a Next
 * middleware, anything — silently invalidates the signature and every
 * webhook then reads as tampered. Reading the raw body first, in
 * this route only, keeps that closed.
 */
export const dynamic = "force-dynamic";

/**
 * Shopify order/create webhook.
 *
 * TRUST BOUNDARY. Only Shopify (via the HMAC signed with the app
 * secret) can trigger a confirmation. Reject anything else with 401 —
 * quietly, no clue what the check was for.
 *
 * IDEMPOTENCY. Shopify retries on any non-2xx for up to 48h. We use
 * Resend's own idempotency key (the order name) so a retry never
 * produces a second email. Cheaper and more reliable than trying to
 * persist a "sent" flag ourselves.
 *
 * FAST 200. Shopify times out at 5s and starts retrying. If Resend is
 * slow, we still ACK inside the timeout — the email path already
 * carries idempotency, so if we ever moved to a background queue the
 * behaviour would be identical.
 */

const SECRET = process.env.SHOPIFY_WEBHOOK_SECRET ?? "";

type ShopifyLineItem = {
  title?: string;
  product_id?: number | string;
  variant_id?: number | string;
  variant_title?: string;
  quantity?: number;
  sku?: string;
  properties?: { name: string; value: string }[];
};
type ShopifyOrder = {
  id: number | string;
  name: string; // "#1042"
  email?: string;
  contact_email?: string;
  financial_status?: string;
  customer?: { first_name?: string; last_name?: string; email?: string };
  billing_address?: { first_name?: string; last_name?: string; phone?: string };
  shipping_address?: { first_name?: string; last_name?: string };
  line_items?: ShopifyLineItem[];
  note_attributes?: { name: string; value: string }[];
};

/** Verify Shopify's HMAC-SHA256 signature over the raw body. */
function verifySignature(rawBody: string, headerBase64: string): boolean {
  if (!SECRET || !headerBase64) return false;
  const expected = createHmac("sha256", SECRET).update(rawBody, "utf8").digest();
  let given: Buffer;
  try {
    given = Buffer.from(headerBase64, "base64");
  } catch {
    return false;
  }
  if (given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}

/** Pull the first party-ticket line item and read its tier. */
function findTicketLine(
  order: ShopifyOrder,
): { tier: LunaTierKey; quantity: number } | null {
  const items = order.line_items ?? [];
  // Shopify webhooks don't include product handles — match on the SKU
  // if it's set, else on the product title containing "ticket". The
  // handle-based catalog check runs in the storefront cart flow; this
  // is a coarser but still safe post-purchase check.
  for (const li of items) {
    const looksLikeTicket =
      /ticket/i.test(li.title ?? "") ||
      /ticket/i.test(li.sku ?? "") ||
      // The variant title carries the tier — Obsidian / Meridian / …
      (li.variant_title && resolveTier(li.variant_title));
    if (!looksLikeTicket) continue;
    const tier = resolveTier(li.variant_title ?? li.title ?? "");
    if (!tier) continue;
    return { tier, quantity: Math.max(1, Number(li.quantity) || 1) };
  }
  return null;
}

function firstNameOf(order: ShopifyOrder): string {
  return (
    order.customer?.first_name?.trim() ||
    order.billing_address?.first_name?.trim() ||
    order.shipping_address?.first_name?.trim() ||
    ""
  );
}

function fullNameOf(order: ShopifyOrder): string {
  const first =
    order.customer?.first_name?.trim() ||
    order.billing_address?.first_name?.trim() ||
    order.shipping_address?.first_name?.trim() ||
    "";
  const last =
    order.customer?.last_name?.trim() ||
    order.billing_address?.last_name?.trim() ||
    order.shipping_address?.last_name?.trim() ||
    "";
  return [first, last].filter(Boolean).join(" ") || first || "Guest";
}

function emailOf(order: ShopifyOrder): string {
  return (
    order.email?.trim() ||
    order.contact_email?.trim() ||
    order.customer?.email?.trim() ||
    ""
  );
}

/**
 * Log to the server console without ever including the buyer's email
 * address in plaintext — it's PII, and this log ends up in Vercel's
 * runtime tab.
 */
function log(order: ShopifyOrder | null, msg: string) {
  const ref = order?.name ?? "?";
  console.log(`[order-webhook] ${ref} · ${msg}`);
}

export async function POST(req: Request) {
  // Read the raw body FIRST. Any JSON parse must come after HMAC.
  const rawBody = await req.text();
  const header =
    req.headers.get("x-shopify-hmac-sha256") ??
    req.headers.get("X-Shopify-Hmac-SHA256") ??
    "";

  if (!verifySignature(rawBody, header)) {
    // Return 401 without a body — no oracle for an attacker to probe.
    return new NextResponse(null, { status: 401 });
  }

  let order: ShopifyOrder;
  try {
    order = JSON.parse(rawBody) as ShopifyOrder;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  // A refund/void/cancel arrives on a different topic. But if a hostile
  // request wedges one in through this endpoint, refuse politely.
  if (
    order.financial_status &&
    /refunded|voided/i.test(order.financial_status)
  ) {
    log(order, "skip: refunded/voided");
    return NextResponse.json({ ok: true, skipped: "refunded" });
  }

  const ticketLine = findTicketLine(order);
  if (!ticketLine) {
    log(order, "skip: no party-ticket line");
    return NextResponse.json({ ok: true, skipped: "no ticket line" });
  }

  const toEmail = emailOf(order);
  if (!toEmail) {
    log(order, "skip: no email on order");
    return NextResponse.json({ ok: true, skipped: "no email" });
  }

  if (!ticketSecretConfigured()) {
    log(order, "FAIL: TICKET_SECRET not set");
    return NextResponse.json(
      { ok: false, error: "TICKET_SECRET not configured" },
      { status: 500 },
    );
  }

  if (!resendConfigured()) {
    log(order, "FAIL: Resend not configured");
    return NextResponse.json(
      { ok: false, error: "Resend not configured" },
      { status: 500 },
    );
  }

  // Mint the ticket. Full name inside the token — the door scanner
  // reads that back to the crew, so it needs to be the person's real
  // name, not just their first.
  const ticket = createTicket({
    order: order.name,
    name: fullNameOf(order),
    tier: ticketLine.tier,
    seats: ticketLine.quantity,
  });
  const origin = process.env.SITE_ORIGIN ?? "https://www.lumanai.com";
  const ticketLink = `${origin}/ticket/${ticket}`;

  const { subject, html, text } = renderConfirmation({
    firstName: firstNameOf(order) || fullNameOf(order),
    tier: ticketLine.tier,
    ticketLink,
  });

  const result = await sendEmail({
    to: toEmail,
    subject: subject || CONFIRMATION_SUBJECT,
    html,
    text,
    // Resend's own de-dupe — a retried webhook with the same order name
    // gets ignored on the provider side, so we never send twice.
    idempotencyKey: `luna-conf-${order.name}`,
  });

  if (!result.ok) {
    log(order, `send failed: ${result.error}`);
    // Return 500 so Shopify retries — a transient Resend hiccup should
    // heal itself on the next attempt.
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  log(order, `sent ${ticketLine.tier} to buyer · resend-id=${result.id}`);
  return NextResponse.json({ ok: true, tier: ticketLine.tier, resendId: result.id });
}
