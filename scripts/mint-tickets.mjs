import fs from "node:fs";
import { createHmac } from "node:crypto";

/**
 * Mint ticket links for LUNA EKLIPTIKA guests.
 *
 * Usage:
 *   node scripts/mint-tickets.mjs guests.csv
 *
 * The CSV needs a header row and these columns, in any order:
 *   order,name,tier,seats
 *
 * Example:
 *   order,name,tier,seats
 *   #2565,Brandy Graff,Obsidian,1
 *   #2570,Michael Alvarez,Meridian,2
 *
 * Prints one link per guest, ready to paste into their confirmation
 * email. Nothing is stored — the ticket IS the token, so re-running
 * this for the same guest produces the same link.
 *
 * Keep the same TICKET_SECRET as production or the links won't verify.
 */

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

const SECRET = env.TICKET_SECRET || env.SESSION_SECRET || env.REVALIDATE_SECRET;
if (!SECRET || SECRET.length < 16) {
  console.error("TICKET_SECRET missing or too short in .env.local.");
  process.exit(1);
}

const ORIGIN = env.SITE_ORIGIN || "https://www.lumanai.com";

function createTicket(t) {
  const payload = Buffer.from(JSON.stringify(t), "utf8").toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/** Split one CSV line, honouring quoted cells. */
function splitCsv(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/mint-tickets.mjs guests.csv");
  process.exit(1);
}

const rows = fs
  .readFileSync(file, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map(splitCsv);

const header = rows[0].map((h) => h.toLowerCase());
const at = (r, name) => {
  const i = header.indexOf(name);
  return i === -1 ? "" : (r[i] ?? "");
};

let n = 0;
for (const r of rows.slice(1)) {
  const name = at(r, "name");
  if (!name) continue;
  const ticket = {
    order: at(r, "order") || "—",
    name,
    tier: at(r, "tier") || "Obsidian",
    seats: Math.max(1, Number(at(r, "seats")) || 1),
  };
  console.log(`${name}\n  ${ORIGIN}/ticket/${createTicket(ticket)}\n`);
  n++;
}
console.error(`${n} ticket${n === 1 ? "" : "s"} minted.`);
