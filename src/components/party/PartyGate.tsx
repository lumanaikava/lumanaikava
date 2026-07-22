"use client";

import { useState, type FormEvent } from "react";

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
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-10 flex w-full max-w-sm flex-col items-center gap-4"
    >
      <label
        className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50"
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
        className="w-full rounded-full border border-shell/25 bg-abyss/60 px-5 py-3 text-center text-shell outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={busy}
        className="btn-brush font-mono text-xs font-bold uppercase tracking-[0.2em] text-shell"
        style={{ "--brush-bg": "var(--amethyst)" } as React.CSSProperties}
      >
        {busy ? "..." : "Enter"}
      </button>
      {error && <p className="text-sm text-coconut">{error}</p>}
    </form>
  );
}
