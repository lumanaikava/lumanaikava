import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loadGuestBoard } from "@/lib/guest-board";
import {
  appendGuest,
  setGuestStatus,
  setGuestNotes,
  removeGuest,
  guestSheetConfigured,
} from "@/lib/integrations/guest-sheet";
import { isGuestStatus, type Guest } from "@/lib/guests";

export const runtime = "nodejs";

async function requireAuth() {
  const jar = await cookies();
  const auth = jar.get("lumanai_admin")?.value;
  if (!auth || auth !== process.env.ADMIN_PASSCODE) {
    return { ok: false as const, crew: "" };
  }
  return { ok: true as const, crew: jar.get("lumanai_crew")?.value ?? "Crew" };
}

const unauthorized = () =>
  NextResponse.json({ error: "Not signed in." }, { status: 401 });

/**
 * Writes need the sheet — there's nowhere else to put a lead. Say so
 * plainly instead of failing with something cryptic mid-party.
 */
const needsSheet = () =>
  NextResponse.json(
    {
      error:
        "The Guest List sheet isn't connected yet, so changes can't be saved. See 'Guest List Sheet Setup.md' in the Lumanai Business folder.",
    },
    { status: 503 },
  );

async function body(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** The whole board — buyers merged with saved leads. */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return unauthorized();
  return NextResponse.json(await loadGuestBoard());
}

/** Add a lead by hand. */
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return unauthorized();
  if (!guestSheetConfigured()) return needsSheet();

  const b = await body(req);
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const name = String(b.name ?? "").trim().slice(0, 120);
  if (!name) {
    return NextResponse.json({ error: "Give them a name." }, { status: 400 });
  }

  const tickets = Math.min(Math.max(Number(b.tickets) || 1, 1), 20);
  const status = isGuestStatus(b.status) ? b.status : "lead";

  const guest: Guest = {
    // Manual rows get a timestamp id — unique, and it doubles as the
    // sort key so the newest lead lands on top.
    id: `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    email: String(b.email ?? "").trim().slice(0, 160),
    phone: String(b.phone ?? "").trim().slice(0, 40),
    source: "manual",
    status,
    tickets,
    notes: String(b.notes ?? "").trim().slice(0, 400),
    addedBy: auth.crew,
    addedAt: new Date().toISOString(),
  };

  try {
    await appendGuest(guest);
    return NextResponse.json({ ok: true, guest });
  } catch (err) {
    console.error("[guests] add failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't save them." },
      { status: 502 },
    );
  }
}

/** Change a status (lock someone in, check them in) or edit notes. */
export async function PUT(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return unauthorized();
  if (!guestSheetConfigured()) return needsSheet();

  const b = await body(req);
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const id = String(b.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  // Ticket buyers have no saved row until someone edits them — the client
  // sends the whole guest so we can write one on first touch.
  const fallback = (b.guest ?? undefined) as Guest | undefined;

  try {
    if (typeof b.notes === "string") {
      await setGuestNotes(id, b.notes.trim().slice(0, 400), fallback);
    } else {
      if (!isGuestStatus(b.status)) {
        return NextResponse.json({ error: "Unknown status." }, { status: 400 });
      }
      await setGuestStatus(id, b.status, fallback);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[guests] update failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't update them." },
      { status: 502 },
    );
  }
}

/** Remove a manually-added guest. */
export async function DELETE(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return unauthorized();
  if (!guestSheetConfigured()) return needsSheet();

  const b = await body(req);
  const id = String(b?.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  try {
    await removeGuest(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[guests] delete failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't remove them." },
      { status: 502 },
    );
  }
}
