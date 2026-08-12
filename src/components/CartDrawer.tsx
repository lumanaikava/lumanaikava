"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SmsConsent from "@/components/SmsConsent";
import { MAX_PER_LINE, useCart } from "@/components/CartProvider";
// One money formatter for the whole site: the line labels came out of
// this function on the server, so the subtotal has to use it too or the
// two will eventually disagree on cents.
import { formatPrice } from "@/lib/integrations/shopify";

/**
 * MY CART — the slide-in panel.
 *
 * Everything up to the Checkout button is local: Shopify only hears
 * about the cart when someone actually buys, and the buyer finishes on
 * Shopify's own checkout so no card data comes near this code.
 */
export default function CartDrawer() {
  const { items, count, total, setQuantity, remove, open, closeCart } =
    useCart();

  const [busy, setBusy] = useState(false);
  /**
   * Whatever came back from the last checkout attempt, stamped with the
   * cart it was about.
   *
   * `adjusted` holds a real checkout URL for the case where Shopify
   * built a smaller cart than we sent — something sold out between
   * adding and paying — so the buyer can still continue, but only after
   * being told rather than arriving at a quietly shorter order.
   *
   * The stamp is what keeps it honest: change the cart and the message
   * stops matching, so it's dropped on the next render instead of
   * lingering over contents it no longer describes.
   */
  const [result, setResult] = useState<{
    cart: string;
    error?: string;
    adjusted?: string;
  } | null>(null);

  const signature = items.map((i) => `${i.variantId}x${i.quantity}`).join(",");
  const current = result?.cart === signature ? result : null;
  const error = current?.error;
  const adjusted = current?.adjusted;

  // SMS opt-in, captured here rather than at Shopify's checkout so the
  // consent lands in our CRM with our exact wording, and so a number is
  // only ever asked for when someone actually wants texts.
  const [smsConsent, setSmsConsent] = useState(false);
  const [smsName, setSmsName] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const phoneLooksReal = smsPhone.replace(/\D/g, "").length >= 10;

  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes, and the page behind stops scrolling while the panel
  // is over it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeCart]);

  if (!open) return null;

  async function checkout() {
    // A ticked box with no number isn't permission to anything — stop
    // here rather than recording a consent we can't act on.
    if (smsConsent && !phoneLooksReal) {
      setResult({
        cart: signature,
        error: "Add a mobile number, or untick the text-message box.",
      });
      return;
    }

    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          context: "shop",
          ...(smsConsent && phoneLooksReal
            ? {
                smsConsent: "yes",
                name: smsName.trim(),
                phone: smsPhone.trim(),
              }
            : {}),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.checkoutUrl) {
        throw new Error(body.error ?? "Checkout is unavailable right now.");
      }
      if (body.adjusted) {
        setResult({ cart: signature, adjusted: body.checkoutUrl });
        setBusy(false);
        return;
      }
      window.location.href = body.checkoutUrl;
    } catch (err) {
      setResult({
        cart: signature,
        error: err instanceof Error ? err.message : "Something went wrong.",
      });
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 h-full w-full cursor-default bg-abyss/70 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className="relative flex h-full w-full max-w-md flex-col border-l border-shell/15 bg-abyss shadow-[-24px_0_60px_rgba(0,0,0,0.55)]"
      >
        <header className="flex items-center justify-between border-b border-shell/10 px-6 py-5">
          <h2 className="h-sign text-2xl text-shell">
            My Cart{" "}
            {count > 0 && (
              <span className="font-mono text-sm font-normal text-shell/40">
                {count}
              </span>
            )}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="-mr-2 p-2 font-mono text-lg leading-none text-shell/50 transition-colors hover:text-gold"
          >
            ✕
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <p className="text-sm text-shell/60">Nothing in here yet.</p>
            <Link
              href="/products"
              onClick={closeCart}
              className="rounded-full border border-shell/25 px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-shell transition-colors hover:border-gold hover:text-gold"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-shell/10 overflow-y-auto px-6">
            {items.map((item) => {
              /* The 8 oz bottle and its growler are both "Basic Batch" —
                 without the variant the two rows' buttons announce
                 identically to a screen reader. */
              const label = item.variantName
                ? `${item.name}, ${item.variantName}`
                : item.name;
              return (
                <li key={item.variantId} className="flex gap-4 py-5">
                  <div className="flex h-20 w-14 shrink-0 items-end justify-center">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        width={112}
                        height={160}
                        sizes="56px"
                        className="h-full w-auto object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.5)]"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="h-sign-med text-sm text-shell">{item.name}</p>
                    {item.variantName && (
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-shell/40">
                        {item.variantName}
                      </p>
                    )}
                    <p className="mt-1 font-mono text-xs text-gold">
                      {item.priceLabel}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-shell/20">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.variantId, item.quantity - 1)
                          }
                          aria-label={`Remove one ${label}`}
                          className="px-3 py-1 font-mono text-sm text-shell/70 transition-colors hover:text-gold"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center font-mono text-xs text-shell">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.variantId, item.quantity + 1)
                          }
                          disabled={item.quantity >= MAX_PER_LINE}
                          aria-label={`Add one ${label}`}
                          className="px-3 py-1 font-mono text-sm text-shell/70 transition-colors hover:text-gold disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.variantId)}
                        aria-label={`Remove ${label} from cart`}
                        className="font-mono text-[10px] uppercase tracking-[0.15em] text-shell/35 transition-colors hover:text-coconut"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {items.length > 0 && (
          <footer className="space-y-4 border-t border-shell/10 px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
                Subtotal
              </span>
              <span className="h-sign text-2xl text-gold">
                {formatPrice(String(total))}
              </span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-shell/35">
              Shipping and tax calculated at checkout
            </p>

            <SmsConsent
              checked={smsConsent}
              onChange={setSmsConsent}
              note="Optional — your order is the same either way."
            />
            {smsConsent && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/50">
                    Your name
                  </span>
                  <input
                    value={smsName}
                    onChange={(e) => setSmsName(e.target.value)}
                    autoComplete="name"
                    className="mt-1.5 w-full rounded-xl border border-shell/20 bg-ocean/60 px-4 py-2.5 text-sm text-shell outline-none focus:border-gold"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/50">
                    Mobile number
                  </span>
                  <input
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(702) 555-0123"
                    aria-invalid={smsPhone.length > 0 && !phoneLooksReal}
                    className="mt-1.5 w-full rounded-xl border border-shell/20 bg-ocean/60 px-4 py-2.5 text-sm text-shell outline-none placeholder:text-shell/30 focus:border-gold"
                  />
                </label>
              </div>
            )}

            {adjusted ? (
              /* Loud, not silent: something went out of stock between
                 adding it and checking out. Say so before the buyer is
                 looking at a shorter order on Shopify's page. */
              <div className="space-y-3">
                <p className="text-sm text-coconut">
                  Something in your cart just sold out and isn&apos;t in the
                  order. The next screen shows exactly what&apos;s in it.
                </p>
                <a
                  href={adjusted}
                  className="block rounded-full bg-gold px-8 py-3.5 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-shell"
                >
                  Continue to checkout
                </a>
              </div>
            ) : (
              <button
                type="button"
                onClick={checkout}
                disabled={busy}
                className="w-full rounded-full bg-gold px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-shell disabled:opacity-60"
              >
                {busy ? "Opening checkout..." : "Checkout"}
              </button>
            )}

            {error && <p className="text-sm text-coconut">{error}</p>}
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-shell/30">
              Secure checkout via Shopify
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
}
