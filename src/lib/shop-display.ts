/**
 * How the shop presents the Shopify catalog.
 *
 * Shopify owns what exists; this file owns what customers SEE — which
 * products show, in what order, with which artwork, and under what short
 * name. Shopify's handles are historic and messy (RUSH is still
 * "untitled-may21_11-42-27"), so nothing here should depend on them
 * reading nicely.
 */

/**
 * PRICES ARE HIDDEN SITE-WIDE while the real ones are being finalised
 * (Zach, 2026-08-11). Flip this back to false and prices return
 * everywhere at once — grid and product pages both read it.
 */
export const HIDE_PRICES = true;

/**
 * Kept off the shop entirely. Growlers and BASE are sold by hand, not
 * browsed — BASE especially is a secret item.
 */
const HIDDEN_HANDLES = new Set([
  "64-oz-growler",
  "raspberry-orange-spice-32-oz-growler",
  "copy-of-raspberry-orange-spice-32-oz-growler",
  "copy-of-raspberry-orange-spice-32-oz-growler-1",
  "base-64-oz",
]);

/** Anything whose handle or title looks like a growler, defensively. */
function looksLikeGrowler(handle: string, name: string): boolean {
  return /growler/i.test(handle) || /growler/i.test(name) || /^base\b/i.test(name);
}

export function isHiddenFromShop(handle: string, name: string): boolean {
  return HIDDEN_HANDLES.has(handle) || looksLikeGrowler(handle, name);
}

/**
 * Display order. Basic Batch leads the 8 oz bottles; RUSH sits last as
 * the newest thing rather than competing with the core lineup.
 */
const ORDER = [
  "basic-batch",
  "the-kolada",
  "raspberry-orange-spice",
  "ginger-honey-lemon",
  "untitled-may21_11-42-27", // RUSH
];

export function shopRank(handle: string): number {
  const i = ORDER.indexOf(handle);
  return i === -1 ? ORDER.length : i;
}

/**
 * Local transparent product artwork, keyed by Shopify handle. These beat
 * Shopify's own images: they're cut out on transparency so they sit on
 * the dark background instead of inside a white box.
 */
const ARTWORK: Record<string, string> = {
  "basic-batch": "/images/products/basic-batch.png",
  "the-kolada": "/images/products/the-kolada.png",
  "raspberry-orange-spice": "/images/products/raspberry-orange-spice.png",
  "ginger-honey-lemon": "/images/products/ginger-honey-lemon.png",
  "untitled-may21_11-42-27": "/images/products/rush.png",
};

export function artworkFor(handle: string): string | undefined {
  return ARTWORK[handle];
}

/** Short display names — the shop shows these, not Shopify's titles. */
const SHORT_NAMES: Record<string, string> = {
  "basic-batch": "Basic Batch",
  "the-kolada": "The Kolada",
  "raspberry-orange-spice": "Raspberry Orange Spice",
  "ginger-honey-lemon": "Ginger Honey Lemon",
  "untitled-may21_11-42-27": "RUSH",
};

export function shortName(handle: string, fallback: string): string {
  return SHORT_NAMES[handle] ?? fallback;
}

/** A one-line descriptor under the name. Deliberately terse. */
const SUBTITLES: Record<string, string> = {
  "basic-batch": "8 oz · traditional",
  "the-kolada": "8 oz · pineapple coconut",
  "raspberry-orange-spice": "8 oz · raspberry orange",
  "ginger-honey-lemon": "8 oz · ginger honey lemon",
  "untitled-may21_11-42-27": "Instant kava",
};

export function subtitleFor(handle: string): string | undefined {
  return SUBTITLES[handle];
}
