import type { Metadata } from "next";
import { cookies } from "next/headers";
import PartyGate from "@/components/party/PartyGate";
import BuyTicket, { type Tier } from "@/components/party/BuyTicket";
import Countdown from "@/components/party/Countdown";
import EventMark from "@/components/party/EventMark";
import SpotsLeft from "@/components/party/SpotsLeft";
import { partySpotsLeft } from "@/lib/party-capacity";
import { getProductByHandle, formatPrice } from "@/lib/integrations/shopify";
import { PARTY_TICKET_HANDLE } from "@/lib/catalog";
import { tierRank } from "@/lib/party-tiers";

/**
 * LUNA EKLIPTIKA — the launch party.
 *
 * PASSWORD ONLY (Ash, 2026-08-17). A private event at a private
 * residence is a different legal posture from a public one, and the
 * door is part of what makes it private — along with the waiver at
 * checkout. The word lives in PARTY_PASSCODE.
 *
 * The venue address appears NOWHERE in this file, in the repo, or in any
 * response this route sends. It goes out by email after a contribution
 * is made — that's the whole point of the night. Please keep it that
 * way: anything rendered here is one "view source" away from public.
 */

export const metadata: Metadata = {
  title: "Luna Ekliptika",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** VIP Reception opens Aug 28 2026, 7:00 PM Las Vegas (PDT = UTC−7). */
const DOORS_ISO = "2026-08-29T02:00:00Z";

const RUN_OF_NIGHT = [
  {
    time: "7–8 PM",
    title: "VIP Reception",
    body: "A private hour on the roof for Meridian and above — a welcome pour, live strings, and the room before it fills.",
    gated: true,
  },
  {
    time: "8 PM",
    title: "Doors",
    body: "The bar opens and the menu is revealed.",
  },
  {
    time: "9 PM",
    title: "Appetizer",
    body: "Ginger citrus beet salad in an endive shell.",
  },
  {
    time: "9:30 PM",
    title: "Entrée",
    body: "Charred shrimp and pineapple skewer in a manuka honey glaze.",
  },
  {
    time: "10 PM",
    title: "Dessert",
    body: "Sesame ube truffle with shaved coconut dust and raspberry coulis.",
  },
  {
    time: "12 AM",
    title: "Midnight moon",
    body: "A soundbath under the full moon, then after hours inside.",
  },
  {
    time: "1 AM",
    title: "Totality",
    body: "The last pour.",
  },
];

/**
 * The offerings.
 *
 * Ash replaced the old "sealed until the doors" tease with this: three
 * plain headings that say what the night actually contains. Still no
 * drink names — the menu is the surprise — but the shape is concrete
 * now, which sells better than a locked box.
 */
const OFFERINGS = [
  {
    label: "The bar",
    line: "Unlimited traditional kava shots for everyone, all night. An exclusively crafted menu of naktails (kava) and functional mocktails — with Ash's signature kanna cocktail poured for Meridian and above.",
  },
  {
    label: "The table",
    line: "Three courses, no sugar in any of them. Ginger citrus beet salad in an endive shell; charred shrimp and pineapple skewer in a manuka honey glaze; sesame ube truffle with shaved coconut dust and raspberry coulis. Anti-inflammatory by design.",
  },
  {
    label: "Activations",
    line: "Poolside cold plunges, midnight sound bath, and more.",
  },
  {
    label: "The lineup",
    line: "DJ lineup drops later this week.",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
      {children}
    </p>
  );
}

/** What everyone sees until they say the word. */
function Door() {
  return (
    <div className="luna">
      <section className="luna-sweep relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
        <div className="luna-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="luna-roots" aria-hidden />
        <div
          className="luna-grain pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
        />
        <div className="relative">
          <EventMark
            priority
            sizes="112px"
            className="luna-float mx-auto mb-8 h-28 w-28"
          />
          <Eyebrow>08 · 28 · 26 — Las Vegas</Eyebrow>
          <h1 className="h-sign mt-5 text-5xl text-shell sm:text-7xl">
            Invitation <span className="text-gold">only.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-shell/60">
            A private evening at a private residence. If you&rsquo;re
            meant to be here, you were given the word.
          </p>
          <PartyGate />
        </div>
      </section>
    </div>
  );
}

export default async function InvitedPage() {
  const expected = process.env.PARTY_PASSCODE;
  const jar = await cookies();
  const invited = Boolean(expected) && jar.get("lumanai_invited")?.value === expected;

  if (!invited) return <Door />;

  // Ticket product — lives in Shopify, hidden from the shop, sold only here.
  let tiers: Tier[] = [];
  let productFound = false;
  try {
    const p = await getProductByHandle(PARTY_TICKET_HANDLE);
    if (p) {
      productFound = true;
      tiers = p.variants.edges
        .map(({ node }) => ({
          variantId: node.id,
          title: node.title,
          priceLabel: formatPrice(node.price.amount, node.price.currencyCode),
          available: node.availableForSale,
        }))
        // Shopify returns variants in its own order; show them cheapest
        // tier first so the ladder reads the way it was designed.
        .sort((a, b) => tierRank(a.title) - tierRank(b.title));
    }
  } catch {
    /* Shopify unreachable — the page still renders; the card explains. */
  }

  const anyAvailable = tiers.some((t) => t.available);

  // Null when the Storefront token can't read inventory — the counter
  // is then simply absent rather than wrong.
  const capacity = await partySpotsLeft();

  return (
    /* Scoped theme: black environment, earth tones, gold + silver.
       Redefines the brand palette for this page only — the rest of
       the site keeps its navy/purple. */
    <div className="luna">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="luna-sweep relative overflow-hidden">
        <div className="luna-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="luna-roots" aria-hidden />
        <div
          className="luna-grain pointer-events-none absolute inset-0 opacity-80"
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[92svh] max-w-4xl flex-col items-center justify-center px-6 py-12 sm:py-20 text-center">
          <EventMark
            priority
            sizes="(min-width: 640px) 176px, 144px"
            className="luna-float mb-9 h-36 w-36 sm:h-44 sm:w-44"
          />
          <p className="luna-in font-mono text-[11px] uppercase tracking-[0.35em] text-shell/60">
            Lumanai presents
          </p>
          <h1 className="h-sign luna-in luna-d1 mt-4 text-[3.2rem] leading-[0.86] text-shell sm:text-[6.5rem]">
            Luna
            <br />
            <span className="text-gold">Ekliptika</span>
          </h1>
          <p className="luna-in luna-d2 mt-6 font-mono text-sm uppercase tracking-[0.3em] text-shell/80">
            Fri · Aug 28 · 7PM–1AM · Doors 8PM
          </p>
          <p className="luna-in luna-d3 mt-2 font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            Dress code — all white
          </p>
          {capacity && capacity.left > 0 && (
            <p className="luna-in luna-d3 mt-3 font-mono text-[11px] uppercase tracking-[0.24em] text-shell/50">
              {capacity.left} of {capacity.capacity} spots left
            </p>
          )}

          {/* The address is the secret. Show its shape, not its content. */}
          <p className="mt-3 flex flex-wrap items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-shell/45">
            <span>A private residence ·</span>
            <span
              className="inline-block h-[1em] w-32 translate-y-[0.15em] rounded-[2px] bg-shell/25"
              aria-hidden
            />
            <span className="sr-only">address withheld</span>
            <span>· Las Vegas</span>
          </p>

          <div className="luna-in luna-d4 mt-10">
            <Countdown target={DOORS_ISO} />
          </div>

          <a
            href="#tickets"
            className="btn-brush luna-in luna-d5 mt-12 font-mono text-sm font-bold uppercase tracking-[0.2em] text-shell"
            style={{ "--brush-bg": "var(--amethyst)" } as React.CSSProperties}
          >
            Secure your spot
          </a>
        </div>
      </section>

      {/* ── The offerings, and how the night runs ───────────── */}
      <section className="luna-sweep relative overflow-hidden border-t border-shell/10 px-6 py-9 sm:py-14">
        <div className="luna-roots luna-roots--soft" aria-hidden />
        <div className="relative mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="luna-in luna-d1">
              <Eyebrow>The offerings</Eyebrow>
              <h2 className="h-sign mt-4 text-4xl text-shell sm:text-5xl">
                What the night
                <br />
                <span className="text-gold">is made of.</span>
              </h2>
              <ul className="mt-7 space-y-5">
                {OFFERINGS.map((o) => (
                  <li key={o.label} className="border-l border-gold/30 pl-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
                      {o.label}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-shell/70">
                      {o.line}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-xs leading-relaxed text-shell/35">
                Every ticket pours unlimited kava shots. Obsidian adds one
                naktail from the exclusive menu, with everything after at a
                discount. Meridian and above open the whole cocktail list,
                plus the signature pour. Zero alcohol, all night.
              </p>
            </div>

            <div className="luna-in luna-d2">
              <Eyebrow>Run of the night</Eyebrow>
              <ol className="mt-6 space-y-5">
                {RUN_OF_NIGHT.map((m) => (
                  <li key={m.title} className="flex gap-4">
                    <span className="w-16 shrink-0 pt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
                      {m.time}
                    </span>
                    <div>
                      <p className="h-sign-med text-lg text-shell">
                        {m.title}
                        {m.gated && (
                          <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 align-middle font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                            Meridian +
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-shell/60">
                        {m.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="luna-rule my-7" />

              <p className="text-xs leading-relaxed text-shell/35">
                Fifty people. Hand-picked, invitation only, capped on
                purpose. No lines, no wristbands, no strangers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tickets ──────────────────────────────────────────── */}
      <section
        id="tickets"
        className="relative overflow-hidden border-t border-shell/10 px-6 py-10 sm:py-16"
      >
        <div className="luna-roots" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <Eyebrow>Admission</Eyebrow>
          <h2 className="h-sign mt-4 text-5xl text-shell sm:text-6xl">
            Choose your orbit.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-shell/75">
            Your contribution secures your spot. Confirmation and the
            full details — including where — arrive by email. Nothing
            ships.
          </p>

          <div className="mt-9 rounded-3xl border border-gold/40 bg-abyss/60 p-7 backdrop-blur sm:p-9">
            {capacity && (
              <div className="mb-8 border-b border-shell/10 pb-7">
                <SpotsLeft data={capacity} />
              </div>
            )}
            {!productFound ? (
              <p className="text-shell/75">
    Contributions open here any minute — keep this page close.
              </p>
            ) : anyAvailable ? (
              <BuyTicket tiers={tiers} />
            ) : (
              <p className="text-shell/75">
                Sold out. Follow{" "}
                <a
                  href="https://www.instagram.com/lumanaikava"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="prose-link text-shell hover:text-gold"
                >
                  @lumanaikava
                </a>{" "}
                in case a few come back.
              </p>
            )}
          </div>

          <p className="mx-auto mt-9 max-w-md text-xs leading-relaxed text-shell/40">
            All white — off-whites, beiges and kava colors welcome.
            Linens preferred, swimsuits optional. 21+. Zero alcohol,
            all night, so everyone drives home sharp.
            Keep the details between friends — the room is capped and
            the list is checked at the door.
          </p>
        </div>
      </section>
    </div>
  );
}
