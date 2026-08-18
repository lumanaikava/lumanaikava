import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

/**
 * The door for /invited.
 *
 * Ash's call (2026-08-17): the page is password-only again. This isn't
 * theatre — a private event at a private residence is a different legal
 * posture from a public one, and "you needed a word to get in" is part
 * of what makes it private. The waiver at checkout is the other part.
 *
 * The word lives in PARTY_PASSCODE so it can change without a deploy.
 * Unset means nobody gets in, which is the safe direction to fail.
 */

const COOKIE = "lumanai_invited";

function matches(given: string, expected: string): boolean {
  const a = Buffer.from(given.trim().toLowerCase());
  const b = Buffer.from(expected.trim().toLowerCase());
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const expected = process.env.PARTY_PASSCODE;
  if (!expected) {
    return NextResponse.json(
      { error: "The list isn't open yet." },
      { status: 503 },
    );
  }

  let body: { passcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!matches(body.passcode ?? "", expected)) {
    return NextResponse.json(
      { error: "That's not it. Ask the person who invited you." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
