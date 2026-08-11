/**
 * LUNA EKLIPTIKA ticket tiers.
 *
 * Prices and stock come LIVE from Shopify — never hardcode money here.
 * This file only says what each tier *includes*, matched to the Shopify
 * variant name, because that's a promise to a paying guest and it should
 * live somewhere a human can read and correct.
 *
 * Order matters: tiers render in the order listed, cheapest first.
 */

export type PartyTier = {
  /** Lowercased fragment matched against the Shopify variant title. */
  match: string;
  /** What the guest sees. */
  label: string;
  perks: string[];
  /** One-line hook under the name. */
  note?: string;
  /**
   * Never shown publicly. The Friends + Family rate is offered by hand —
   * it appears only when the private link is used, so it can't be found
   * by anyone browsing the page normally.
   */
  unpublished?: boolean;
  /** Gets the 7–8PM Golden Hour reception. */
  goldenHour?: boolean;
};

export const PARTY_TIERS: PartyTier[] = [
  {
    match: "friends",
    label: "Friends + Family",
    note: "By invitation from the crew",
    perks: [
      "One craft drink",
      "One traditional kava shot",
      "Every drink after at a discount",
    ],
    unpublished: true,
  },
  {
    match: "obsidian",
    label: "Obsidian",
    note: "The night, in full",
    perks: [
      "One craft drink",
      "One traditional kava shot",
      "Every drink after at a discount",
      "Hors d'oeuvres all night",
    ],
  },
  {
    match: "meridian",
    label: "Meridian",
    note: "Golden Hour begins at seven",
    perks: [
      "Golden Hour reception, 7–8PM",
      "Welcome champagne mocktail",
      "Open bar all night",
      "A bag of RUSH to take home",
    ],
    goldenHour: true,
  },
  {
    match: "perihelion",
    label: "Perihelion",
    note: "Everything in Meridian, and after",
    perks: [
      "Everything in Meridian",
      "3 months Aphelion club membership",
      "3 months Sweat Equity Pass",
    ],
    goldenHour: true,
  },
  {
    match: "aphelion",
    label: "Aphelion",
    note: "The closest orbit",
    perks: [
      "Everything in Perihelion",
      "1 year Aphelion club membership",
      "3 months Sweat Equity Pass",
      "Entry into the finished painting raffle",
    ],
    goldenHour: true,
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

export function isUnpublished(variantTitle: string): boolean {
  return Boolean(tierFor(variantTitle)?.unpublished);
}

/**
 * The query value that unlocks the unpublished tier: /invited?crew=<code>
 *
 * Server-side only. Unset means the hidden tier is unreachable, which is
 * the safe default — better that the crew can't sell it than that anyone
 * can find a $20 ticket.
 */
export function crewLinkCode(): string | undefined {
  return process.env.PARTY_CREW_CODE || undefined;
}
