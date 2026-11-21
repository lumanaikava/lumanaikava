import type { MetadataRoute } from "next";
import { WWW_ORIGIN } from "@/lib/canonical";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${WWW_ORIGIN}/sitemap.xml`,
  };
}
