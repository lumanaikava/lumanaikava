import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-session";
import {
  readEventsStrict,
  saveEvents,
  readFaqStrict,
  saveFaq,
  contentSheetConfigured,
} from "@/lib/integrations/content-sheet";
import {
  newId,
  EVENT_KINDS,
  type SiteEvent,
  type SiteFaq,
  type EventKind,
} from "@/lib/site-content";

export const runtime = "nodejs";

/** Editing what the public site says is an owner action. */
async function requireOwner() {
  const session = await getSession();
  return session.isOwner ? null : session;
}

const refuse = (session: { authed: boolean }) =>
  NextResponse.json(
    { error: session.authed ? "Owners only." : "Not signed in." },
    { status: session.authed ? 403 : 401 },
  );

const needsSheet = () =>
  NextResponse.json(
    {
      error:
        "The Site Content sheet isn't connected yet. See 'Site Content Setup.md' in the Lumanai Business folder.",
    },
    { status: 503 },
  );

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function GET() {
  const denied = await requireOwner();
  if (denied) return refuse(denied);
  if (!contentSheetConfigured()) {
    return NextResponse.json({ ready: false, events: [], faq: [] });
  }
  try {
    const [events, faq] = await Promise.all([
      readEventsStrict(),
      readFaqStrict(),
    ]);
    return NextResponse.json({ ready: true, events, faq });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't read the sheet." },
      { status: 502 },
    );
  }
}

/**
 * One endpoint for both lists, because the operations are identical and
 * the whole tab is rewritten either way:
 *   { kind: "events" | "faq", op: "add" | "update" | "delete", item }
 */
export async function POST(req: Request) {
  const denied = await requireOwner();
  if (denied) return refuse(denied);
  if (!contentSheetConfigured()) return needsSheet();

  let b: Record<string, unknown>;
  try {
    b = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const kind = b.kind === "faq" ? "faq" : "events";
  const op = String(b.op ?? "");
  const item = (b.item ?? {}) as Record<string, unknown>;

  try {
    if (kind === "events") {
      // Read-modify-write. The read is the STRICT one so a temporary
      // failure can't cause us to overwrite the tab with nothing.
      const all = await readEventsStrict();
      const next = applyEvent(all, op, item);
      if (!next) return NextResponse.json({ error: "Unknown op." }, { status: 400 });
      await saveEvents(next);
      return NextResponse.json({ ok: true, events: next });
    }
    const all = await readFaqStrict();
    const next = applyFaq(all, op, item);
    if (!next) return NextResponse.json({ error: "Unknown op." }, { status: 400 });
    await saveFaq(next);
    return NextResponse.json({ ok: true, faq: next });
  } catch (err) {
    console.error("[content] write failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't save." },
      { status: 502 },
    );
  }
}

function applyEvent(
  all: SiteEvent[],
  op: string,
  raw: Record<string, unknown>,
): SiteEvent[] | null {
  const kindVal = String(raw.kind ?? "event");
  const built: SiteEvent = {
    id: str(raw.id, 40) || newId("e"),
    date: str(raw.date, 10),
    title: str(raw.title, 120),
    time: str(raw.time, 40),
    location: str(raw.location, 120),
    kind: (EVENT_KINDS as string[]).includes(kindVal)
      ? (kindVal as EventKind)
      : "event",
    hidden: raw.hidden === true,
    note: str(raw.note, 300),
  };

  if (op === "add") return [...all, built];
  if (op === "update")
    return all.map((e) => (e.id === built.id ? built : e));
  if (op === "delete") return all.filter((e) => e.id !== str(raw.id, 40));
  return null;
}

function applyFaq(
  all: SiteFaq[],
  op: string,
  raw: Record<string, unknown>,
): SiteFaq[] | null {
  const built: SiteFaq = {
    id: str(raw.id, 40) || newId("f"),
    q: str(raw.q, 200),
    a: String(raw.a ?? "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, 12),
    hidden: raw.hidden === true,
  };

  if (op === "add") return [...all, built];
  if (op === "update") return all.map((f) => (f.id === built.id ? built : f));
  if (op === "delete") return all.filter((f) => f.id !== str(raw.id, 40));
  return null;
}
