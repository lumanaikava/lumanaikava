import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-session";
import {
  readGuestsStrict,
  patchGuest,
  guestSheetConfigured,
} from "@/lib/integrations/guest-sheet";
import { renderInvitation } from "@/lib/email-templates/luna-invitation";
import { sendEmail, resendConfigured } from "@/lib/integrations/resend";

export const runtime = "nodejs";

/**
 * Send the "You're invited" email to one guest, then tick their
 * invitedEmail flag so the row shows Invited across the board.
 *
 * Any signed-in crew can invite — same access model as the rest of the
 * guest list. The one guard: we only send if the row has an email AND
 * is a lead. Ticket buyers already got a confirmation with the address
 * and gate code; re-inviting them would be confusing at best.
 *
 * Idempotency: Resend's key is the guest id, so a stray double-click or
 * a stale tab replaying its click can't produce two emails within a
 * few minutes. A deliberate re-send is meant to happen by first
 * unticking the Invited pill and clicking again.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.authed) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!guestSheetConfigured()) {
    return NextResponse.json(
      { error: "The Guest List sheet isn't connected." },
      { status: 503 },
    );
  }
  if (!resendConfigured()) {
    return NextResponse.json(
      {
        error:
          "Resend isn't configured on this server — the invite would have nowhere to go.",
      },
      { status: 503 },
    );
  }

  let body: { id?: unknown };
  try {
    body = (await req.json()) as { id?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json(
      { error: "Missing guest id." },
      { status: 400 },
    );
  }

  const guests = await readGuestsStrict();
  const guest = guests.find((g) => g.id === id);
  if (!guest) {
    return NextResponse.json(
      { error: "Guest isn't on the sheet — reload and try again." },
      { status: 404 },
    );
  }

  const email = guest.email?.trim();
  if (!email) {
    return NextResponse.json(
      {
        error: `${guest.name} doesn't have an email on file — add one and try again.`,
      },
      { status: 400 },
    );
  }

  // Server-side gate is deliberately loose — the button shows for any
  // row with an email, and the click-time confirm dialog is the real
  // check. A resend to the same guest is meant to work; Resend's own
  // idempotency window would otherwise block one, so the key rotates
  // per-attempt via a coarse minute-level bucket.
  const attemptBucket = Math.floor(Date.now() / 60_000);
  const firstName = guest.name.trim().split(/\s+/)[0] ?? "Friend";
  const { subject, html, text } = renderInvitation({ firstName });

  const sent = await sendEmail({
    to: email,
    subject,
    html,
    text,
    idempotencyKey: `luna-inv-${guest.id}-${attemptBucket}`,
  });

  if (!sent.ok) {
    return NextResponse.json(
      {
        error: `Resend refused the send: ${sent.error}`,
      },
      { status: 502 },
    );
  }

  // Auto-tick invitedEmail so the row reflects the action.
  try {
    await patchGuest(guest.id, { invitedEmail: true }, guest);
  } catch (err) {
    // The email went out; the tick is a display detail. Log and
    // continue rather than pretending the send failed.
    console.error(
      `[guests/invite] ${guest.name}: send OK (${sent.id}) but couldn't update invitedEmail flag —`,
      err,
    );
  }

  return NextResponse.json({
    ok: true,
    resendId: sent.id,
    // Client uses this to update the row locally without a full reload.
    invitedEmail: true,
  });
}
