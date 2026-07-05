# Integrations — plug-in checklist

Everything in this folder is scaffolded and ready to work; it just needs
credentials pasted into `.env.local` (copy `.env.example` first). Nothing
here will fail silently — if a key is missing, it logs a warning and
degrades gracefully.

## 1. Shopify Storefront (products, cart, checkout)

**Where to grab creds**

1. Shopify Admin → **Settings** → **Apps and sales channels**
2. Click **Develop apps** → **Create an app** ("Lumanai Website")
3. **Configure Storefront API scopes** — check at minimum:
   `unauthenticated_read_product_listings`, `unauthenticated_read_checkouts`,
   `unauthenticated_write_checkouts`
4. **Install app** → copy the **Storefront API access token**
5. Paste into `.env.local`:
   ```
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=lumanai.myshopify.com
   NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=xxxxxx
   ```

**What to do next**

Once creds are in, you can migrate `src/app/products/[handle]/page.tsx`
to call `shopifyFetch(PRODUCT_BY_HANDLE_QUERY, { handle })` instead of
reading from the static `products.ts` file. Same for the products list.

## 2. GoHighLevel (booking → CRM)

**Where to grab creds**

1. GHL → **Automation** → **Workflows** → **Create Workflow**
2. Add trigger: **Inbound Webhook**
3. Copy the webhook URL, paste into `.env.local`:
   ```
   GHL_BOOKING_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/xxx
   ```

**What it does**

Every booking form submission POSTs to that webhook. Build whatever
workflow you want in GHL — create contact, add to pipeline, send email
sequence, tag as "warm event lead," etc.

## 3. Twilio (SMS alerts)

**Where to grab creds**

1. console.twilio.com → **Account** → **API Keys & tokens** → copy SID + Auth Token
2. Buy or grab a Twilio phone number (or use your existing one)
3. Paste into `.env.local`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxx
   TWILIO_AUTH_TOKEN=xxxx
   TWILIO_FROM_NUMBER=+17025551234
   TWILIO_ALERT_NUMBER=+17026260858
   ```

**What it does**

When a booking comes in through `/api/booking`, a short SMS fires to
`TWILIO_ALERT_NUMBER` with the lead's name and city. Nice for catching
hot inbound while you're in the field.

## 4. Google Drive / Canva

These aren't website-facing — they're internal tools.

- **Google Drive** (payroll, event spreadsheets): keep those private.
  The website doesn't need access. If you want automated payroll
  entries whenever a booking closes, that's a GHL → Zapier → Sheets
  automation, not a website change.
- **Canva** (design assets): export finals as PNG/JPG and drop them
  into `/public/images/`, or link the Canva share URL from the site
  where relevant. The website can't log into Canva directly.

## Local checklist for tonight

- [ ] Copy `.env.example` → `.env.local`
- [ ] Paste in Shopify Storefront token
- [ ] Paste in GHL webhook URL
- [ ] Paste in Twilio creds (or leave blank — SMS just no-ops)
- [ ] `npm run dev`
- [ ] Test the booking form on `/events` → check GHL received it
