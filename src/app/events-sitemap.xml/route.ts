import { EVENTS_ORIGIN } from "@/lib/canonical";

// Served as events.lumanai.com/sitemap.xml (rewrite in next.config.ts).
// Lists only the pages whose canonical home is the events site.
export const dynamic = "force-static";

const pages = [{ path: "/", priority: "1.0" }];

export function GET() {
  const urls = pages
    .map(
      (p) =>
        `  <url>\n    <loc>${EVENTS_ORIGIN}${p.path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
    )
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
