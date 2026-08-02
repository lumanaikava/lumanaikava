import { NextResponse } from "next/server";
import { forwardBookingToGhl } from "@/lib/integrations/gohighlevel";
import { hasSmsConsent, consentNote } from "@/lib/sms-consent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: {
    name: string;
    email: string;
    message: string;
    phone?: string;
    smsConsent?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload?.name || !payload?.email || !payload?.message) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 },
    );
  }

  // Route contact messages through the same GHL webhook — GHL can branch
  // by tag or source field to route differently from bookings.
  // Only record consent when a number was actually given — a ticked box
  // with no phone number isn't a permission to anything.
  const granted = hasSmsConsent(payload.smsConsent) && Boolean(payload.phone);
  const note = payload.phone ? consentNote(granted, "contact form") : "";

  try {
    await forwardBookingToGhl({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: `[Contact form]\n${payload.message}${note}`,
    });
  } catch (err) {
    console.error("[contact] GHL forward failed:", err);
  }

  return NextResponse.json({ ok: true });
}
