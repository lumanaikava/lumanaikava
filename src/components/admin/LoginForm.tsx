"use client";

import { useState, type FormEvent } from "react";

const CREW = ["Ash", "Zach", "Karina"];

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(CREW[0]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const passcode = new FormData(e.currentTarget).get("passcode");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode, name }),
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
    <form onSubmit={submit} className="mx-auto mt-10 flex w-full max-w-sm flex-col gap-4">
      <fieldset>
        <legend className="mx-auto text-xs font-semibold uppercase tracking-[0.2em] text-shell/60">
          Who&apos;s pouring?
        </legend>
        <div className="mt-3 flex justify-center gap-2">
          {CREW.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setName(n)}
              className={`rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                name === n
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-shell/25 text-shell/70 hover:border-shell/50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>
      <label
        className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-shell/60"
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
        className="rounded-full border border-shell/25 bg-abyss/60 px-5 py-3 text-center text-shell outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={busy}
        className="btn-brush mx-auto text-xs font-bold uppercase tracking-[0.2em] text-shell"
      >
        {busy ? "..." : "Enter the Command Center"}
      </button>
      {error && <p className="text-sm text-coconut">{error}</p>}
    </form>
  );
}
