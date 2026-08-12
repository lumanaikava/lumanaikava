import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "node:crypto";

/**
 * "I changed the sheet, show it now."
 *
 * The event pages are cached for a minute, which is right for the
 * hundredth visitor and wrong for the person who just fixed a start
 * time and wants to see it. The EventCalendar Apps Script pings this on
 * every edit, so a cell change lands on the site in a couple of seconds
 * instead of on the next revalidation.
 *
 * The cache TTL stays as the safety net: if this endpoint is never
 * called — no trigger installed, script broken, secret missing — the
 * site still catches up on its own. Nothing here is load-bearing.
 */

export const dynamic = "force-dynamic";

/** Constant-time, and never throws on a length mismatch. */
function matches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Everything the sheet can change: the calendar on Find Us, the ticker
 * on the home page, per-event menus, the FAQ, Our Story. Purging by
 * root layout is blunter than listing them, and blunt is correct — a
 * missed path here shows up as "the site didn't update", which is the
 * exact complaint this exists to prevent.
 */
function purge() {
  revalidatePath("/", "layout");
}

export async function POST(req: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not set on the server." },
      { status: 503 },
    );
  }

  // Header or body, because Apps Script's UrlFetchApp is easier to get
  // right with one than the other depending on how it's written.
  let given = req.headers.get("x-revalidate-secret") ?? "";
  if (!given) {
    const body = (await req.json().catch(() => ({}))) as { secret?: string };
    given = body.secret ?? "";
  }

  if (!matches(given, expected)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  purge();
  return NextResponse.json({ ok: true, revalidated: new Date().toISOString() });
}
