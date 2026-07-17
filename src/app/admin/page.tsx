import type { Metadata } from "next";
import { cookies } from "next/headers";
import LoginForm from "@/components/admin/LoginForm";
import SmsComposer from "@/components/admin/SmsComposer";
import { getCatalog } from "@/lib/catalog";
import { upcomingEvents, formatEventDate } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "Command Center",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const DRIVE_FOLDER =
  "https://drive.google.com/drive/folders/110qIHJ8pAM_RHOPP0aKFLclL8R95t8Na";

const quickLinks = [
  { label: "Gmail", href: "https://mail.google.com/", note: "lumanai.events" },
  { label: "Drive — Lumanai Business", href: DRIVE_FOLDER, note: "Sheets + docs" },
  { label: "Google Calendar", href: "https://calendar.google.com/", note: "Residencies synced" },
  { label: "GoHighLevel", href: "https://app.gohighlevel.com/", note: "Leads + automations" },
  { label: "Shopify Admin", href: "https://admin.shopify.com/store/lumanai-kava", note: "Orders + products" },
  { label: "Canva", href: "https://www.canva.com/", note: "Brand kit" },
  { label: "GitHub Repo", href: "https://github.com/lumanaikava/lumanaikava", note: "Website code" },
  { label: "Instagram", href: "https://www.instagram.com/lumanaikava", note: "@lumanaikava" },
];

const automations: { name: string; status: "live" | "pending"; note: string }[] = [
  { name: "Booking form → GoHighLevel", status: "live", note: "Every quote request creates a lead" },
  { name: "Contact form → GoHighLevel", status: "live", note: "Tagged [Contact form]" },
  { name: "Newsletter/waitlist → GoHighLevel", status: "live", note: "Tagged [Newsletter] — add a GHL branch to nurture" },
  { name: "Shop → Shopify checkout", status: "live", note: "Storefront API, hosted checkout" },
  { name: "SMS sending (Twilio)", status: "pending", note: "Needs Twilio creds in .env.local" },
  { name: "Booking SMS alert to your phone", status: "pending", note: "Fires automatically once Twilio is set" },
  { name: "AI email agent (auto-replies)", status: "pending", note: "Built in GHL: Automation → AI agents, on top of the tagged leads above" },
];

export default async function AdminPage() {
  const jar = await cookies();
  const authed =
    !!process.env.ADMIN_PASSCODE &&
    jar.get("lumanai_admin")?.value === process.env.ADMIN_PASSCODE;

  if (!authed) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Crew only
        </p>
        <h1 className="h-sign mt-3 text-5xl text-shell">Command Center</h1>
        <LoginForm />
      </section>
    );
  }

  const next = upcomingEvents().slice(0, 5);
  let shopLine = "Shopify unreachable — using static fallback.";
  try {
    const { items, live } = await getCatalog();
    const soldOut = items.filter((p) => !p.available).length;
    shopLine = live
      ? `${items.length} products live · ${soldOut} sold out`
      : "Static fallback active (Shopify unreachable)";
  } catch {
    /* keep default */
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        Command Center · lumanai.events@gmail.com
      </p>
      <h1 className="h-sign mt-2 text-5xl text-shell">Run the island.</h1>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Upcoming */}
        <div className="rounded-3xl border border-shell/10 bg-lagoon/30 p-6">
          <h2 className="h-sign-med text-xl text-shell">Next appearances</h2>
          <ul className="mt-4 space-y-2.5">
            {next.map((e) => {
              const d = formatEventDate(e.date);
              return (
                <li key={e.date + e.title} className="flex gap-3 text-sm">
                  <span className="w-20 shrink-0 font-semibold uppercase tracking-wide text-coconut">
                    {d.weekday} {d.month} {d.day}
                  </span>
                  <span className="text-shell/80">{e.title}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-shell/50">
            Edit in src/lib/calendar.ts · synced to Google Calendar
          </p>
        </div>

        {/* Shop */}
        <div className="rounded-3xl border border-shell/10 bg-lagoon/30 p-6">
          <h2 className="h-sign-med text-xl text-shell">Shop</h2>
          <p className="mt-4 text-sm text-shell/80">{shopLine}</p>
          <a
            href="https://admin.shopify.com/store/lumanai-kava/orders"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full border border-shell/25 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-shell hover:border-gold hover:text-gold"
          >
            Open Orders →
          </a>
          <p className="mt-4 text-xs text-shell/50">
            Log fulfillment in the Order Fulfillment sheet (Drive)
          </p>
        </div>

        {/* SMS */}
        <div className="rounded-3xl border border-shell/10 bg-lagoon/30 p-6">
          <h2 className="h-sign-med text-xl text-shell">Text a customer</h2>
          <div className="mt-4">
            <SmsComposer />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <h2 className="h-sign-med mt-10 text-2xl text-shell">Everything, one tap</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickLinks.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-shell/15 bg-abyss/50 p-4 transition-colors hover:border-gold"
          >
            <p className="text-sm font-bold text-shell">{l.label}</p>
            <p className="mt-1 text-xs text-shell/50">{l.note}</p>
          </a>
        ))}
      </div>

      {/* Automations */}
      <h2 className="h-sign-med mt-10 text-2xl text-shell">Automations</h2>
      <ul className="mt-4 divide-y divide-shell/10 rounded-3xl border border-shell/10 bg-lagoon/20">
        {automations.map((a) => (
          <li key={a.name} className="flex items-center gap-4 px-5 py-3.5">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                a.status === "live" ? "bg-gold" : "bg-shell/25"
              }`}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-shell">{a.name}</p>
              <p className="truncate text-xs text-shell/55">{a.note}</p>
            </div>
            <span
              className={`ml-auto shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                a.status === "live"
                  ? "bg-gold/15 text-gold"
                  : "bg-shell/10 text-shell/50"
              }`}
            >
              {a.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
