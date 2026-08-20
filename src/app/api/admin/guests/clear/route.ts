import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-session";
import { clearAllGuests, guestSheetConfigured } from "@/lib/integrations/guest-sheet";

export const runtime = "nodejs";

/**
 * Wipe every row from the Guest List sheet.
 *
 * Owner-only, and requires a confirm=YES field in the body — so a
 * misfire from anywhere else (a stale tab, an accidental curl) can't
 * empty the sheet. There's no undo; that's Zach's decision, but two
 * gates protect the accident.
 */
export async function POST(req: Request) {
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

  let body: { confirm?: unknown } = {};
  try {
    body = (await req.json()) as { confirm?: unknown };
  } catch {
    /* empty body is fine; the confirm check catches it */
  }
  if (body.confirm !== "YES") {
    return NextResponse.json(
      { error: "Refused — confirm was not YES." },
      { status: 400 },
    );
  }

  try {
    await clearAllGuests();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[guests] clear-all failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't clear the list." },
      { status: 502 },
    );
  }
}
