import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

const base = "https://lumanai.com";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const productRoutes = products.map((p) => ({
    url: `${base}/products/${p.handle}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
