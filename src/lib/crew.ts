/**
 * Who can sign in to the Command Center, and what they're allowed to see.
 *
 * THE one place this list lives. It used to be copy-pasted into five
 * files, which meant adding a person to four of them left them able to
 * sign in but unable to save a shift, with a confusing "Pick an
 * employee" error and no clue why.
 *
 * Roles:
 *   owner — the whole Command Center: everyone's pay, orders, SMS,
 *           guest list, exports.
 *   staff — their own hours only. They can log and edit their own
 *           shifts and see their own totals. Nothing else, and the
 *           server enforces it (see lib/admin-session.ts) rather than
 *           just hiding the UI.
 *
 * Adding someone: add a line here, then set their passcode env var in
 * Vercel (ADMIN_PASSCODE_<NAME>).
 */

export type CrewRole = "owner" | "staff";

export type CrewMember = { name: string; role: CrewRole };

export const CREW_MEMBERS: readonly CrewMember[] = [
  { name: "Ash", role: "owner" },
  { name: "Zach", role: "owner" },
  { name: "Karina", role: "staff" },
  { name: "Aries", role: "staff" },
  { name: "Jadon", role: "staff" },
];

/** Just the names, in roster order. */
export const CREW: readonly string[] = CREW_MEMBERS.map((m) => m.name);

/**
 * Who receives the leftover % of an event's sales after the working
 * bartender's commission. He doesn't log shifts himself, so the server
 * creates his companion entry automatically.
 */
export const OWNER_CREDIT_NAME = "Ash";

export function isCrew(name: string): boolean {
  return CREW.includes(name);
}

export function roleOf(name: string): CrewRole | null {
  return CREW_MEMBERS.find((m) => m.name === name)?.role ?? null;
}

export function isOwner(name: string): boolean {
  return roleOf(name) === "owner";
}

/**
 * The env var holding one person's passcode — ADMIN_PASSCODE_ARIES, etc.
 *
 * Server-side only: it reads non-public env vars, so don't call this from
 * a client component. Names are ASCII first names today; if that ever
 * changes, this needs to strip accents/spaces to stay a valid env key.
 */
export function passcodeEnvName(name: string): string {
  return `ADMIN_PASSCODE_${name.toUpperCase()}`;
}
