import type { Metadata } from "next";
import { cookies } from "next/headers";
import LoginForm from "@/components/admin/LoginForm";
import SmsComposer from "@/components/admin/SmsComposer";
import { getCatalog } from "@/lib/catalog";
import { upcomingEventsSynced, formatEventDate } from "@/lib/calendar";
import { gcalConfigured } from "@/lib/gcal";
import {
  getRecentOrders,
  shopifyAdminConfigured,
  type AdminOrder,
} from "@/lib/integrations/shopify-admin";

export const metadata: Metadata = {
  title: "Command Center",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const DRIVE_FOLDER =
  "https://drive.google.com/drive/folders/110qIHJ8pAM_RHOPP0aKFLclL8R95t8Na";

const RECIPES_DOC =
  "https://docs.google.com/document/d/1LlLkiCrVhx_ZFlhQRv9HJu-sZ_lDqQTg2pswrFPlmBk/edit";

const quickLinks = [
  { label: "Gmail", href: "https://mail.google.com/", note: "lumanai.events" },
  { label: "Drive — Lumanai Business", href: DRIVE_FOLDER, note: "Sheets + docs" },
  { label: "GHL Workflow Recipes", href: RECIPES_DOC, note: "Automation setup guide" },
  { label: "Google Calendar", href: "https://calendar.google.com/", note: "Add events here → site syncs" },
  { label: "GoHighLevel", href: "https://app.gohighlevel.com/", note: "Leads + automations" },
  { label: "Shopify Admin", href: "https://admin.shopify.com/store/lumanai-kava", note: "Orders + products" },
  { label: "Canva", href: "https://www.canva.com/", note: "Brand kit" },
  { label: "GitHub Repo", href: "https://github.com/lumanaikava/lumanaikava", note: "Website code" },
  { label: "Instagram", href: "https://www.instagram.com/lumanaikava", note: "@lumanaikava" },
];

function statusChip(status: "live" | "pending") {
  return status === "live"
    ? "bg-gold/15 text-gold"
    : "bg-shell/10 text-shell/50";
}

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

  const crewName = jar.get("lumanai_crew")?.value ?? "Crew";
  const calendarSynced = gcalConfigured();
  const ordersReady = shopifyAdminConfigured();
  const twilioReady = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER,
  );

  // Fresh calendar read so an event added a minute ago shows up here.
  const next = (await upcomingEventsSynced(new Date(), 4, { fresh: true })).slice(0, 6);

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

  let orders: AdminOrder[] = [];
  let ordersError: string | null = null;
  if (ordersReady) {
    try {
      orders = await getRecentOrders(8);
    } catch (err) {
      ordersError =
        err instanceof Error ? err.message : "Couldn't reach Shopify Admin.";
    }
  }

  const automations: { name: string; status: "live" | "pending"; note: string }[] = [
    { name: "Booking form → GoHighLevel", status: "live", note: "Every quote request creates a lead" },
    { name: "Contact form → GoHighLevel", status: "live", note: "Tagged [Contact form]" },
    { name: "Newsletter/waitlist → GoHighLevel", status: "live", note: "Tagged [Newsletter] — nurture branch: Recipe 2" },
    { name: "Shop → Shopify checkout", status: "live", note: "Storefront API, hosted checkout" },
    {
      name: "Google Calendar → website events",
      status: calendarSynced ? "live" : "pending",
      note: calendarSynced
        ? "Add events in Google Calendar — site updates hourly"
        : "Paste the calendar's secret iCal URL into .env.local (GOOGLE_CALENDAR_ICS_URL)",
    },
    {
      name: "Shopify orders → fulfillment",
      status: ordersReady ? "live" : "pending",
      note: ordersReady
        ? "Orders board below · CSV export matches the Drive sheet"
        : "Needs SHOPIFY_ADMIN_TOKEN (read_orders) in .env.local",
    },
    {
      name: "SMS sending (Twilio)",
      status: twilioReady ? "live" : "pending",
      note: twilioReady
        ? "Composer above + booking alerts to your phone"
        : "Needs Twilio creds in .env.local",
    },
    {
      name: "AI email agent (auto-replies)",
      status: "pending",
      note: "Recipe 5 in the GHL Workflow Recipes doc — bot prompt ready to paste",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        Command Center · lumanai.events@gmail.com
      </p>
      <h1 className="h-sign mt-2 text-5xl text-shell">
        Run the island{crewName !== "Crew" ? `, ${crewName}` : ""}.
      </h1>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Upcoming */}
        <div className="rounded-3xl border border-shell/10 bg-lagoon/30 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="h-sign-med text-xl text-shell">Next appearances</h2>
            <a
              href="https://calendar.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-shell/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-shell hover:border-gold hover:text-gold"
            >
              + Add event
            </a>
          </div>
          <ul className="mt-4 space-y-2.5">
            {next.map((e) => {
              const d = formatEventDate(e.date);
              return (
                <li key={e.date + e.title} className="flex gap-3 text-sm">
                  <span
                    className="w-20 shrink-0 font-semibold uppercase tracking-wide"
                    style={{
                      color: e.kind === "market" ? "#c9a7ee" : "#9ec5ea",
                    }}
                  >
                    {d.weekday} {d.month} {d.day}
                  </span>
                  <span className="text-shell/80">
                    {e.title}
                    {e.kind === "bar" && (
                      <span className="text-shell/40"> · private</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-shell/50">
            {calendarSynced
              ? "Synced from Google Calendar — add or edit events there, the site follows. Put “private” in the title to hide details."
              : "Calendar sync off — add GOOGLE_CALENDAR_ICS_URL to .env.local to edit events from your phone."}
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

      {/* Orders board */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <h2 className="h-sign-med text-2xl text-shell">Latest orders</h2>
        {ordersReady && !ordersError && (
          <a
            href="/api/admin/orders/export"
            className="rounded-full bg-gold px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell"
          >
            Download fulfillment CSV
          </a>
        )}
      </div>
      {!ordersReady ? (
        <p className="mt-4 rounded-3xl border border-shell/10 bg-lagoon/20 p-6 text-sm text-shell/70">
          Connect the Shopify Admin API to see live orders here: Shopify Admin
          → Settings → Apps and sales channels → Develop apps → your headless
          app → Configuration → enable <b>read_orders</b> → Install → copy the
          Admin API token into <b>.env.local</b> as{" "}
          <b>SHOPIFY_ADMIN_TOKEN</b>. The board and the fulfillment CSV export
          light up on their own.
        </p>
      ) : ordersError ? (
        <p className="mt-4 rounded-3xl border border-shell/10 bg-lagoon/20 p-6 text-sm text-coconut">
          {ordersError}
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-4 rounded-3xl border border-shell/10 bg-lagoon/20 p-6 text-sm text-shell/70">
          No orders yet — they'll appear here the moment one lands.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-shell/10 rounded-3xl border border-shell/10 bg-lagoon/20">
          {orders.map((o) => (
            <li
              key={o.name}
              className="grid gap-1 px-5 py-3.5 sm:grid-cols-[90px_1fr_auto_auto] sm:items-center sm:gap-4"
            >
              <span className="font-mono text-sm text-gold">{o.name}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-shell">
                  {o.customerName || "—"}
                </span>
                <span className="block truncate text-xs text-shell/55">
                  {o.items.map((i) => `${i.quantity}x ${i.title}`).join(", ")}
                </span>
              </span>
              <span
                className={`justify-self-start rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] sm:justify-self-auto ${
                  /fulfilled/i.test(o.fulfillmentStatus)
                    ? "bg-gold/15 text-gold"
                    : "bg-shell/10 text-shell/60"
                }`}
              >
                {o.fulfillmentStatus.toLowerCase() || "new"}
              </span>
              <span className="font-mono text-sm text-shell/80">{o.total}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Quick links */}
      <h2 className="h-sign-med mt-10 text-2xl text-shell">Everything, one tap</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
              className={`ml-auto shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${statusChip(a.status)}`}
            >
              {a.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
