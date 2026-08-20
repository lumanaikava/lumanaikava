import {
  readGuestsStrict,
  guestSheetConfigured,
} from "@/lib/integrations/guest-sheet";
import { guestTotals, type Guest, type GuestTotals } from "@/lib/guests";

/**
 * The guest board — read from the Guest List sheet only.
 *
 * We deliberately DO NOT auto-import Shopify buyers here. Zach's
 * decision on 2026-08-20: any buyer we care about will be on the sheet
 * already, moved manually to "Secured" when they actually pay. Trying
 * to merge two sources on the night of the party leads to duplicate
 * rows (a lead who bought under a different name) and to buyers being
 * silently reclassified — either way it's an error at the door.
 *
 * The sheet is the whole story now.
 */

export type GuestBoard = {
  guests: Guest[];
  totals: GuestTotals;
  /** Can we write? False = read-only, leads can't be saved yet. */
  sheetReady: boolean;
  /**
   * Kept in the type so `page.tsx` doesn't need to change every time we
   * flip a source on or off. Always false now.
   */
  ordersReady: boolean;
  /** Non-fatal problems worth showing the crew rather than hiding. */
  warnings: string[];
};

export async function loadGuestBoard(): Promise<GuestBoard> {
  const sheetReady = guestSheetConfigured();
  const warnings: string[] = [];

  let guests: Guest[] = [];
  if (sheetReady) {
    try {
      guests = await readGuestsStrict();
    } catch (err) {
      warnings.push(
        `Couldn't read the Guest List sheet — the board is empty until it's back. ${
          err instanceof Error ? err.message : ""
        }`.trim(),
      );
    }
  }

  // Newest first, same as before.
  guests.sort((a, b) => (b.addedAt || "").localeCompare(a.addedAt || ""));

  return {
    guests,
    totals: guestTotals(guests),
    sheetReady,
    ordersReady: false,
    warnings,
  };
}
