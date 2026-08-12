"use client";

import { useState } from "react";
import type { CartItem } from "@/components/CartProvider";
import { useCart } from "@/components/CartProvider";

type Props = {
  /** Absent when the product isn't live in Shopify, so nothing can be added. */
  item?: Omit<CartItem, "quantity">;
  available: boolean;
  productName: string;
};

/**
 * Add to Cart — the only way a shop product reaches checkout.
 *
 * The old Buy Now went straight to Shopify with one line, which skipped
 * both the cart and the SMS opt-in that now lives in it. One path in,
 * one place the order is assembled.
 */
export default function AddToCartButton({
  item,
  available,
  productName,
}: Props) {
  const { add, openCart } = useCart();
  const [qty, setQty] = useState(1);

  if (!available || !item) {
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
          onClick={() => {
            add(item, qty);
            // The drawer sliding open IS the confirmation — no toast, and
            // the buyer lands one tap from checking out.
            openCart();
          }}
          className="rounded-full bg-gold px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-shell"
        >
          Add to Cart
        </button>
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-shell/40">
        Secure checkout via Shopify
      </p>
    </div>
  );
}
