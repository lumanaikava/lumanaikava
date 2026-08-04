/**
 * SMS opt-in checkbox — TCPA-shaped.
 *
 * Texting someone for marketing needs their express written consent, and
 * a phone number handed over to get an event quote does NOT count. The
 * rules this markup is built around:
 *   - unchecked by default (a pre-ticked box is not consent)
 *   - its own checkbox, not bundled into "I agree to the terms"
 *   - states who's texting, roughly how often, that rates may apply,
 *     and how to stop
 * The submitted value gets written into the lead's GHL notes with a
 * timestamp, so there's a record of when and how consent was given.
 */
export default function SmsConsent() {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-shell/15 bg-abyss/40 p-4">
      <input
        type="checkbox"
        name="smsConsent"
        value="yes"
        className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
      />
      <span className="text-xs leading-relaxed text-shell/70">
        <span className="font-semibold text-shell">
          Text me about events and drink drops.
        </span>{" "}
        By checking this box, you agree to receive marketing text messages
        from <strong className="text-shell">Lumanai Kava</strong> at the
        number provided. Message frequency varies (about twice a month).
        Message and data rates may apply. Reply{" "}
        <strong className="text-shell">STOP</strong> to unsubscribe or{" "}
        <strong className="text-shell">HELP</strong> for help. See our{" "}
        <a
          href="/policies/privacy-policy"
          className="underline underline-offset-2 hover:text-gold"
        >
          Privacy Policy
        </a>
        . Optional — we&apos;ll still answer you either way.
      </span>
    </label>
  );
}
