/**
 * The people to add to the LUNA EKLIPTIKA guest list on day one.
 *
 * Data pulled from Zach 2026-08-20. Nine individual leads with phone
 * and email, then the twenty-six-name crew/friends bucket. Everyone
 * lands as a "lead" with no channels ticked and no ticket — the point
 * of this list is to make the outreach visible, not to skip it.
 *
 * Referenced by:
 *   - /api/admin/guests/seed  (production, one-click)
 *   - scripts/seed-luna-guests.mjs (local, dry-run + --commit)
 *
 * Two people flagged for you to reconcile once they're on the board:
 *   - "Thais (2)" — you gave me two "Thais" in a row; keeping both,
 *     labeled, so it's a decision on the sheet rather than a silent drop.
 *   - "Eben" at the end — likely the same person as "Eben Rockmaker"
 *     above with a phone and email; note attached.
 */

export type LunaSeedGuest = {
  name: string;
  phone?: string;
  email?: string;
  instagram?: string;
  notes?: string;
  isStaff?: boolean;
  isFree?: boolean;
};

export const LUNA_STARTER_LIST: LunaSeedGuest[] = [
  // — Leads with contact details —
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

  // — House crew: everyone here is on the clock and comped —
  { name: "Ash", isStaff: true, isFree: true },
  { name: "Zach", isStaff: true, isFree: true },
  { name: "Karina", isStaff: true, isFree: true },
  { name: "Kaden", isStaff: true, isFree: true },
  { name: "Mikey", isStaff: true, isFree: true },
  { name: "Yoscelin", isStaff: true, isFree: true },
  { name: "Merrill", isStaff: true, isFree: true },
  { name: "Danny", isStaff: true, isFree: true },

  // — Friends bucket, names only for now —
  { name: "Thais" },
  {
    name: "Thais (2)",
    notes: "Second Thais on Zach's list — clarify which is which.",
  },
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
  {
    name: "Eben",
    notes: "Duplicate of Eben Rockmaker above? Confirm before merging.",
  },
];
