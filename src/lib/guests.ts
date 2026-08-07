/**
 * The guest list — who's coming to Lumanai Launch.
 *
 * Two ways onto it:
 *   • Someone buys a ticket → they appear automatically, already
 *     confirmed. Nobody has to type them in.
 *   • Someone's a lead (a name Ash or Zach is working on) → added by
 *     hand as a "lead", then locked in with one button once they commit.
 *
 * Ticket buyers live in Shopify; leads and everyone's status live in the
 * Guest List sheet. `mergeGuests()` is what makes those two look like one
 * list — and, importantly, what stops a Shopify re-read from wiping a
 * status somebody set by hand.
 */

/** Where a guest is in the funnel. Buyers skip straight to confirmed. */
export type GuestStatus = "lead" | "confirmed" | "checked-in";

/** How they got on the list. `ticket` = paid through Shopify. */
export type GuestSource = "ticket" | "manual";

export type Guest = {
  /**
   * Stable identity. For buyers this is the Shopify order name ("#1012")
   * so re-reading orders matches the same person every time; for manual
   * adds it's the creation timestamp.
   */
  id: string;
  name: string;
  email: string;
  phone: string;
  source: GuestSource;
  status: GuestStatus;
  /** Headcount this row represents — a buyer of 3 tickets brings 3. */
  tickets: number;
  notes: string;
  /** Which crew member added them (manual adds only). */
  addedBy: string;
  addedAt: string;
};

/** Column order in the Guest List sheet. Append-only — never reorder. */
export const GUEST_COLUMNS = [
  "Id",
  "Name",
  "Email",
  "Phone",
  "Source",
  "Status",
  "Tickets",
  "Notes",
  "Added By",
  "Added At",
] as const;

export const GUEST_STATUSES: GuestStatus[] = ["lead", "confirmed", "checked-in"];

export function isGuestStatus(v: unknown): v is GuestStatus {
  return typeof v === "string" && (GUEST_STATUSES as string[]).includes(v);
}

export function guestToValues(g: Guest): (string | number)[] {
  return [
    g.id,
    g.name,
    g.email,
    g.phone,
    g.source,
    g.status,
    g.tickets,
    g.notes,
    g.addedBy,
    g.addedAt,
  ];
}

export function valuesToGuest(c: (string | number)[]): Guest {
  const s = (v: unknown) => String(v ?? "").trim();
  return {
    id: s(c[0]),
    name: s(c[1]),
    email: s(c[2]),
    phone: s(c[3]),
    source: s(c[4]) === "ticket" ? "ticket" : "manual",
    status: isGuestStatus(s(c[5])) ? (s(c[5]) as GuestStatus) : "lead",
    tickets: Number(c[6]) || 1,
    notes: s(c[7]),
    addedBy: s(c[8]),
    addedAt: s(c[9]),
  };
}

/**
 * Fold live ticket buyers into the saved list.
 *
 * The saved row WINS on the things a human sets — status and notes —
 * because those are the whole point of the board. Everything else
 * (name, email, phone, headcount) comes fresh from Shopify, which is
 * authoritative for what was actually bought.
 *
 * A buyer with no saved row yet is confirmed on arrival: they paid.
 */
export function mergeGuests(saved: Guest[], buyers: Guest[]): Guest[] {
  const savedById = new Map(saved.map((g) => [g.id, g]));

  const merged = buyers.map((b) => {
    const prior = savedById.get(b.id);
    if (!prior) return b;
    savedById.delete(b.id);
    return {
      ...b,
      status: prior.status,
      notes: prior.notes,
      // Keep the original add time so the list doesn't reshuffle on reload.
      addedAt: prior.addedAt || b.addedAt,
    };
  });

  // Whatever's left in the map is manual — leads, or buyers whose order
  // has since vanished from the recent-orders window. Either way they
  // stay on the list; dropping people silently is how you lose a guest.
  return [...merged, ...savedById.values()].sort((a, b) =>
    (b.addedAt || "").localeCompare(a.addedAt || ""),
  );
}

export type GuestTotals = {
  confirmed: number;
  leads: number;
  checkedIn: number;
  /** Total bodies through the door if everyone confirmed shows up. */
  headcount: number;
  paidTickets: number;
};

export function guestTotals(guests: Guest[]): GuestTotals {
  const t: GuestTotals = {
    confirmed: 0,
    leads: 0,
    checkedIn: 0,
    headcount: 0,
    paidTickets: 0,
  };
  for (const g of guests) {
    if (g.status === "lead") t.leads += 1;
    if (g.status === "confirmed") t.confirmed += 1;
    if (g.status === "checked-in") t.checkedIn += 1;
    // A lead hasn't committed — don't let them inflate the headcount you
    // plan pours and capacity against.
    if (g.status !== "lead") t.headcount += g.tickets;
    if (g.source === "ticket") t.paidTickets += g.tickets;
  }
  return t;
}
