import { NextResponse } from "next/server";
import { sendSms } from "@/lib/integrations/twilio";
import { getSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Texting customers from the business number is an owner action.
  const session = await getSession();
  if (!session.isOwner) {
    return NextResponse.json(
      { error: session.authed ? "Owners only." : "Not signed in." },
      { status: session.authed ? 403 : 401 },
    );
  }

  let body: { to?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!body.to || !body.message) {
    return NextResponse.json(
      { error: "Both a phone number and a message are required." },
      { status: 400 },
    );
  }

  const result = await sendSms(body.to, body.message);
  if ("skipped" in result) {
    return NextResponse.json(
      {
        error:
          "Twilio credentials aren't set yet — add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER to .env.local.",
      },
      { status: 503 },
    );
  }
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
