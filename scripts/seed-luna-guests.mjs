import fs from "node:fs";

/**
 * Seed the Guest List sheet with the LUNA EKLIPTIKA starter list.
 *
 * The names Zach dropped in on 2026-08-20 — leads Ash and Zach are
 * working on, and the twenty-plus crew and friends bucket. All added
 * as "lead" with no channels ticked; the point of this is to get them
 * onto the board so the outreach can be tracked, not to skip it.
 *
 * Usage:
 *   node scripts/seed-luna-guests.mjs           # dry run: prints what would go in
 *   node scripts/seed-luna-guests.mjs --commit  # actually writes to the sheet
 *
 * Requires GUESTLIST_SHEET_WEBHOOK_URL (and the matching secret) in
 * .env.local. Idempotent-ish: if you run it twice, you'll get duplicates
 * — check the sheet first, or run it once and never again.
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

const URL = env.GUESTLIST_SHEET_WEBHOOK_URL;
const SECRET = env.GUESTLIST_SHEET_SECRET ?? "";
const COMMIT = process.argv.includes("--commit");
const ADDED_BY = "Zach"; // Bulk seeder; every row credits the same person.

/** Match the sheet column order in src/lib/guests.ts. */
function toValues(g) {
  return [
    g.id,
    g.name,
    g.email || "",
    g.phone || "",
    "manual",
    g.status || "lead",
    g.tickets || 1,
    g.notes || "",
    ADDED_BY,
    g.addedAt,
    (g.instagram || "").replace(/^@+/, ""),
    "", // Invited Phone
    "", // Invited Email
    "", // Invited Instagram
    g.isStaff ? "yes" : "",
    g.isFree ? "yes" : "",
  ];
}

const now = Date.now();
let n = 0;
const nextId = () => `m-${(now + n++).toString(36)}-seed`;
const stamp = () => new Date(now + n * 1000).toISOString();

/** The list. Comments carry the raw copy so it's grep-able later. */
const guests = [
  // — Leads Zach dropped in individually —
  {
    name: "Jonathan Reed",
    phone: "334-492-1246",
    email: "Newagejonathan2017@gmail.com",
  },
  {
    name: "Eben Rockmaker",
    phone: "702-472-3614",
    email: "Erock4000@gmail.com",
  },
  {
    name: "Alyssa Cave",
    phone: "678-629-4977",
    email: "alyssabcave1@gmail.com",
  },
  {
    name: "Vivian Quijada",
    phone: "480-289-8838",
    email: "Quijadavivian@gmail.com",
  },
  {
    name: "Monique Santos",
    phone: "916-218-2679",
    email: "Moniqueasantos1990@gmail.com",
  },
  {
    name: "Sarah Ellen",
    phone: "832-492-5014",
    email: "",
    notes: "Email missing — only @gmail.com given.",
  },
  {
    name: "Rodney",
    phone: "310-922-7036",
    email: "TheShohamGroupProducts@gmail.com",
  },
  {
    name: "Valeria Oropeza",
    phone: "702-619-3984",
    email: "valoropeza5@gmail.com",
  },
  {
    name: "Keala Maggio",
    phone: "702-695-1834",
    email: "kealamaggio@gmail.com",
  },

  // — Crew and friends bucket (starts with the comped house list) —
  // All eight below are staff and comped — labels toggle to gold + emerald
  // in the UI, so they read at a glance in the door queue.
  { name: "Ash", isStaff: true, isFree: true },
  { name: "Zach", isStaff: true, isFree: true },
  { name: "Karina", isStaff: true, isFree: true },
  { name: "Kaden", isStaff: true, isFree: true },
  { name: "Mikey", isStaff: true, isFree: true },
  { name: "Yoscelin", isStaff: true, isFree: true },
  { name: "Merrill", isStaff: true, isFree: true },
  { name: "Danny", isStaff: true, isFree: true },

  // — Bucket after Merrill/Danny —
  { name: "Thais" },
  { name: "Thais (2)", notes: "Second Thais on Zach's list — clarify which is which." },
  { name: "Luana" },
  { name: "Kulana" },
  { name: "Sarah (hulahoop)" },
  { name: "Chase" },
  { name: "Nijel" },
  { name: "Jaytakesabite", instagram: "jaytakesabite" },
  { name: "Marcus Etho", notes: "Etho Wellness Club — partner." },
  { name: "Madie" },
  { name: "Chance" },
  { name: "Ali" },
  { name: "Bryce" },
  { name: "Arthur Suzuki" },
  { name: "Sierra" },
  { name: "Brooke" },
  { name: "Drew" },
  { name: "Eben", notes: "Duplicate of Eben Rockmaker above? Confirm before merging." },
].map((g) => ({
  ...g,
  id: nextId(),
  status: "lead",
  addedAt: stamp(),
}));

if (!URL || !COMMIT) {
  console.log(`# Dry run — ${guests.length} guests would be added.`);
  console.log(
    URL
      ? "# Pass --commit to actually write to the sheet."
      : "# GUESTLIST_SHEET_WEBHOOK_URL is not set in .env.local — writing is disabled.\n" +
          "# Once you've wired the sheet (Lumanai Business/Guest List Sheet Setup.md),\n" +
          "# re-run with --commit to seed.",
  );
  console.log("");
  for (const g of guests) {
    console.log(`  ${g.name.padEnd(22)} ${(g.phone || "").padEnd(14)} ${g.email || ""}`);
  }
  process.exit(0);
}

let ok = 0;
let failed = 0;
for (const g of guests) {
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: SECRET,
        action: "append",
        values: toValues(g),
      }),
      redirect: "follow",
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 120)}`);
    const data = JSON.parse(text);
    if (data.error) throw new Error(data.error);
    process.stdout.write(`  ok  ${g.name}\n`);
    ok++;
  } catch (err) {
    process.stdout.write(`  FAIL ${g.name}: ${err.message}\n`);
    failed++;
  }
}
console.log(`\n${ok} added, ${failed} failed.`);
