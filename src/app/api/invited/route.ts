import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * The velvet rope for /invited. Right password → 30-day cookie, the
 * page unlocks. The passcode lives in .env.local (PARTY_PASSCODE) so
 * it can change any time without touching code.
 */
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

  const given = (body.passcode ?? "").trim();
  if (given.toLowerCase() !== expected.toLowerCase()) {
    return NextResponse.json(
      { error: "That's not it. Ask the friend who told you about this." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("lumanai_invited", expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
