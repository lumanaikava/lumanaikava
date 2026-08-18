import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Shopify product images
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
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
    if (!process.env.CANONICAL_HOST_REDIRECT) return [];

    return [
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
