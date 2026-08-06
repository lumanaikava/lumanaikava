"use client";

import { useState } from "react";

export type Tier = {
  variantId: string;
  /** Shopify variant title — "General Admission", "VIP", … */
  title: string;
  priceLabel: string;
  available: boolean;
};

/**
 * What each tier actually gets you. Keyed by a lowercased fragment of the
 * Shopify variant title, so renaming "VIP" to "VIP Table" in Shopify keeps
 * working. Edit these lines freely — they're the only promise the page
 * makes about what's included, so they should match what the crew delivers.
 */
const PERKS: { match: string; perks: string[] }[] = [
  {
    match: "vip",
    perks: [
      "Everything in General",
      "First pour of the exclusives",
      "Reserved seating at the bar",
      "Take-home RUSH tin",
    ],
  },
  {
    match: "general",
    perks: ["Open kava bar all night", "The full launch menu", "Live DJ"],
  },
];

function perksFor(title: string): string[] {
  const t = title.toLowerCase();
  return PERKS.find((p) => t.includes(p.match))?.perks ?? [];
}

export default function BuyTicket({ tiers }: { tiers: Tier[] }) {
  const firstAvailable = tiers.find((t) => t.available) ?? tiers[0];
  const [selected, setSelected] = useState(firstAvailable?.variantId ?? "");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tier = tiers.find((t) => t.variantId === selected) ?? firstAvailable;
  // A single-variant product doesn't need a chooser — Shopify names that
  // lone variant "Default Title", which should never reach a guest's eyes.
  const showTiers = tiers.length > 1;

  async function buy() {
    if (!tier) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: tier.variantId, quantity: qty }),
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

  if (!tier) return null;

  return (
    <div className="flex flex-col gap-6">
      {showTiers && (
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Choose your ticket</legend>
          {tiers.map((t) => {
            const active = t.variantId === tier.variantId;
            return (
              <label
                key={t.variantId}
                className={`relative cursor-pointer rounded-2xl border p-5 text-left transition ${
                  active
                    ? "border-gold bg-gold/10"
                    : "border-shell/20 bg-abyss/40 hover:border-shell/40"
                } ${t.available ? "" : "cursor-not-allowed opacity-45"}`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={t.variantId}
                  checked={active}
                  disabled={!t.available}
                  onChange={() => setSelected(t.variantId)}
                  className="sr-only"
                />
                <span className="h-sign-med block text-xl text-shell">
                  {t.title}
                </span>
                <span className="mt-1 block font-mono text-2xl font-bold text-gold">
                  {t.priceLabel}
                </span>
                {!t.available && (
                  <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-coconut">
                    Sold out
                  </span>
                )}
                <ul className="mt-3 space-y-1">
                  {perksFor(t.title).map((p) => (
                    <li key={p} className="text-xs leading-snug text-shell/70">
                      <span aria-hidden className="mr-1.5 text-gold">
                        ·
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </label>
            );
          })}
        </fieldset>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4">
        <label
          htmlFor="ticket-qty"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50"
        >
          How many
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

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={buy}
          disabled={busy || !tier.available}
          className="btn-brush font-mono text-sm font-bold uppercase tracking-[0.2em] text-shell"
          style={{ "--brush-bg": "var(--amethyst)" } as React.CSSProperties}
        >
          {busy
            ? "Opening checkout..."
            : tier.available
              ? `Claim ${qty > 1 ? `${qty} spots` : "your spot"} · ${tier.priceLabel}`
              : "Sold out"}
        </button>
        {error && <p className="text-sm text-coconut">{error}</p>}
      </div>
    </div>
  );
}
