"use client";

/**
 * The liability waiver, agreed before checkout opens.
 *
 * Ash's wording, verbatim and unabridged — this is the text that has to
 * hold up if something goes wrong at a private residence, so it is not
 * summarised, truncated behind a "read more", or paraphrased. It ships
 * unticked and the buy button stays disabled until it isn't.
 *
 * The acceptance is recorded with the order (see /api/checkout), so
 * there's a timestamped record of who agreed to what, rather than only
 * a box that happened to be ticked in someone's browser.
 */

export const WAIVER_TEXT =
  "I acknowledge that LUNA EKLIPTIKA is a private, invitation-only event held at a private residence. I agree to treat the property, its contents, and surrounding grounds with respect and care, and understand I may be held personally responsible for any damage I cause. In consideration for being permitted to attend, I release, waive, discharge, and covenant not to sue the property owner, Terra Incognita LLC, and their respective agents, employees, contractors, and affiliates (collectively, the “Released Parties”) from any and all liability, claims, demands, or causes of action arising out of or related to any loss, damage, injury, or death that may occur during or as a result of my attendance, whether caused by negligence of the Released Parties or otherwise, except where prohibited by law or resulting from gross negligence or willful misconduct. I understand attendance is voluntary, I assume all risks associated with attending, and I am attending at my own risk.";

export default function Waiver({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-shell/15 bg-abyss/40 p-4 text-left transition hover:border-shell/30">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--gold)]"
      />
      <span className="text-[11px] leading-relaxed text-shell/60">
        {WAIVER_TEXT}
      </span>
    </label>
  );
}
