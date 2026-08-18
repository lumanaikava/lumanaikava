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
 * Product prices. Hidden briefly on 2026-08-11 while they were being
 * finalised, restored 2026-08-12. One flag drives the grid and the
 * product pages together so they can never disagree.
 */
export const HIDE_PRICES = false;

/**
 * BASE only. It's a secret item, sold by hand and never browsed —
 * growlers are back on the shop as of 2026-08-11.
 */
const HIDDEN_HANDLES = new Set(["base-64-oz"]);

/**
 * BASE also matched by name, in case the handle ever changes. Careful:
 * this must NOT catch "Basic Batch", hence the word boundary and the
 * exclusion of anything containing "basic".
 */
function isBase(name: string): boolean {
  return /^\s*base\b/i.test(name) && !/basic/i.test(name);
}

export function isHiddenFromShop(handle: string, name: string): boolean {
  return HIDDEN_HANDLES.has(handle) || isBase(name);
}

/**
 * Display order. Basic Batch leads the 8 oz bottles, then the rest of
 * the flavours, then their growlers, with RUSH last as the newest thing
 * rather than competing with the core lineup.
 */
const ORDER = [
  "untitled-may21_11-42-27", // RUSH — newest product, leads the grid
  "basic-batch",
  "the-kolada",
  "raspberry-orange-spice",
  "ginger-honey-lemon",
  "64-oz-growler", // Basic Batch Growler
  "copy-of-raspberry-orange-spice-32-oz-growler", // The Kolada Growler
  "raspberry-orange-spice-32-oz-growler",
  "copy-of-raspberry-orange-spice-32-oz-growler-1", // Ginger Honey Lemon Growler
];

/** Handles that wear a NEW badge on the shop grid. */
const NEW_HANDLES = new Set(["untitled-may21_11-42-27"]);
export function isNew(handle: string): boolean {
  return NEW_HANDLES.has(handle);
}

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
  "64-oz-growler": "/images/products/growler-basic-batch.png",
  "raspberry-orange-spice-32-oz-growler":
    "/images/products/growler-raspberry-orange-spice.png",
  // Kolada and Ginger have no growler cutout of their own — Zach okayed
  // reusing the Basic Batch growler, since the vessel is what's being
  // shown and the flavour is named underneath it.
  "copy-of-raspberry-orange-spice-32-oz-growler":
    "/images/products/growler-basic-batch.png",
  "copy-of-raspberry-orange-spice-32-oz-growler-1":
    "/images/products/growler-basic-batch.png",
};

/**
 * Artwork for a specific size, where one exists. Kolada and Ginger have
 * no growler cutouts of their own, so they borrow Basic Batch's in both
 * sizes — the vessel is what's being shown and the flavour is named
 * beside it.
 */
const SIZE_ARTWORK: Record<string, Record<string, string>> = {
  "64-oz-growler": {
    "32 oz": "/images/products/growler-basic-batch-32.png",
  },
  "copy-of-raspberry-orange-spice-32-oz-growler": {
    "32 oz": "/images/products/growler-basic-batch-32.png",
  },
  "copy-of-raspberry-orange-spice-32-oz-growler-1": {
    "32 oz": "/images/products/growler-basic-batch-32.png",
  },
  "raspberry-orange-spice-32-oz-growler": {
    "32 oz": "/images/products/growler-raspberry-orange-spice-32.png",
  },
};

export function artworkFor(handle: string, variantTitle?: string): string | undefined {
  if (variantTitle) {
    const sized = SIZE_ARTWORK[handle]?.[variantTitle.trim()];
    if (sized) return sized;
  }
  return ARTWORK[handle];
}

/** Short display names — the shop shows these, not Shopify's titles. */
const SHORT_NAMES: Record<string, string> = {
  "basic-batch": "Basic Batch",
  "the-kolada": "The Kolada",
  "raspberry-orange-spice": "Raspberry Orange Spice",
  "ginger-honey-lemon": "Ginger Honey Lemon",
  "untitled-may21_11-42-27": "RUSH",
  "64-oz-growler": "Basic Batch",
  "copy-of-raspberry-orange-spice-32-oz-growler": "The Kolada",
  "raspberry-orange-spice-32-oz-growler": "Raspberry Orange Spice",
  "copy-of-raspberry-orange-spice-32-oz-growler-1": "Ginger Honey Lemon",
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
  "64-oz-growler": "Growler",
  "copy-of-raspberry-orange-spice-32-oz-growler": "Growler",
  "raspberry-orange-spice-32-oz-growler": "Growler",
  "copy-of-raspberry-orange-spice-32-oz-growler-1": "Growler",
};

export function subtitleFor(handle: string): string | undefined {
  return SUBTITLES[handle];
}

/**
 * What the grid shows for price.
 *
 * A growler is sold in two sizes at two prices, so a single figure is
 * always wrong for half the buyers — it either undersells the 64oz or
 * scares people off the 32oz. Show the span instead.
 *
 * Computed from the live variants rather than written down, so a
 * reprice in Shopify moves this on its own.
 */
export function priceRangeLabel(
  product: {
    priceLabel: string;
    variants: { amount: number; priceLabel: string }[];
  },
): string {
  const priced = product.variants.filter((v) => v.amount > 0);
  if (priced.length < 2) return product.priceLabel;

  const low = priced.reduce((a, b) => (b.amount < a.amount ? b : a));
  const high = priced.reduce((a, b) => (b.amount > a.amount ? b : a));
  if (low.amount === high.amount) return low.priceLabel;

  // En dash, not a hyphen — this is a range, not a compound word.
  return `${low.priceLabel}–${high.priceLabel}`;
}
