/**
 * LUNA EKLIPTIKA tiers.
 *
 * Prices and stock come LIVE from Shopify — never hardcode money here.
 * This file only says what each tier *includes*, matched to the Shopify
 * variant name, because that's a promise to a paying guest and it should
 * live somewhere a human can read and correct.
 *
 * Perk lists are Ash's words (2026-08-17). Don't paraphrase them — the
 * partner names and the dollar values are commitments.
 *
 * Order matters: tiers render in the order listed, lowest first.
 */

export type PartyTier = {
  /** Lowercased fragment matched against the Shopify variant title. */
  match: string;
  /** What the guest sees. */
  label: string;
  perks: string[];
  /** One-line hook under the name. */
  note?: string;
  /** Gets the 7–8PM VIP Reception. */
  vipReception?: boolean;
  /**
   * How hard this tier shows off, 0–3. Drives the visual escalation —
   * border, glow, corner marks — so the ladder reads as a ladder before
   * anyone has finished reading a single perk.
   */
  flourish: 0 | 1 | 2 | 3;
};

export const PARTY_TIERS: PartyTier[] = [
  {
    match: "obsidian",
    label: "Obsidian",
    note: "The night, in full",
    perks: [
      "One hand-crafted mixed drink",
      "One extra-strength kava shot",
      "Complimentary anti-inflammatory hors d'oeuvres all night",
      "Discounted drinks available for purchase",
    ],
    flourish: 0,
  },
  {
    match: "meridian",
    label: "Meridian",
    note: "The reception opens at seven",
    perks: [
      "VIP Reception, 7–8PM",
      "Open bar all night",
      "Complimentary anti-inflammatory hors d'oeuvres all night",
      "Exclusive VIP rooftop",
      "RUSH instant ceremonial kava pouch to take home ($60 value)",
    ],
    vipReception: true,
    flourish: 1,
  },
  {
    match: "perihelion",
    label: "Perihelion",
    note: "Everything in Meridian, and further in",
    perks: [
      "Everything in Meridian",
      "3 month Aphelion Club membership (our exclusive membership club)",
      "1 month Sweat Equity pass",
      "$250 Reshape Body Bar pass",
      "More perks and a curated set of gifts, revealed on arrival",
    ],
    vipReception: true,
    flourish: 2,
  },
  {
    match: "aphelion",
    label: "Aphelion",
    note: "The closest orbit",
    perks: [
      "Everything in Meridian",
      "1 year Aphelion Club membership (our exclusive membership club)",
      "3 month Sweat Equity pass",
      "$250 Reshape Body Bar pass",
      "1 week MyHealthMatrix pass with wellness age test",
      "More perks and a curated set of gifts, revealed on arrival",
    ],
    vipReception: true,
    flourish: 3,
  },
];

/** Find the tier config for a Shopify variant title. */
export function tierFor(variantTitle: string): PartyTier | undefined {
  const t = variantTitle.toLowerCase();
  return PARTY_TIERS.find((x) => t.includes(x.match));
}

/** Sort key so tiers render in the intended order, not Shopify's. */
export function tierRank(variantTitle: string): number {
  const i = PARTY_TIERS.findIndex((x) =>
    variantTitle.toLowerCase().includes(x.match),
  );
  return i === -1 ? PARTY_TIERS.length : i;
}
