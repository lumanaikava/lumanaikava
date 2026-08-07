/**
 * Who can sign in to the Command Center and log payroll.
 *
 * THE one place this list lives. It used to be copy-pasted into five
 * files — the login picker, the payroll form, the payroll report, the
 * payroll API's validation, and the login route — which meant adding a
 * person to four of them left them able to sign in but unable to save a
 * shift, with a confusing "Pick an employee" error and no clue why.
 *
 * Adding someone is now: add the name here, then set their passcode env
 * var (below) in Vercel.
 */
export const CREW: readonly string[] = [
  "Ash",
  "Zach",
  "Karina",
  "Aries",
  "Jadon",
];

export function isCrew(name: string): boolean {
  return CREW.includes(name);
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
