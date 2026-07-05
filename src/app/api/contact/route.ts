import { NextResponse } from "next/server";
import { forwardBookingToGhl } from "@/lib/integrations/gohighlevel";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: { name: string; email: string; message: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload?.name || !payload?.email || !payload?.message) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  // Route contact messages through the same GHL webhook — GHL can branch
  // by tag or source field to route differently from bookings.
  try {
    await forwardBookingToGhl({
      name: payload.name,
      email: payload.email,
      message: `[Contact form]\n${payload.message}`,
    });
  } catch (err) {
    console.error("[contact] GHL forward failed:", err);
  }

  return NextResponse.json({ ok: true });
}
