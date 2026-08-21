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
  /** Instagram handle, with or without the leading @ — normalised at write. */
  instagram: string;
  source: GuestSource;
  status: GuestStatus;
  /** Headcount this row represents — a buyer of 3 tickets brings 3. */
  tickets: number;
  notes: string;
  /**
   * Outreach state — the three channels we invite people on. Each is set
   * independently as someone actually does the outreach, so a row can say
   * "texted, DM'd, waiting on the email" at a glance.
   */
  invitedPhone: boolean;
  invitedEmail: boolean;
  invitedInstagram: boolean;
  /**
   * Labels. Independent — someone can be staff without being comped (rare
   * but possible), and comped without being staff (a VIP guest of the
   * house). Both are just tags; the board reads them, and the totals
   * ignore them so headcount stays real.
   */
  isStaff: boolean;
  isFree: boolean;
  /**
   * Free-text job for staff, e.g. "Bartender", "DJ", "Kitchen". Rendered
   * next to the Staff badge, only when isStaff is true.
   */
  staffTitle: string;
  /**
   * Master "we reached out" flag, independent of the three per-channel
   * pills. Zach uses this for the quick pass ("texted them, done")
   * without needing to specify which channel every time. The channel
   * pills still exist for the detailed pass.
   */
  invited: boolean;
  /** $20 discount label — the friends-and-family rate as an on-list tag. */
  isDiscount20: boolean;
  /**
   * Manual sort key. Bigger = higher on the list. Drag-and-drop writes
   * new values between neighbours (fractional indexing), so a reorder
   * doesn't reshuffle every other row. Zero means "no manual position
   * set" and the reader falls back to addedAt.
   */
  sort: number;
  /** Which crew member added them (manual adds only). */
  addedBy: string;
  addedAt: string;
};

/**
 * Column order in the Guest List sheet.
 *
 * APPEND-ONLY — never reorder, never delete. The Apps Script indexes by
 * column position and the sheet is edited by hand between deploys; a
 * reorder would misalign every existing row and the mistake wouldn't
 * show up until someone's status stopped saving.
 *
 * New columns appended 2026-08-20 for Instagram + per-channel outreach
 * flags. Older rows with only ten columns keep working — the reader
 * treats trailing missing values as blank.
 */
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
  "Instagram",
  "Invited Phone",
  "Invited Email",
  "Invited Instagram",
  "Staff",
  "Free",
  "Staff Title",
  "Invited",
  "Discount $20",
  "Sort",
] as const;

export const GUEST_STATUSES: GuestStatus[] = ["lead", "confirmed", "checked-in"];

export function isGuestStatus(v: unknown): v is GuestStatus {
  return typeof v === "string" && (GUEST_STATUSES as string[]).includes(v);
}

/** Serialise a boolean to a stable, human-readable sheet value. */
const yn = (b: boolean): string => (b ? "yes" : "");
/** Read back a boolean — "yes", "y", "true", "1" all count as ticked. */
const readYn = (v: unknown): boolean => {
  const s = String(v ?? "").trim().toLowerCase();
  return s === "yes" || s === "y" || s === "true" || s === "1";
};

/** Normalise an Instagram handle for storage: strip leading @ and spaces. */
export function normaliseInstagram(v: string): string {
  return v.trim().replace(/^@+/, "").slice(0, 60);
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
    g.instagram,
    yn(g.invitedPhone),
    yn(g.invitedEmail),
    yn(g.invitedInstagram),
    yn(g.isStaff),
    yn(g.isFree),
    g.staffTitle,
    yn(g.invited),
    yn(g.isDiscount20),
    g.sort || 0,
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
    // Trailing columns may be absent on legacy rows — that's why they're
    // last, and why every read tolerates undefined.
    instagram: normaliseInstagram(s(c[10])),
    invitedPhone: readYn(c[11]),
    invitedEmail: readYn(c[12]),
    invitedInstagram: readYn(c[13]),
    isStaff: readYn(c[14]),
    isFree: readYn(c[15]),
    staffTitle: s(c[16]),
    invited: readYn(c[17]),
    isDiscount20: readYn(c[18]),
    sort: Number(c[19]) || 0,
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
