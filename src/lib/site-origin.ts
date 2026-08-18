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
 *   1. SITE_ORIGIN — set this. It is the only one that is certainly true.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's name for the project's
 *      production domain.
 *   3. lumanai.com — where this ends up.
 *
 * ⚠️ Step 2 is a trap worth knowing about. It reports whatever domain
 * is attached in Vercel, INCLUDING one whose DNS record was never
 * created. This project had join.lumanai.com left over from an
 * abandoned plan, so it confidently returned a hostname that resolves
 * nowhere — which is worse than a wrong-but-live domain, because the
 * link preview then fetches from a host that doesn't answer at all.
 *
 * So: set SITE_ORIGIN, and delete dead domains from the Vercel project.
 */

// Vercel serves on www and 308s the apex to it, so www is canonical.
const FALLBACK = "https://www.lumanai.com";

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
