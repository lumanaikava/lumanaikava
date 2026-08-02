/**
 * SMS consent record-keeping.
 *
 * Under the TCPA it isn't enough to have consent — you have to be able to
 * PROVE it: who agreed, when, and to exactly what wording. The forms only
 * send a checkbox, so we stamp the rest here and append it to the lead's
 * message, which lands in GoHighLevel as part of the contact record.
 *
 * Keep CONSENT_LANGUAGE in sync with the checkbox copy in
 * src/components/SmsConsent.tsx — it's the sentence being attested to.
 */

export const CONSENT_LANGUAGE =
  "Text me about events and drink drops. You'll hear from Lumanai a couple times a month — never more. Message and data rates may apply, and you can reply STOP any time to end it.";

/** True when the form's checkbox came back ticked. */
export function hasSmsConsent(value: unknown): boolean {
  return value === "yes" || value === "on" || value === true;
}

/**
 * A dated, quotable consent line to append to the lead's message — or a
 * short "declined" note, so a blank is never ambiguous later.
 */
export function consentNote(granted: boolean, source: string): string {
  const stamp = new Date().toISOString();
  return granted
    ? `\n\n---\nSMS CONSENT: GRANTED ${stamp} via ${source}\nAgreed to: "${CONSENT_LANGUAGE}"`
    : `\n\n---\nSMS CONSENT: not given (${source}) — do not send marketing texts.`;
}
