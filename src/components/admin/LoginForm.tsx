"use client";

import { useState, type FormEvent } from "react";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const passcode = new FormData(e.currentTarget).get("passcode");
    const res = await fetch("/api/admin/login", {
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
    <form onSubmit={submit} className="mx-auto mt-10 flex w-full max-w-sm flex-col gap-3">
      <label
        className="text-xs font-semibold uppercase tracking-[0.2em] text-shell/60"
        htmlFor="passcode"
      >
        Passcode
      </label>
      <input
        id="passcode"
        name="passcode"
        type="password"
        required
        autoFocus
        className="rounded-full border border-shell/25 bg-abyss/60 px-5 py-3 text-shell outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-gold px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-shell disabled:opacity-60"
      >
        {busy ? "..." : "Enter the Command Center"}
      </button>
      {error && <p className="text-sm text-coconut">{error}</p>}
    </form>
  );
}
