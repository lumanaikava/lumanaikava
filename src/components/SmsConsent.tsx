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
 *
 * Works uncontrolled inside a plain <form> (contact, booking) or
 * controlled where the answer drives the UI (ticket checkout needs to
 * ask for a number once the box is ticked). Either way it starts
 * unchecked — that is the whole point and must never be defaulted on.
 */
export default function SmsConsent({
  checked,
  onChange,
  note,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Replaces the trailing reassurance line where "we'll answer you
   *  either way" doesn't fit — e.g. during a purchase. */
  note?: string;
}) {
  const controlled = onChange !== undefined;
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-shell/15 bg-abyss/40 p-4">
      <input
        type="checkbox"
        name="smsConsent"
        value="yes"
        {...(controlled
          ? { checked: Boolean(checked), onChange: (e) => onChange(e.target.checked) }
          : {})}
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
        . {note ?? "Optional — we'll still answer you either way."}
      </span>
    </label>
  );
}
