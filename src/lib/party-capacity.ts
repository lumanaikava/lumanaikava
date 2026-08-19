import { shopifyFetch } from "@/lib/integrations/shopify";
import { PARTY_TICKET_HANDLE } from "@/lib/catalog";

/**
 * How many spots are left at LUNA EKLIPTIKA.
 *
 * The room holds fifty. Shopify tracks stock per VARIANT and has no
 * concept of a shared cap across them, so the four tiers are stocked to
 * sum to fifty and the total inventory across them IS the spots left.
 * If anyone changes one tier's stock without lowering another, this
 * number stops meaning fifty — that's a real trap, and the reason
 * CAPACITY lives here as a stated intent rather than being inferred.
 *
 * ⚠️ Reading `totalInventory` needs the `unauthenticated_read_product_inventory`
 * scope on the Storefront token. Without it Shopify refuses the whole
 * query, so this returns null and the counter simply doesn't render —
 * a missing count is fine, a wrong one is not.
 *
 * Enable it: Shopify admin → Settings → Apps and sales channels →
 * Headless → Storefront API → tick "Read product inventory".
 */

export const PARTY_CAPACITY = 50;

export type PartyCapacity = {
  left: number;
  capacity: number;
  /** Rounded down, so "sold out" never shows while a spot remains. */
  claimed: number;
};

export async function partySpotsLeft(): Promise<PartyCapacity | null> {
  try {
    const data = await shopifyFetch<{
      product: { totalInventory: number | null } | null;
    }>(
      /* GraphQL */ `
        query PartyInventory($handle: String!) {
          product(handle: $handle) {
            totalInventory
          }
        }
      `,
      { handle: PARTY_TICKET_HANDLE },
      // Short cache: a stale figure that says "9 left" while it's 2 is
      // worse than no figure, but hitting Shopify on every render for a
      // decorative number isn't worth it either.
      { revalidate: 30 },
    );

    const total = data.product?.totalInventory;
    if (typeof total !== "number") return null;

    const left = Math.max(0, Math.min(total, PARTY_CAPACITY));
    return { left, capacity: PARTY_CAPACITY, claimed: PARTY_CAPACITY - left };
  } catch {
    // Missing scope, Shopify down, anything — show nothing.
    return null;
  }
}
