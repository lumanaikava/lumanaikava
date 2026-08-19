import { NextResponse } from "next/server";
import { readTicket } from "@/lib/ticket-token";
import { getSession } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Door check.
 *
 * Crew-only — any signed-in crew member, not just owners, because
 * Jadon is on the door and Jadon is staff. The gate matters: the whole
 * value of the signature is that only we can tell a real ticket from an
 * invented one, and that stops being true the moment anyone can ask.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.authed) {
    return NextResponse.json(
      { error: "Sign in on /admin first." },
      { status: 401 },
    );
  }

  let body: { token?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const raw = typeof body.token === "string" ? body.token.trim() : "";
  if (!raw) return NextResponse.json({ ok: false, reason: "empty" });

  // A camera may hand back the full URL if it's pointed at the page
  // rather than the code — take the token out of it either way.
  const token = raw.includes("/ticket/")
    ? raw.split("/ticket/").pop()!.split(/[?#]/)[0]
    : raw;

  const ticket = readTicket(token);
  if (!ticket) return NextResponse.json({ ok: false, reason: "invalid" });

  return NextResponse.json({ ok: true, ticket, scannedBy: session.name });
}
