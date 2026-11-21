import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { WWW_ORIGIN } from "@/lib/canonical";

// Pages whose canonical home is www. The booking page (/events) belongs
// to the events site and is listed in its own sitemap.
const base = WWW_ORIGIN;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/find-us",
    "/products",
    "/ingredients",
    "/about-kava",
    "/our-craft",
    "/our-story",
    "/faq",
    "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const { items } = await getCatalog();
  const productRoutes = items.map((p) => ({
    url: `${base}/products/${p.handle}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
