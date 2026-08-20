import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-session";
import { readGuestsStrict, appendGuest, guestSheetConfigured } from "@/lib/integrations/guest-sheet";
import { normaliseInstagram, type Guest } from "@/lib/guests";
import { LUNA_STARTER_LIST } from "@/lib/luna-starter-list";

export const runtime = "nodejs";

/**
 * One-shot seeder for the LUNA EKLIPTIKA starter list.
 *
 * Owner-only, and REFUSES if the sheet already has manual rows — so
 * clicking the button by mistake next week doesn't double the list.
 * The refuse-if-not-empty check is the safety net; the UI hides the
 * button when the board isn't empty either, but those two are
 * independent on purpose.
 *
 * Errors are surfaced as they happen; a partial success reports "N of
 * M added" rather than pretending the whole batch went through.
 */
export async function POST() {
  const session = await getSession();
  if (!session.isOwner) {
    return NextResponse.json(
      { error: session.authed ? "Owners only." : "Not signed in." },
      { status: session.authed ? 403 : 401 },
    );
  }
  if (!guestSheetConfigured()) {
    return NextResponse.json(
      { error: "The Guest List sheet isn't connected." },
      { status: 503 },
    );
  }

  // Refuse to seed onto a non-empty list — the check happens against the
  // sheet, not what the client thinks it's showing, so a stale tab can't
  // trigger duplicate rows.
  let existing: Guest[] = [];
  try {
    existing = await readGuestsStrict();
  } catch (err) {
    return NextResponse.json(
      {
        error: `Couldn't read the sheet before seeding: ${
          err instanceof Error ? err.message : "unknown error"
        }`,
      },
      { status: 502 },
    );
  }
  const manualExisting = existing.filter((g) => g.source === "manual");
  if (manualExisting.length > 0) {
    return NextResponse.json(
      {
        error: `Not seeding — the sheet already has ${manualExisting.length} manual row${
          manualExisting.length === 1 ? "" : "s"
        }. Clear them first if you really want a reseed.`,
      },
      { status: 409 },
    );
  }

  const now = Date.now();
  const added: string[] = [];
  const failed: { name: string; error: string }[] = [];

  for (let i = 0; i < LUNA_STARTER_LIST.length; i++) {
    const spec = LUNA_STARTER_LIST[i];
    const guest: Guest = {
      // Stagger the timestamp so the sort order matches the file order
      // (newest first is what the UI shows, so oldest indexes get the
      // oldest addedAt).
      id: `m-${(now + i).toString(36)}-seed`,
      name: spec.name,
      email: spec.email ?? "",
      phone: spec.phone ?? "",
      instagram: normaliseInstagram(spec.instagram ?? ""),
      source: "manual",
      status: "lead",
      tickets: 1,
      notes: spec.notes ?? "",
      invitedPhone: false,
      invitedEmail: false,
      invitedInstagram: false,
      isStaff: spec.isStaff === true,
      isFree: spec.isFree === true,
      addedBy: session.name,
      addedAt: new Date(now + i * 1000).toISOString(),
    };
    try {
      await appendGuest(guest);
      added.push(guest.name);
    } catch (err) {
      failed.push({
        name: guest.name,
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  return NextResponse.json({
    ok: failed.length === 0,
    added: added.length,
    total: LUNA_STARTER_LIST.length,
    failed,
  });
}
