import type { Metadata } from "next";
import BuyTicket, { type Tier } from "@/components/party/BuyTicket";
import Countdown from "@/components/party/Countdown";
import EventMark from "@/components/party/EventMark";
import { getProductByHandle, formatPrice } from "@/lib/integrations/shopify";
import { PARTY_TICKET_HANDLE } from "@/lib/catalog";
import { isUnpublished, tierRank, crewLinkCode } from "@/lib/party-tiers";

/**
 * LUNA EKLIPTIKA — the launch party.
 *
 * No password. The page is `noindex`, unlinked from the nav, and reached
 * either by a link you were sent or by finding the coconut in the footer.
 * A passcode on top of that only ever stopped invited people who'd
 * forgotten the word — the exclusivity is the guest list and the ticket
 * tiers, not a gate that annoys the people you actually invited.
 *
 * The venue address appears NOWHERE in this file, in the repo, or in any
 * response this route sends. It is printed on the physical ticket that
 * ships after purchase — that's the whole point of the night. Please keep
 * it that way: anything rendered here is one "view source" away from
 * public.
 */

export const metadata: Metadata = {
  title: "Luna Ekliptika",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Golden Hour opens Aug 28 2026, 7:00 PM Las Vegas (PDT = UTC−7). */
const DOORS_ISO = "2026-08-29T02:00:00Z";

const RUN_OF_NIGHT = [
  {
    time: "7–8 PM",
    title: "Golden Hour",
    body: "A private reception for Meridian and above. Welcome champagne mocktail poured on arrival, before the room fills.",
    gated: true,
  },
  {
    time: "8 PM",
    title: "Doors",
    body: "The full bar opens, the menu is revealed, and the kitchen starts sending. Live DJ until late.",
  },
  {
    time: "Late",
    title: "Totality",
    body: "Zach keeps pouring until the last person leaves.",
  },
];

/**
 * What's being kept back on purpose.
 *
 * The drink lineup used to be listed here. It isn't anymore — Ash is
 * building a secret cocktail menu and Zach a matching spread, and naming
 * either would spend the surprise before anyone walks in. Tease the
 * shape, never the contents.
 */
const SEALED = [
  {
    label: "The menu",
    by: "Ash",
    line: "A kava cocktail list written for one night and never served again.",
  },
  {
    label: "The table",
    by: "Zach",
    line: "Hors d'oeuvres built to sit against it, course by course.",
  },
];

const CREW = [
  { name: "Zach", role: "Behind the bar" },
  { name: "Ash", role: "Your host" },
  { name: "Karina", role: "Running the night" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
      {children}
    </p>
  );
}

export default async function InvitedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  /**
   * The Friends + Family rate is unpublished. Filtering happens HERE, on
   * the server, so an unlisted $20 ticket is never in the HTML for anyone
   * to find — hiding it in the component would still ship it to every
   * browser. It unlocks with /invited?crew=<PARTY_CREW_CODE>.
   */
  const code = crewLinkCode();
  const crewLink = Boolean(code) && params.crew === code;

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
        .filter((t) => crewLink || !isUnpublished(t.title))
        // Shopify returns variants in its own order; show them cheapest
        // tier first so the ladder reads the way it was designed.
        .sort((a, b) => tierRank(a.title) - tierRank(b.title));
    }
  } catch {
    /* Shopify unreachable — the page still renders; the card explains. */
  }

  const anyAvailable = tiers.some((t) => t.available);

  return (
    /* Scoped theme: black environment, earth tones, gold + silver.
       Redefines the brand palette for this page only — the rest of
       the site keeps its navy/purple. */
    <div className="luna">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="luna-sweep relative overflow-hidden">
        <div className="luna-bg pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="luna-grain pointer-events-none absolute inset-0 opacity-80"
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[92svh] max-w-4xl flex-col items-center justify-center px-6 py-12 sm:py-20 text-center">
          <EventMark
            id="hero"
            className="luna-float mb-9 h-32 w-32 text-shell sm:h-40 sm:w-40"
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
            Fri · Aug 28 · Golden Hour 7PM · Doors 8PM
          </p>
          <p className="luna-in luna-d3 mt-2 font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            Dress code — all black
          </p>

          {/* The address is the secret. Show its shape, not its content. */}
          <p className="mt-3 flex flex-wrap items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-shell/45">
            <span>A private mansion ·</span>
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
            Get on the list
          </a>
        </div>
      </section>

      {/* ── One panel: what's sealed, and how the night runs ── */}
      <section className="luna-sweep relative overflow-hidden border-t border-shell/10 px-6 py-9 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Deliberately vague. The menu is the surprise. */}
            <div className="luna-in luna-d1">
              <Eyebrow>Sealed until the doors</Eyebrow>
              <h2 className="h-sign mt-4 text-4xl text-shell sm:text-5xl">
                Nobody sees
                <br />
                <span className="text-gold">the menu early.</span>
              </h2>
              <ul className="mt-7 space-y-5">
                {SEALED.map((s) => (
                  <li key={s.label} className="border-l border-gold/30 pl-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
                      {s.label} · {s.by}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-shell/70">
                      {s.line}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-xs leading-relaxed text-shell/35">
                Open bar comes with Meridian and above. Obsidian includes a
                craft drink and a traditional shot, with everything after
                at a discount. Zero alcohol, all night.
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

              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-shell/35">
                Your crew
              </p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                {CREW.map((c) => (
                  <span key={c.name} className="text-sm text-shell/70">
                    <span className="h-sign-med text-shell">{c.name}</span>
                    <span className="text-shell/40"> · {c.role}</span>
                  </span>
                ))}
              </div>
              <p className="mt-6 text-xs leading-relaxed text-shell/35">
                Hand-picked, invite only, capped on purpose. No lines, no
                wristbands, no strangers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tickets ──────────────────────────────────────────── */}
      <section
        id="tickets"
        className="relative border-t border-shell/10 px-6 py-10 sm:py-16"
      >
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Admission</Eyebrow>
          <h2 className="h-sign mt-4 text-5xl text-shell sm:text-6xl">
            Choose your orbit.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-shell/75">
            Your ticket arrives in the mail — a real, printed ticket. The
            address is printed on it, and nowhere else. Checkout asks
            where to send it.
          </p>

          <div className="mt-9 rounded-3xl border border-gold/40 bg-abyss/60 p-7 backdrop-blur sm:p-9">
            {!productFound ? (
              <p className="text-shell/75">
                Tickets drop here any minute — keep this page close.
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
            All black. 21+. Zero alcohol, all night — everyone drives
            home sharp. Order early enough for the mail to reach you.
            Keep the address between friends; the room is capped and the
            list is checked at the door.
          </p>
        </div>
      </section>
    </div>
  );
}
