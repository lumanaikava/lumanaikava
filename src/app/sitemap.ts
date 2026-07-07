import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";

const base = "https://lumanai.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/events",
    "/menu",
    "/products",
    "/ingredients",
    "/rewards",
    "/about-kava",
    "/our-craft",
    "/our-story",
    "/faq",
    "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path === "/events" ? 0.9 : 0.7,
  }));

  const { items } = await getCatalog();
  const productRoutes = items.map((p) => ({
    url: `${base}/products/${p.handle}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
