"use client";

import { useCart } from "@/components/CartProvider";

/**
 * The header's way into the cart.
 *
 * The count comes from localStorage, which the server can't see, so the
 * badge stays hidden until the provider has read it — otherwise every
 * page would paint a "0" and then pop to the real number.
 */
export default function CartButton() {
  const { count, ready, openCart } = useCart();
  const showBadge = ready && count > 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={showBadge ? `Open cart, ${count} items` : "Open cart"}
      className="relative flex h-9 w-9 items-center justify-center text-shell/70 transition-colors hover:text-gold"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9.5 8V6a2.5 2.5 0 0 1 5 0v2" />
      </svg>
      {showBadge && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-mono text-[9px] font-bold text-abyss">
          {count}
        </span>
      )}
    </button>
  );
}
