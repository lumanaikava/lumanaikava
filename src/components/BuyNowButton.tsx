"use client";

import { useState } from "react";

type Props = {
  variantId?: string;
  available: boolean;
  productName: string;
};

export default function BuyNowButton({
  variantId,
  available,
  productName,
}: Props) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [qty, setQty] = useState(1);

  if (!available || !variantId) {
    return (
      <div>
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-full border border-shell/20 px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-shell/40"
        >
          Sold Out
        </button>
        <p className="mt-3 text-sm text-shell/60">
          Fresh batches drop often — catch us at an{" "}
          <a
            href="/events#calendar"
            className="prose-link text-shell hover:text-gold"
          >
            upcoming event
          </a>{" "}
          or follow{" "}
          <a
            href="https://www.instagram.com/lumanaikava"
            target="_blank"
            rel="noopener noreferrer"
            className="prose-link text-shell hover:text-gold"
          >
            @lumanaikava
          </a>{" "}
          for restocks.
        </p>
      </div>
    );
  }

  async function buy() {
    setState("loading");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: qty }),
      });
      const body = await res.json();
      if (!res.ok || !body.checkoutUrl) throw new Error(body.error);
      window.location.href = body.checkoutUrl;
    } catch (err) {
      console.error(err);
      setState("error");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 rounded-full border border-shell/20 px-4 py-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
            Qty
          </span>
          <select
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            aria-label={`Quantity of ${productName}`}
            className="bg-transparent font-mono text-sm text-shell outline-none [&>option]:bg-abyss"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={buy}
          disabled={state === "loading"}
          className="rounded-full bg-gold px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-shell disabled:opacity-60"
        >
          {state === "loading" ? "Opening checkout..." : "Buy Now"}
        </button>
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-shell/40">
        Secure checkout via Shopify
      </p>
      {state === "error" && (
        <p className="mt-3 text-sm text-orchid">
          Checkout hiccuped — try again, or order via{" "}
          <a href="/contact" className="underline underline-offset-2">
            the contact page
          </a>
          .
        </p>
      )}
    </div>
  );
}
