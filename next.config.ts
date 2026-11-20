import type { NextConfig } from "next";

const SHOPIFY_STOREFRONT = `https://${
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim() ||
  "lumanai-kava.myshopify.com"
}`.replace(/^https:\/\/https?:\/\//, "https://");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Shopify product images
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },

  async rewrites() {
    /**
     * events.lumanai.com — the events business gets its own front door.
     * Same site underneath; the subdomain's home page IS the booking
     * page, so event leads never land on the shop. Every other path on
     * that host serves the normal site.
     */
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "host", value: "events.lumanai.com" }],
          destination: "/events",
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

    if (!process.env.CANONICAL_HOST_REDIRECT) return legacyStorefront;

    return [
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
