/**
 * The origin this deployment actually answers on.
 *
 * Every absolute URL the site emits — the link-preview image iMessage
 * fetches, canonical URLs, the sitemap — is built from this. Hardcoding
 * lumanai.com is right after the DNS cutover and wrong before it: until
 * that A record moves, lumanai.com is still Shopify, so a shared link
 * would point its preview image at a domain that 404s. On launch day
 * that's the broken thumbnail in every invitation someone forwards.
 *
 * Resolution order:
 *   1. SITE_ORIGIN — an explicit override, for when the other two lie.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's own name for this
 *      project's production domain. It reads lumanaikava.vercel.app
 *      today and flips to lumanai.com by itself once the custom domain
 *      is added, which is exactly the signal we want and needs nobody
 *      to remember anything.
 *   3. lumanai.com — where this ends up.
 */

const FALLBACK = "https://lumanai.com";

function withProtocol(host: string): string {
  return /^https?:\/\//.test(host) ? host : `https://${host}`;
}

export function siteOrigin(): string {
  const explicit = process.env.SITE_ORIGIN?.trim();
  if (explicit) return withProtocol(explicit).replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return withProtocol(vercel).replace(/\/$/, "");

  return FALLBACK;
}

export const SITE_ORIGIN = siteOrigin();

/**
 * Where Shopify itself lives — customer accounts, order status, the
 * rewards balance.
 *
 * NOT SITE_ORIGIN. Today Shopify answers on lumanai.com; the moment
 * that domain points at Vercel it won't, and every "check your balance"
 * link would 404 on a site that has no /account route. The myshopify
 * domain works before, during and after the cutover, whatever custom
 * domains get shuffled around it.
 */
export function shopifyOrigin(): string {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim();
  return domain ? withProtocol(domain).replace(/\/$/, "") : "";
}
