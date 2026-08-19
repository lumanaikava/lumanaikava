import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The door ticket.
 *
 * A ticket is SELF-CONTAINED: the guest's name, tier and order number
 * are inside the token, signed. Nothing is looked up at the door.
 *
 * That matters because the door is a driveway in Las Vegas at 8PM. If
 * validation needed Shopify, or our database, or a working signal, then
 * a dropped connection means a queue of paying guests standing outside.
 * A signature can be checked offline, forever, by anyone holding the
 * secret — which is the scanner, and nobody else.
 *
 * Format:  <base64url(payload)>.<base64url(hmac)>
 *
 * The signature is what makes this a ticket rather than a URL. Anyone
 * can invent a name and a tier; nobody can sign one.
 */

const SECRET =
  process.env.TICKET_SECRET ||
  process.env.SESSION_SECRET ||
  process.env.REVALIDATE_SECRET ||
  "";

export type Ticket = {
  /** Shopify order name, e.g. "#2565". The human-readable reference. */
  order: string;
  /** Who's coming. */
  name: string;
  /** Obsidian / Meridian / Perihelion / Aphelion. */
  tier: string;
  /** How many people this ticket admits. */
  seats: number;
};

const b64u = (b: Buffer) => b.toString("base64url");

function sign(payload: string): string {
  return b64u(createHmac("sha256", SECRET).update(payload).digest());
}

export function ticketSecretConfigured(): boolean {
  return SECRET.length >= 16;
}

/** Mint a ticket. Throws rather than issuing something unverifiable. */
export function createTicket(t: Ticket): string {
  if (!ticketSecretConfigured()) {
    throw new Error(
      "TICKET_SECRET is not set (or is too short) — refusing to mint a ticket that can't be trusted.",
    );
  }
  const payload = b64u(Buffer.from(JSON.stringify(t), "utf8"));
  return `${payload}.${sign(payload)}`;
}

/**
 * Verify and decode. Returns null for anything that isn't a genuine,
 * intact ticket — a bad signature, a truncated copy-paste, junk.
 */
export function readTicket(token: string): Ticket | null {
  if (!ticketSecretConfigured()) return null;

  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;

  const payload = token.slice(0, dot);
  const given = token.slice(dot + 1);

  const a = Buffer.from(given);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const t = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Ticket;
    if (!t?.order || !t?.name || !t?.tier) return null;
    return { ...t, seats: Math.max(1, Number(t.seats) || 1) };
  } catch {
    return null;
  }
}
