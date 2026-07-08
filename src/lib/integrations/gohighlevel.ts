/**
 * GoHighLevel — booking webhook forwarder.
 *
 * When a booking form is submitted, we POST the payload to a
 * GHL Inbound Webhook trigger. That kicks off whatever workflow
 * you've built there (contact creation, email sequences, pipeline
 * stage, etc.). We just fire and log.
 */

export type BookingPayload = {
  name: string;
  email: string;
  phone?: string;
  date?: string;
  city?: string;
  guests?: string | number;
  message: string;
};

export async function forwardBookingToGhl(payload: BookingPayload) {
  const url = process.env.GHL_BOOKING_WEBHOOK_URL;
  if (!url) {
    console.warn(
      "[GHL] GHL_BOOKING_WEBHOOK_URL not set — booking not forwarded.",
    );
    return { skipped: true as const };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "lumanai.com booking form",
      submitted_at: new Date().toISOString(),
      ...payload,
    }),
  });

  if (!res.ok) {
    throw new Error(`GHL webhook returned ${res.status}`);
  }
  return { ok: true as const };
}
