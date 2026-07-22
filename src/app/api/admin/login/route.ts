import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CREW = ["Ash", "Zach", "Karina"];

export async function POST(req: Request) {
  let body: { passcode?: string; name?: string };
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

  const name = CREW.includes(body.name ?? "") ? body.name! : "Crew";

  const res = NextResponse.json({ ok: true });
  const cookie = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // two weeks
  };
  res.cookies.set("lumanai_admin", expected, cookie);
  res.cookies.set("lumanai_crew", name, cookie);
  return res;
}
