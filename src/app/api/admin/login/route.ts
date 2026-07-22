import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Each crew member's own passcode (env). Falls back to nothing if unset. */
function passcodeFor(name: string): string | undefined {
  switch (name) {
    case "Ash":
      return process.env.ADMIN_PASSCODE_ASH;
    case "Zach":
      return process.env.ADMIN_PASSCODE_ZACH;
    case "Karina":
      return process.env.ADMIN_PASSCODE_KARINA;
    default:
      return undefined;
  }
}

export async function POST(req: Request) {
  let body: { passcode?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const master = process.env.ADMIN_PASSCODE;
  const name = ["Ash", "Zach", "Karina"].includes(body.name ?? "")
    ? body.name!
    : "Crew";
  const given = body.passcode ?? "";

  // Accept the person's own passcode, or the shared master passcode.
  const personPass = passcodeFor(name);
  const ok = (personPass && given === personPass) || (master && given === master);
  if (!ok) {
    return NextResponse.json(
      { error: "Wrong passcode for that name." },
      { status: 401 },
    );
  }

  // The gate cookie stays the shared master value so the existing admin
  // routes keep working; a second cookie records who signed in.
  const res = NextResponse.json({ ok: true });
  const cookie = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // two weeks
  };
  res.cookies.set("lumanai_admin", master ?? "ok", cookie);
  res.cookies.set("lumanai_crew", name, cookie);
  return res;
}
