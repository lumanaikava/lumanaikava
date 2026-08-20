import {
  getRecentOrders,
  shopifyAdminConfigured,
  type AdminOrder,
} from "@/lib/integrations/shopify-admin";
import {
  readGuestsStrict,
  guestSheetConfigured,
} from "@/lib/integrations/guest-sheet";
import { PARTY_TICKET_HANDLE } from "@/lib/catalog";
import { mergeGuests, guestTotals, type Guest, type GuestTotals } from "@/lib/guests";

/**
 * Assembles the guest board from its two halves — paid buyers (Shopify)
 * and everyone/everything a human typed (the sheet).
 *
 * Both halves degrade independently and say so. A broken sheet must not
 * hide the buyers, and a missing Shopify token must not hide the leads:
 * on the night of the party a partial list is far better than an error.
 */

/** Orders scanned for tickets. Comfortably more than the room holds. */
const ORDER_WINDOW = 100;

export type GuestBoard = {
  guests: Guest[];
  totals: GuestTotals;
  /** Can we write? False = read-only, leads can't be saved yet. */
  sheetReady: boolean;
  /** Are paid buyers flowing in? */
  ordersReady: boolean;
  /** Non-fatal problems worth showing the crew rather than hiding. */
  warnings: string[];
};

function ticketsInOrder(o: AdminOrder): number {
  return o.items
    .filter((i) =>
      i.handle
        ? i.handle === PARTY_TICKET_HANDLE
        : // Older/deleted products lose their handle — fall back to the
          // title, which is why the setup guide names the product
          // "Lumanai Launch — Ticket".
          /launch/i.test(i.title) && /ticket/i.test(i.title),
    )
    .reduce((sum, i) => sum + i.quantity, 0);
}

/** Ticket buyers as guests. Paid, so they arrive already confirmed. */
function buyersFromOrders(orders: AdminOrder[]): Guest[] {
  return orders
    // A refunded or voided order is not a guest.
    .filter((o) => !/refunded|voided|expired/i.test(o.financialStatus))
    .map((o) => ({ o, tickets: ticketsInOrder(o) }))
    .filter(({ tickets }) => tickets > 0)
    .map(({ o, tickets }) => ({
      id: o.name, // Shopify order name — stable across re-reads
      name: o.customerName || o.email || "Ticket holder",
      email: o.email,
      phone: o.phone,
      instagram: "",
      source: "ticket" as const,
      status: "confirmed" as const,
      tickets,
      notes: "",
      // A paid ticket implies every outreach channel is moot — they said
      // yes on their own — but we don't want the checkbox row to look
      // "unfinished". Marking every channel true reads correctly: they're
      // fully in, on every axis.
      invitedPhone: true,
      invitedEmail: true,
      invitedInstagram: true,
      // Buyers are neither staff nor comped by default — those are
      // labels a human sets, and inferring them from an order would
      // silently reclassify people.
      isStaff: false,
      isFree: false,
      addedBy: "Shopify",
      addedAt: o.createdAt,
    }));
}

export async function loadGuestBoard(): Promise<GuestBoard> {
  const sheetReady = guestSheetConfigured();
  const ordersReady = shopifyAdminConfigured();
  const warnings: string[] = [];

  let saved: Guest[] = [];
  if (sheetReady) {
    try {
      saved = await readGuestsStrict();
    } catch (err) {
      warnings.push(
        `Couldn't read the Guest List sheet — showing ticket buyers only. ${
          err instanceof Error ? err.message : ""
        }`.trim(),
      );
    }
  }

  let buyers: Guest[] = [];
  if (ordersReady) {
    try {
      buyers = buyersFromOrders(await getRecentOrders(ORDER_WINDOW));
    } catch (err) {
      warnings.push(
        `Couldn't reach Shopify — new ticket buyers may be missing. ${
          err instanceof Error ? err.message : ""
        }`.trim(),
      );
    }
  }

  const guests = mergeGuests(saved, buyers);
  return { guests, totals: guestTotals(guests), sheetReady, ordersReady, warnings };
}
