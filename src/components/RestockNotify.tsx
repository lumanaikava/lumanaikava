"use client";

import { useState } from "react";

/**
 * "Notify me when it's back" for a product that's paused (Ash stopped
 * brewing bottles and growlers in Nov 2026 for at least a month). The
 * signup goes through /api/contact to the GHL webhook like every other
 * form, tagged [Restock] with the product, so there's a list to email
 * when production restarts.
 */
export default function RestockNotify({ productName }: { productName: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Restock signup",
          email,
          message: `[Restock] Notify me when ${productName} is back`,
        }),
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-shell">
        You&apos;re on the list. We&apos;ll email you the moment {productName}{" "}
        is back.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <label
        htmlFor="restock-email"
        className="block text-sm text-shell/80"
      >
        Get an email the moment it&apos;s back.
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id="restock-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-full border border-shell/25 bg-transparent px-4 py-3 text-sm text-shell placeholder:text-shell/35 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-full bg-gold px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss transition-opacity disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Notify me"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-sm text-red-300">
          That didn&apos;t go through. Please try again.
        </p>
      )}
    </form>
  );
}
