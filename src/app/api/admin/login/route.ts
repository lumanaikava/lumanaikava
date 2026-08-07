import { NextResponse } from "next/server";
import { CREW, isCrew, passcodeEnvName } from "@/lib/crew";

export const runtime = "nodejs";

/**
 * Each crew member's own passcode, e.g. ADMIN_PASSCODE_ARIES. Derived
 * from the name rather than a hand-written switch so adding someone to
 * CREW is genuinely all it takes — a missed case here used to mean the
 * person could only get in with the shared master passcode.
 *
 * Returns undefined when unset, and the caller then requires the master
 * passcode — an unset var must never mean "any passcode works".
 */
function passcodeFor(name: string): string | undefined {
  if (!isCrew(name)) return undefined;
  return process.env[passcodeEnvName(name)];
}

export async function POST(req: Request) {
  let body: { passcode?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const master = process.env.ADMIN_PASSCODE;
  const name = CREW.includes(body.name ?? "") ? body.name! : "Crew";
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
