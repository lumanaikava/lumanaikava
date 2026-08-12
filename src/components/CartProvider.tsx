"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

/**
 * The cart.
 *
 * Lives entirely in the browser (localStorage) and only becomes a real
 * Shopify cart at checkout. That keeps it instant, keeps it working
 * while signed out, and means an abandoned cart costs Shopify nothing.
 *
 * Prices are stored as the formatted label Shopify gave us plus the raw
 * amount — the label so we never re-format money ourselves and risk
 * disagreeing with checkout, the amount so we can total it.
 */

export type CartItem = {
  variantId: string;
  handle: string;
  name: string;
  /** e.g. "64 oz" — omitted when the product has one variant. */
  variantName?: string;
  priceLabel: string;
  amount: number;
  image?: string;
  quantity: number;
};

type CartApi = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQuantity: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  /** False until localStorage has been read, so the badge can't flash. */
  ready: boolean;
  /**
   * Whether the drawer is showing. It lives here rather than in the
   * drawer because two unrelated components open it — the header button
   * and every Add to Cart on the site.
   */
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const KEY = "lumanai_cart_v1";

/** Per-line ceiling. The checkout route enforces the same number. */
export const MAX_PER_LINE = 20;

const clampQty = (n: number) =>
  Math.min(Math.max(Math.round(n) || 1, 1), MAX_PER_LINE);

/* ── The store ───────────────────────────────────────────────────
   The cart is external state: it lives in localStorage, the server
   can't see it, and a second tab can change it underneath us.
   useSyncExternalStore is React's shape for exactly that — no
   read-on-mount effect, no hydration mismatch, and subscribing to
   `storage` keeps two open tabs showing the same cart. */

const EMPTY: CartItem[] = [];

/** Cached so repeat reads return the same reference React compares. */
let snapshot: CartItem[] | null = null;
const listeners = new Set<() => void>();

/**
 * Storage is user-writable and survives deploys, so anything read back
 * out is treated as untrusted: one malformed entry from an older shape
 * would otherwise render as "$NaN" across the whole cart.
 */
function isStoredItem(value: unknown): value is CartItem {
  const i = value as Partial<CartItem> | null;
  return (
    typeof i === "object" &&
    i !== null &&
    typeof i.variantId === "string" &&
    typeof i.name === "string" &&
    typeof i.priceLabel === "string" &&
    typeof i.amount === "number" &&
    Number.isFinite(i.amount) &&
    typeof i.quantity === "number" &&
    Number.isFinite(i.quantity)
  );
}

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const items = parsed
      .filter(isStoredItem)
      .map((i) => ({ ...i, quantity: clampQty(i.quantity) }));
    return items.length > 0 ? items : EMPTY;
  } catch {
    /* corrupt or unavailable storage — start empty rather than crash */
    return EMPTY;
  }
}

function getSnapshot(): CartItem[] {
  if (snapshot === null) snapshot = readStorage();
  return snapshot;
}

/** The server has no cart. Rendering one here would break hydration. */
function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function emit() {
  for (const listener of listeners) listener();
}

/** Another tab wrote the cart — drop the cache and re-read. */
function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== KEY) return;
  snapshot = null;
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function update(fn: (prev: CartItem[]) => CartItem[]) {
  const next = fn(getSnapshot());
  snapshot = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota — the cart still works for this session */
  }
  emit();
}

/* ── The provider ────────────────────────────────────────────── */

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // False through the hydration render, true from the first client
  // render on — which is exactly when the count becomes trustworthy.
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [open, setOpen] = useState(false);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    update((prev) => {
      const found = prev.find((i) => i.variantId === item.variantId);
      if (found) {
        // Take the incoming details over the stored ones — this add came
        // from a page Shopify just rendered, so its price is the fresher
        // of the two if it moved since the line was first added.
        return prev.map((i) =>
          i.variantId === item.variantId
            ? { ...item, quantity: clampQty(i.quantity + qty) }
            : i,
        );
      }
      return [...prev, { ...item, quantity: clampQty(qty) }];
    });
  }, []);

  const setQuantity = useCallback((variantId: string, qty: number) => {
    update((prev) =>
      qty <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) =>
            i.variantId === variantId ? { ...i, quantity: clampQty(qty) } : i,
          ),
    );
  }, []);

  const remove = useCallback(
    (variantId: string) =>
      update((prev) => prev.filter((i) => i.variantId !== variantId)),
    [],
  );

  const clear = useCallback(() => update(() => EMPTY), []);

  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = useMemo<CartApi>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      total: items.reduce((n, i) => n + i.amount * i.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      ready,
      open,
      openCart,
      closeCart,
    }),
    [items, add, setQuantity, remove, clear, ready, open, openCart, closeCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
