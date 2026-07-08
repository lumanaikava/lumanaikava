import { NextResponse } from "next/server";
import {
  forwardBookingToGhl,
  type BookingPayload,
} from "@/lib/integrations/gohighlevel";
import { sendAlertSms } from "@/lib/integrations/twilio";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: BookingPayload;
  try {
    payload = (await req.json()) as BookingPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload?.name || !payload?.email || !payload?.message) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 },
    );
  }

  try {
    await forwardBookingToGhl(payload);
  } catch (err) {
    console.error("[booking] GHL forward failed:", err);
    // Don't block the user on GHL failure — still notify + accept.
  }

  try {
    await sendAlertSms(
      `New Lumanai booking · ${payload.name} · ${payload.city ?? "no city"} · ${payload.date ?? "no date"}`,
    );
  } catch (err) {
    console.error("[booking] SMS alert failed:", err);
  }

  return NextResponse.json({ ok: true });
}
