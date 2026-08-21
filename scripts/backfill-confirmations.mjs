import fs from "node:fs";
import path from "node:path";
import { createHmac } from "node:crypto";

/**
 * One-shot: send LUNA EKLIPTIKA confirmations to a list of already-paid
 * buyers who missed the automated send (because Resend / the webhook
 * wasn't wired yet at the time of purchase).
 *
 * Each buyer gets exactly the same email the webhook would send now:
 * their tier's template, a ticket link minted with the same
 * TICKET_SECRET, address and gate code inside.
 *
 * Buyers are hardcoded so a paste mistake doesn't fire a wrong email to
 * a random address. Edit this list, then run.
 *
 * Usage:
 *   node scripts/backfill-confirmations.mjs           # dry-run — prints what it would send
 *   node scripts/backfill-confirmations.mjs --send    # actually POST to Resend
 */

const BUYERS = [
  {
    order: "#2568",
    firstName: "Michael",
    fullName: "Michael Alvarez",
    email: "Ceo@perfitnesspt.com",
    tier: "Meridian",
    seats: 1,
  },
  {
    order: "#2569",
    firstName: "Laura",
    fullName: "Laura Wand",
    email: "law3c14@gmail.com",
    tier: "Perihelion",
    seats: 1,
  },
];

// ── Read env locally, never commit .env.local ─────────────────
const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const TICKET_SECRET = env.TICKET_SECRET;
const RESEND_KEY = env.RESEND_API_KEY;
const FROM = env.RESEND_FROM_ADDRESS || "Lumanai <bula@lumanai.com>";
const ORIGIN = env.SITE_ORIGIN || "https://www.lumanai.com";

if (!TICKET_SECRET || TICKET_SECRET.length < 16) {
  console.error("TICKET_SECRET missing or too short in .env.local.");
  process.exit(1);
}
if (!RESEND_KEY) {
  console.error("RESEND_API_KEY missing in .env.local.");
  process.exit(1);
}

// ── Ticket minting (same HMAC as src/lib/ticket-token.ts) ─────
function b64u(buf) {
  return buf.toString("base64url");
}
function mintTicket({ order, name, tier, seats }) {
  const payload = b64u(
    Buffer.from(JSON.stringify({ order, name, tier, seats }), "utf8"),
  );
  const sig = b64u(createHmac("sha256", TICKET_SECRET).update(payload).digest());
  return `${ORIGIN}/ticket/${payload}.${sig}`;
}

// ── Personalise the tier's template file ──────────────────────
function loadAndPersonalise(tier, firstName, ticketLink) {
  const filePath = path.join(
    "..",
    "Lumanai Business",
    `Confirmation — ${tier}.html`,
  );
  let html = fs.readFileSync(filePath, "utf8");
  // Kill only the top instructions comment (the reviewers' block); the
  // template's own inline comments stay.
  html = html.replace(/^<!--[\s\S]*?-->\n*/, "");
  html = html.replace(/{{FIRST_NAME}}/g, escapeHtml(firstName));
  html = html.replace(/{{TICKET_LINK}}/g, ticketLink);
  return html;
}
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Send via Resend ────────────────────────────────────────────
async function sendOne(buyer) {
  const link = mintTicket({
    order: buyer.order,
    name: buyer.fullName,
    tier: buyer.tier,
    seats: buyer.seats,
  });
  const html = loadAndPersonalise(buyer.tier, buyer.firstName, link);

  if (!process.argv.includes("--send")) {
    console.log(
      `  DRY-RUN  ${buyer.order.padEnd(6)} ${buyer.tier.padEnd(11)} ${buyer.email.padEnd(28)}  ${link.slice(0, 80)}…`,
    );
    return { ok: true, id: "dry-run" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
      // Backfill idempotency key = order name, so re-running the script
      // for the same buyer never produces a duplicate email.
      "Idempotency-Key": `luna-conf-${buyer.order}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [buyer.email],
      subject: "You're in — LUNA EKLIPTIKA, Friday Aug 28",
      html,
      reply_to: env.CONTACT_EMAIL || "bula@lumanai.com",
    }),
  });
  const text = await res.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    /* leave data empty; error path prints raw text below */
  }
  if (!res.ok) {
    console.log(
      `  FAIL     ${buyer.order} ${buyer.tier} ${buyer.email}: ${data.message ?? text.slice(0, 120)}`,
    );
    return { ok: false };
  }
  console.log(
    `  OK       ${buyer.order.padEnd(6)} ${buyer.tier.padEnd(11)} ${buyer.email.padEnd(28)}  resend-id=${data.id}`,
  );
  return { ok: true, id: data.id };
}

// ── Run ────────────────────────────────────────────────────────
const send = process.argv.includes("--send");
console.log(
  send
    ? `Sending ${BUYERS.length} backfill confirmation${BUYERS.length === 1 ? "" : "s"}…`
    : `DRY RUN — pass --send to actually POST. ${BUYERS.length} would be sent.`,
);
console.log("");
let ok = 0;
let failed = 0;
for (const b of BUYERS) {
  const r = await sendOne(b);
  if (r.ok) ok++;
  else failed++;
}
console.log(`\n${ok} sent, ${failed} failed.`);
