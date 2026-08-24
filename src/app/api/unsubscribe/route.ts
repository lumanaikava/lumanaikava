import { NextResponse } from "next/server";

/**
 * One-click unsubscribe endpoint referenced by our List-Unsubscribe
 * header. Gmail probes this URL when the recipient hits "unsubscribe"
 * in the header UI; RFC 8058 says a POST with body
 * "List-Unsubscribe=One-Click" must be honoured without any further
 * confirmation.
 *
 * Marketing emails have real unsubscribe processing behind this.
 * Confirmation and invitation emails are transactional — one-off and
 * essential to a purchase or an invitation the recipient chose — so
 * the honest response is an ACK with a note that there is nothing to
 * unsubscribe from. Gmail's classifier just needs a 200 with a text
 * body; the wording is human-facing when the URL is opened directly.
 */
export const runtime = "nodejs";

const BODY =
  "You're not on a list. This address only receives one-off messages tied to a specific action you took (a ticket purchase, an invitation you were sent). There's nothing to unsubscribe from. If you'd rather we didn't message you again, just reply to the email and tell us.";

export async function GET() {
  return new NextResponse(BODY, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST() {
  return new NextResponse(BODY, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
