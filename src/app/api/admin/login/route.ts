import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { passcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSCODE not configured on the server." },
      { status: 500 },
    );
  }
  if (body.passcode !== expected) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("lumanai_admin", expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // two weeks
  });
  return res;
}
