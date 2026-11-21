import { EVENTS_ORIGIN } from "@/lib/canonical";

// Served as events.lumanai.com/robots.txt (rewrite in next.config.ts).
export const dynamic = "force-static";

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api/",
    "",
    `Sitemap: ${EVENTS_ORIGIN}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
