# Lumanai — project state

Working handoff for whoever (or whatever) picks this up next.

> **This repo is PUBLIC.** No addresses, passcodes, tokens or customer
> data belong in any file here. Secrets live in Vercel environment
> variables; the operational runbooks that reference them live in the
> `Lumanai Business` folder, which is deliberately outside this repo.

---

## Stack

Next.js 16 App Router · TypeScript · Tailwind v4 · deployed on Vercel,
auto-deploying from `main`. **Every push is a deploy** — verify before
pushing.

`lumanai.com` still points at the old Shopify theme. The new site lives
at the Vercel URL until the DNS cutover.

---

## Integrations

| What | How | Env var | State |
|---|---|---|---|
| Shopify catalog + checkout | Storefront API | `NEXT_PUBLIC_SHOPIFY_*` | live |
| Shopify orders | Admin API | `SHOPIFY_ADMIN_TOKEN` | **not set** |
| Leads / SMS consent | GoHighLevel webhook | `GHL_BOOKING_WEBHOOK_URL` | live, see bug below |
| Payroll ledger | Google Sheet + Apps Script | `PAYROLL_SHEET_*` | live |
| Guest list | Google Sheet + Apps Script | `GUESTLIST_SHEET_WEBHOOK_URL` | **not set** |
| Site content (FAQ + events) | Google Sheet + Apps Script | `CONTENT_SHEET_WEBHOOK_URL` | **not set** |
| Events 2026 | published CSV, read-only | `EVENTS_SHEET_CSV_URL` | **not set** |
| SMS | Twilio | `TWILIO_*` | creds live; **Vercel copy is stale → 401** |
| Google Calendar | secret iCal | `GOOGLE_CALENDAR_ICS_URL` | not set |

Everything above degrades gracefully when unset — the UI explains what's
missing rather than erroring.

### Why three Apps Scripts and one CSV

Payroll and the guest list each own a whole spreadsheet. Site content
uses one spreadsheet with two tabs behind one script (a `tab` param).
Events 2026 is **read-only for the site**, so it needs no script at all —
publish-to-web CSV.

**Hard-won lesson:** an Apps Script web app returns **HTTP 200 even when
broken**, serving an HTML error page. Every client here treats an
unparseable body as a hard error. Do not "fix" that by swallowing the
parse failure — that bug once let payroll report saves that never
happened.

---

## Access model

`src/lib/crew.ts` is the single roster. `src/lib/admin-session.ts` issues
a **signed** session cookie (`name.role.hmac`).

- **owner** (Ash, Zach) — everything
- **staff** (Karina, Aries, Jadon) — a "My hours" page, own shifts only

Enforcement is server-side, not UI: other people's payroll is filtered
before render, and edits/deletes are checked against the entry *already
on record* so nobody can pass their own name with someone else's
timestamp. Owner-only: full payroll report, both CSV exports, SMS, guest
list, site content.

The master passcode is an **owner override only**. Staff need their own
code or `STAFF_PASSCODE`.

---

## Party — LUNA EKLIPTIKA (Aug 28 2026)

`/invited`, password-gated. Golden Hour 7–8PM for Meridian and above,
doors 8PM, dress code all black.

- Black/earth/gold theme scoped to a `.luna` class so it can't leak
- Tiers in `src/lib/party-tiers.ts`; **prices and stock come from
  Shopify**, never hardcoded
- Friends + Family is **unpublished** — filtered server-side so it's
  never in the HTML; reachable only via a crew link code
- The drinks menu is **deliberately secret**. Don't list pours.
- The venue address is **not in this repo** and must not be. It ships on
  the printed ticket only; the hero renders a redaction bar.

The Shopify ticket product **does not exist yet** — nothing sells until
it's created.

---

## SMS / A2P 10DLC

Brand APPROVED. Campaign FAILED twice (error 30896) because the filing
pointed reviewers at a popup they couldn't reproduce, with a Dropbox
link as evidence.

Fix in flight: serve the consent checkbox at a real subdomain, then
refile. A ready-to-run tool exists outside the repo; it **refuses to
submit** unless the opt-in URL actually serves an unchecked checkbox.

**TCPA:** the ~1,200 existing CRM contacts never opted in. Do not text
them. Consent is captured at ticket checkout (unchecked box, reveals a
number field, records who/when/exact wording) — that's the only
legitimate list.

---

## Known bugs / open items

1. **GHL "Create Contact" errors** — "no value was found for any of the
   mapped fields". The webhook was mapped for an old Shopify popup, not
   the site's payload (`name, email, phone, date, city, guests, message,
   source, submitted_at`). **Booking leads are being dropped.**
2. **Twilio 401 in production** — Vercel's copy of the credentials is
   stale, so booking alert texts fail silently.
3. **Shopify checkout domain** — Shopify's primary domain is
   `lumanai.com`, so it stamps checkout URLs with it. Repointing that
   A record at Vercel **breaks all checkout**. Give Shopify its own
   subdomain first.

## Outstanding work

- **MY CART** — cart state, multi-item Shopify checkout, SMS opt-in
- **Booking revamp** — no prices, choose-your-experience, one seamless
  form, remove the feature ticker, ethereal animations
- **32oz growler selector** — variants already exist in Shopify; needs a
  size toggle that swaps price and image
- **Our Story** page, content pulled from lumanai.com, editable
- **Per-event live menu**
- **Naktail definition** on the home page
- **Event menu prices removed** (part of the booking revamp)
- Rewards: points stay in Joy on Shopify. Site links to the balance.
  Real profiles are a later, separate project.

---

## Conventions

- Prices, stock and product truth come from **Shopify**. This repo owns
  presentation: order, artwork, short names, what's hidden.
- Content the crew edits lives in **sheets**, and always *adds to* the
  code defaults rather than replacing them — so an empty or unreachable
  sheet can never blank the site.
- Degrade loudly to the user, never silently.
- `assets/` is git-ignored: it holds spreadsheets with customer PII.
