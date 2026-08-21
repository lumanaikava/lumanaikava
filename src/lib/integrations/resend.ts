import { Resend } from "resend";

/**
 * Resend for transactional email.
 *
 * Keys and the sender live in env vars — the module never falls back
 * to a hardcoded address, because "worked in dev, missed in prod" is
 * the exact failure mode we're building to avoid.
 *
 *   RESEND_API_KEY       — from resend.com after signup
 *   RESEND_FROM_ADDRESS  — e.g. "Lumanai <bula@lumanai.com>" (domain
 *                          must be verified in Resend first)
 *   RESEND_REPLY_TO      — optional; defaults to CONTACT_EMAIL, then
 *                          to bula@lumanai.com
 */

const KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.RESEND_FROM_ADDRESS ?? "";
const REPLY_TO =
  process.env.RESEND_REPLY_TO ??
  process.env.CONTACT_EMAIL ??
  "bula@lumanai.com";

export function resendConfigured(): boolean {
  return Boolean(KEY && FROM);
}

/** One-line health check for /admin — never returns the key itself. */
export function resendStatus(): string {
  if (!KEY) return "Missing RESEND_API_KEY";
  if (!FROM) return "Missing RESEND_FROM_ADDRESS";
  return `Ready — sending as ${FROM}`;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /**
   * Idempotency key. Resend uses this to de-dupe identical sends
   * arriving within a few minutes — matters here because Shopify
   * retries webhooks on any non-2xx.
   */
  idempotencyKey?: string;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  if (!resendConfigured()) {
    return { ok: false, error: "Resend is not configured on this server." };
  }
  try {
    const resend = new Resend(KEY);
    const res = await resend.emails.send(
      {
        from: FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: REPLY_TO,
      },
      input.idempotencyKey
        ? { idempotencyKey: input.idempotencyKey }
        : undefined,
    );
    if (res.error) {
      return { ok: false, error: res.error.message ?? "Resend rejected the send" };
    }
    return { ok: true, id: res.data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Resend send failed",
    };
  }
}
