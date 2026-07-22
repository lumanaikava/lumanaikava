"use client";

import { useState } from "react";

export default function BuyTicket({
  variantId,
  priceLabel,
}: {
  variantId: string;
  priceLabel: string;
}) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: qty }),
      });
      const body = await res.json();
      if (!res.ok || !body.checkoutUrl) {
        throw new Error(body.error ?? "Checkout is unavailable right now.");
      }
      window.location.href = body.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-4">
        <label
          htmlFor="ticket-qty"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50"
        >
          Tickets
        </label>
        <select
          id="ticket-qty"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="rounded-full border border-shell/25 bg-abyss/60 px-4 py-2 text-shell outline-none focus:border-gold"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={buy}
        disabled={busy}
        className="btn-brush font-mono text-sm font-bold uppercase tracking-[0.2em] text-shell"
      >
        {busy ? "Opening checkout..." : `Get Tickets · ${priceLabel}`}
      </button>
      {error && <p className="text-sm text-coconut">{error}</p>}
    </div>
  );
}
