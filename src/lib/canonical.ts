/**
 * The two public addresses, by business.
 *
 * events.lumanai.com is the events business's own site (Ash, Nov 2026:
 * "has to be separate from lumanai.com"). The same Next app answers on
 * www.lumanai.com, events.lumanai.com and the vercel.app test address,
 * so without a stated home Google sees every page three times.
 *
 * Every page names its home with a canonical: the booking page (served
 * at events.lumanai.com/) belongs to the events site; everything else
 * belongs to www. See next.config.ts headers() and the per-host sitemap.
 *
 * Hardcoded on purpose: SITE_ORIGIN can hold a test address, and these
 * two must never move with an env var.
 */
export const WWW_ORIGIN = "https://www.lumanai.com";
export const EVENTS_ORIGIN = "https://events.lumanai.com";
export const EVENTS_HOST = "events.lumanai.com";
