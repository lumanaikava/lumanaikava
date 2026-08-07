import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { cookies } from "next/headers";
import {
  CREW_MEMBERS,
  roleOf,
  passcodeEnvName,
  type CrewRole,
} from "@/lib/crew";

/**
 * Command Center sessions.
 *
 * The old scheme stored the shared passcode in `lumanai_admin` and the
 * signed-in name in a plain `lumanai_crew` cookie. That was fine when
 * everyone saw everything, but now the name decides whether you can see
 * the whole payroll — and a plain cookie is trivially editable (httpOnly
 * stops JavaScript, NOT devtools or curl). Anyone could have set
 * `lumanai_crew=Ash` and walked in.
 *
 * So the session is signed: `name.role.hmac`. The HMAC is over the
 * name+role using a server-only secret, so a staff member can read their
 * own cookie all they like and still can't mint an owner one.
 */

const COOKIE = "lumanai_session";
const MAX_AGE = 60 * 60 * 24 * 14; // two weeks

export type Session = {
  authed: boolean;
  /** "" when signed out. */
  name: string;
  role: CrewRole | null;
  isOwner: boolean;
};

const SIGNED_OUT: Session = {
  authed: false,
  name: "",
  role: null,
  isOwner: false,
};

/**
 * Key for signing sessions. SESSION_SECRET is the real answer; falling
 * back to the passcode keeps things working before it's set, and a
 * random per-boot key is the last resort — that one invalidates sessions
 * on every restart, which is safe (everyone re-logs-in) rather than
 * silently unsigned.
 */
const FALLBACK_KEY = randomBytes(32).toString("hex");
function signingKey(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSCODE || FALLBACK_KEY;
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function serializeSession(name: string, role: CrewRole): string {
  const payload = `${name}.${role}`;
  return `${payload}.${sign(payload)}`;
}

/** Parse + verify a cookie value. Null if missing, malformed or forged. */
export function parseSession(value: string | undefined): Session {
  if (!value) return SIGNED_OUT;
  const parts = value.split(".");
  if (parts.length !== 3) return SIGNED_OUT;
  const [name, role, mac] = parts;
  if (!safeEqual(mac, sign(`${name}.${role}`))) return SIGNED_OUT;

  // The signature only proves WE issued it. The roster is still the
  // authority on who exists and what they are — so if someone's role
  // changed (or they left) since the cookie was minted, the roster wins.
  const current = roleOf(name);
  if (!current || current !== role) return SIGNED_OUT;

  return { authed: true, name, role: current, isOwner: current === "owner" };
}

export async function getSession(): Promise<Session> {
  const jar = await cookies();
  return parseSession(jar.get(COOKIE)?.value);
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

/* ── Config health ─────────────────────────────────────────── */

export type PasscodeIssue = { level: "critical" | "warn"; message: string };

/**
 * Roles are only as good as the passcodes behind them. If a staff member
 * knows a code that also signs in an owner, the whole separation is
 * decorative — so surface that in the UI rather than letting it look
 * secure when it isn't.
 */
export function passcodeIssues(): PasscodeIssue[] {
  const issues: PasscodeIssue[] = [];
  const master = process.env.ADMIN_PASSCODE;

  const codes = new Map<string, string[]>();
  for (const m of CREW_MEMBERS) {
    const code = process.env[passcodeEnvName(m.name)];
    if (!code) continue;
    codes.set(code, [...(codes.get(code) ?? []), m.name]);
  }

  // Any staff member sharing a code with an owner can sign in as them.
  for (const [code, names] of codes) {
    const owners = names.filter((n) => roleOf(n) === "owner");
    const staff = names.filter((n) => roleOf(n) === "staff");
    if (owners.length && staff.length) {
      issues.push({
        level: "critical",
        message: `${staff.join(", ")} share a passcode with ${owners.join(", ")} — they can sign in as an owner and see all pay. Give the owners a different code.`,
      });
    }
    if (staff.length > 1) {
      issues.push({
        level: "warn",
        message: `${staff.join(", ")} share the same passcode, so they can log hours as each other.`,
      });
    }
  }

  // The master passcode signs in as anybody.
  if (master) {
    const staffOnMaster = CREW_MEMBERS.filter(
      (m) => m.role === "staff" && process.env[passcodeEnvName(m.name)] === master,
    ).map((m) => m.name);
    if (staffOnMaster.length) {
      issues.push({
        level: "critical",
        message: `${staffOnMaster.join(", ")} use the master passcode, which signs in as anyone. Change theirs, or change the master.`,
      });
    }
  }

  if (!process.env.SESSION_SECRET) {
    issues.push({
      level: "warn",
      message:
        "SESSION_SECRET isn't set — sessions are signed with the admin passcode instead. Set a random SESSION_SECRET in Vercel so changing a passcode doesn't sign everyone out.",
    });
  }

  return issues;
}
