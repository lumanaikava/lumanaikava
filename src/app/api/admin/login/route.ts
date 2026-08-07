import { NextResponse } from "next/server";
import { isCrew, roleOf, passcodeEnvName } from "@/lib/crew";
import {
  serializeSession,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/admin-session";

export const runtime = "nodejs";

/**
 * The passcode that signs this person in.
 *
 * Their own (ADMIN_PASSCODE_ARIES) if set, otherwise the shared
 * STAFF_PASSCODE for staff. The shared one exists so adding a crew
 * member doesn't lock them out until someone remembers to create an env
 * var — but it does let staff sign in as each other, which
 * passcodeIssues() warns about.
 *
 * Undefined means nobody can sign in as them: an unset var must never
 * mean "any passcode works".
 */
function passcodeFor(name: string): string | undefined {
  if (!isCrew(name)) return undefined;
  const own = process.env[passcodeEnvName(name)];
  if (own) return own;
  return roleOf(name) === "staff" ? process.env.STAFF_PASSCODE : undefined;
}

export async function POST(req: Request) {
  let body: { passcode?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = body.name ?? "";
  const role = roleOf(name);
  if (!role) {
    return NextResponse.json({ error: "Pick who you are." }, { status: 400 });
  }

  const given = body.passcode ?? "";
  const personPass = passcodeFor(name);
  const master = process.env.ADMIN_PASSCODE;

  // Say plainly that nobody set them up, rather than letting it look
  // like they keep typing the wrong code.
  if (!personPass && role === "staff") {
    return NextResponse.json(
      {
        error: `No passcode is set up for ${name} yet — ask Ash or Zach to add one.`,
      },
      { status: 403 },
    );
  }

  // The master passcode is an owner override — it must NOT be a way for
  // staff to sign in, or the whole staff/owner split is decorative.
  const ok =
    (personPass && given === personPass) ||
    (role === "owner" && master && given === master);

  if (!ok) {
    return NextResponse.json(
      { error: "Wrong passcode for that name." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true, name, role });
  res.cookies.set(
    SESSION_COOKIE,
    serializeSession(name, role),
    SESSION_COOKIE_OPTIONS,
  );
  // Retire the old cookies so an existing browser can't keep using the
  // pre-roles session, which granted everything to everyone.
  res.cookies.set("lumanai_admin", "", { path: "/", maxAge: 0 });
  res.cookies.set("lumanai_crew", "", { path: "/", maxAge: 0 });
  return res;
}
