"use client";

import { useState, type FormEvent } from "react";

/**
 * The door. One field, one word, no explanation of what's behind it.
 *
 * Deliberately gives nothing away on a wrong answer — not "wrong
 * password", not a hint. Someone who was invited was told the word.
 */
export default function PartyGate() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const passcode = new FormData(e.currentTarget).get("passcode");
    const res = await fetch("/api/invited", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "Something went wrong.");
    setBusy(false);
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-10 flex w-full max-w-xs flex-col items-center gap-4"
    >
      <label
        className="font-mono text-[11px] uppercase tracking-[0.28em] text-shell/45"
        htmlFor="party-passcode"
      >
        Say the word
      </label>
      <input
        id="party-passcode"
        name="passcode"
        type="password"
        required
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className="w-full rounded-full border border-shell/25 bg-abyss/60 px-5 py-3 text-center font-mono uppercase tracking-[0.25em] text-shell outline-none transition-colors focus:border-gold"
      />
      <button
        type="submit"
        disabled={busy}
        className="btn-brush font-mono text-xs font-bold uppercase tracking-[0.2em] text-shell disabled:opacity-50"
        style={{ "--brush-bg": "var(--amethyst)" } as React.CSSProperties}
      >
        {busy ? "…" : "Enter"}
      </button>
      {error && <p className="text-center text-sm text-coconut">{error}</p>}
    </form>
  );
}
