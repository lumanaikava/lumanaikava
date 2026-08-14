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
     * This sends the vercel.app host to the real domain. It is OFF
     * until CANONICAL_HOST_REDIRECT is set, because switching it on
     * before lumanai.com points at Vercel would redirect the only
     * working URL of the new site straight into the old Shopify store.
     *
     * Turn it on in Vercel — CANONICAL_HOST_REDIRECT=1 — once
     * lumanai.com is serving this site, and redeploy.
     */
    if (!process.env.CANONICAL_HOST_REDIRECT) return [];

    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "lumanaikava.vercel.app" }],
        destination: "https://lumanai.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
