import type { NextConfig } from "next";

const SHOPIFY_STOREFRONT = `https://${
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim() ||
  "lumanai-kava.myshopify.com"
}`.replace(/^https:\/\/https?:\/\//, "https://");

/**
 * SEO: which site each page belongs to (see src/lib/canonical.ts).
 *
 * A Link rel=canonical response header on every page names its home, so
 * the copies on the other hosts (www, events, the vercel.app test
 * address) don't compete with it. Later rules override earlier ones for
 * the same header key, so the default comes first.
 */
const WWW_ORIGIN = "https://www.lumanai.com";
const EVENTS_ORIGIN = "https://events.lumanai.com";
const EVENTS_HOST = "events.lumanai.com";
const canonical = (url: string) => [
  { key: "Link", value: `<${url}>; rel="canonical"` },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Default: every page's home is www (assets and API excluded).
      {
        source: "/:path((?!_next/|api/).*)",
        headers: canonical(`${WWW_ORIGIN}/:path`),
      },
      // The booking page is the events site's home page, on any host.
      { source: "/events", headers: canonical(`${EVENTS_ORIGIN}/`) },
      {
        source: "/",
        has: [{ type: "host", value: EVENTS_HOST }],
        headers: canonical(`${EVENTS_ORIGIN}/`),
      },
    ];
  },

  images: {
    remotePatterns: [
      // Shopify product images
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },

  async rewrites() {
    /**
     * events.lumanai.com — the events business gets its own front door.
     * Same site underneath; the subdomain's home page is the bar landing
     * page (src/app/bar), so event leads never land on the shop. Every other path on
     * that host serves the normal site.
     */
    return {
      beforeFiles: [
        // The events site gets its own robots.txt and sitemap, listing
        // only its own pages (src/app/events-robots.txt, events-sitemap.xml).
        {
          source: "/robots.txt",
          has: [{ type: "host", value: EVENTS_HOST }],
          destination: "/events-robots.txt",
        },
        {
          source: "/sitemap.xml",
          has: [{ type: "host", value: EVENTS_HOST }],
          destination: "/events-sitemap.xml",
        },
        {
          source: "/",
          has: [{ type: "host", value: "events.lumanai.com" }],
          destination: "/bar",
        },
      ],
    };
  },

  async redirects() {
    /**
     * After the DNS cutover the site answers on two hostnames, and
     * Google will index both — splitting every page's ranking between
     * lumanai.com and lumanaikava.vercel.app.
     *
     * Target is www, not the apex: Vercel serves on www.lumanai.com and
     * 308s the apex to it, so pointing here at the apex would make
     * every redirected request take two hops.
     *
     * OFF until CANONICAL_HOST_REDIRECT is set. Safe to enable now that
     * lumanai.com is live on Vercel (2026-08-18).
     */
    /**
     * Printed material outlives websites.
     *
     * The "SCAN TO SHOP ONLINE" cards in circulation were made for the
     * old Shopify/Squarespace storefront, so their QR points at
     * Shopify-shaped paths (/collections/..., /cart, /pages/...). None
     * of those exist on the headless site — every one of them was a
     * 404 for anyone scanning a card. These send them to /products,
     * which IS the shop (/shop is only a redirect to it, so aiming
     * there would cost every scan a second hop).
     */
    // The public drinks menu was taken down (Nov 2026) — Ash doesn't
    // want drinks or prices on the site. Old links and search results
    // land on the booking page instead. Per-event menus (/menu/<event>)
    // are untouched.
    const removedPages = [
      { source: "/menu", destination: "/events", permanent: false },
    ];

    const legacyStorefront = [
      { source: "/collections", destination: "/products" },
      { source: "/collections/:path*", destination: "/products" },
      { source: "/pages/:path*", destination: "/products" },
      { source: "/cart", destination: "/products" },
      { source: "/cart/:path*", destination: "/products" },
      { source: "/shop-online", destination: "/products" },
      { source: "/store", destination: "/products" },
      { source: "/order", destination: "/products" },
      { source: "/order-online", destination: "/products" },
      { source: "/shop-all", destination: "/products" },
      // Shopify's own account paths, so an old link still reaches the
      // real account system rather than dead-ending.
      { source: "/account", destination: "https://account.lumanai.com" },
      { source: "/account/:path*", destination: "https://account.lumanai.com" },
      // Shopify app proxies. Seal Subscriptions' customer portal (and
      // the "manage subscription" links in every Seal email) live at
      // /a/subscriptions; Joy and other apps use /apps/*. These only
      // exist on Shopify's storefront, so since the DNS cutover they
      // 404'd here and subscribers couldn't manage their plans. Send
      // them to the myshopify host, which still answers them. Query
      // strings (Seal's signed links) carry through.
      { source: "/a/:path*", destination: `${SHOPIFY_STOREFRONT}/a/:path*` },
      { source: "/apps/:path*", destination: `${SHOPIFY_STOREFRONT}/apps/:path*` },
    ].map((r) => ({ ...r, permanent: false }));

    if (!process.env.CANONICAL_HOST_REDIRECT)
      return [...removedPages, ...legacyStorefront];

    return [
      ...removedPages,
      ...legacyStorefront,
      {
        source: "/:path*",
        has: [{ type: "host", value: "lumanaikava.vercel.app" }],
        destination: "https://www.lumanai.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
