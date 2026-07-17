import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendSms } from "@/lib/integrations/twilio";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Same cookie the Command Center login sets.
  const jar = await cookies();
  const auth = jar.get("lumanai_admin")?.value;
  if (!auth || auth !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
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
