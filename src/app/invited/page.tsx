import type { Metadata } from "next";
import { cookies } from "next/headers";
import PartyGate from "@/components/party/PartyGate";
import BuyTicket, { type Tier } from "@/components/party/BuyTicket";
import Countdown from "@/components/party/Countdown";
import SplashDrink from "@/components/SplashDrink";
import { getProductByHandle, formatPrice } from "@/lib/integrations/shopify";
import { PARTY_TICKET_HANDLE } from "@/lib/catalog";
import { secretDrinks } from "@/lib/drinks-db";
import { isUnpublished, tierRank, crewLinkCode } from "@/lib/party-tiers";

/**
 * LUMANAI LAUNCH — the invite-only launch party. Never linked in the nav;
 * the URL travels by word of mouth with the password.
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

/**
 * The eclipse. A gold corona around a dark disc — drawn rather than
 * shipped as an image so it scales cleanly and costs nothing to load.
 */
function Eclipse({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none relative ${className}`} aria-hidden>
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(237,226,180,0.55) 0%, rgba(237,226,180,0.18) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "var(--abyss)",
          boxShadow:
            "0 0 0 2px rgba(237,226,180,0.75), 0 0 60px 8px rgba(237,226,180,0.35)",
        }}
      />
    </div>
  );
}

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
    body: "The full bar opens. Hors d'oeuvres all night, live DJ, and the two pours nobody has tasted yet.",
  },
  {
    time: "Late",
    title: "Totality",
    body: "Zach keeps pouring until the last person leaves.",
  },
];

const OPEN_BAR = [
  {
    name: "Kava Shots",
    note: "Traditional. Straight from the tanoa.",
    image: null,
  },
  {
    name: "Hive Mind",
    note: "Manuka honey, ginger, lemon.",
    image: "/images/drinks/clear/hive-mind.png",
  },
  {
    name: "Pacific Rim",
    note: "Pineapple, coconut, Madagascar vanilla.",
    image: "/images/drinks/clear/pacific-rim.png",
  },
  {
    name: "Adapterol Spritz",
    note: "Damiana, schisandra, raspberry rose.",
    image: "/images/drinks/clear/adapterol-spritz.png",
  },
];

const CREW = [
  { name: "Zach", role: "Behind the bar" },
  { name: "Ash", role: "Your host" },
  { name: "Karina", role: "Running the night" },
];

/**
 * The traditional pour has no product photo — the other three tiles use
 * real glasses, so a drawn shot glass keeps the row from having one
 * obviously empty slot.
 */
function ShotGlass() {
  return (
    <div
      className="flex h-20 w-14 shrink-0 items-center justify-center sm:h-24"
      aria-hidden
    >
      <svg viewBox="0 0 40 50" className="h-14 w-11">
        <defs>
          <linearGradient id="kava-pour" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a2814f" />
            <stop offset="100%" stopColor="#5f4526" />
          </linearGradient>
        </defs>
        {/* the pour, filling most of the glass */}
        <path d="M8.1 18 H31.9 L27.4 45.4 H12.6 Z" fill="url(#kava-pour)" />
        {/* surface highlight */}
        <ellipse cx="20" cy="18" rx="11.9" ry="1.7" fill="#c9a978" opacity="0.7" />
        {/* glass */}
        <path
          d="M6 6 H34 L28.6 45.6 A2.4 2.4 0 0 1 26.2 47.6 H13.8 A2.4 2.4 0 0 1 11.4 45.6 Z"
          fill="none"
          stroke="rgba(244,236,220,0.4)"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

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
  const jar = await cookies();
  const invited =
    !!process.env.PARTY_PASSCODE &&
    jar.get("lumanai_invited")?.value === process.env.PARTY_PASSCODE;

  if (!invited) {
    return (
      <section className="relative flex min-h-[85svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url(/images/roots-hero.webp)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 600px at 50% 40%, rgba(107,58,156,0.35), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <Eclipse className="mx-auto mb-8 h-24 w-24" />
          <Eyebrow>08 · 28 · 26 — Las Vegas</Eyebrow>
          <h1 className="h-sign mt-5 text-6xl text-shell sm:text-8xl">
            Invite <span className="text-gold">only.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-shell/70">
            One night. One address. If you're supposed to be here, you
            already know the word.
          </p>
          <PartyGate />
        </div>
      </section>
    );
  }

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
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="hero-roots pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url(/images/roots-hero.webp)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(1000px 700px at 50% 0%, rgba(198,58,142,0.25), transparent 65%), radial-gradient(800px 600px at 10% 90%, rgba(24,92,124,0.35), transparent 65%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[92svh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
          <Eclipse className="mb-9 h-28 w-28 sm:h-32 sm:w-32" />
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-shell/60">
            Lumanai presents
          </p>
          <h1 className="h-sign mt-4 text-[3.2rem] leading-[0.86] text-shell sm:text-[6.5rem]">
            Luna
            <br />
            <span className="text-gold">Ekliptika</span>
          </h1>
          <p className="mt-6 font-mono text-sm uppercase tracking-[0.3em] text-shell/80">
            Fri · Aug 28 · Golden Hour 7PM · Doors 8PM
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
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

          <div className="mt-10">
            <Countdown target={DOORS_ISO} />
          </div>

          <a
            href="#tickets"
            className="btn-brush mt-12 font-mono text-sm font-bold uppercase tracking-[0.2em] text-shell"
            style={{ "--brush-bg": "var(--amethyst)" } as React.CSSProperties}
          >
            Get on the list
          </a>
        </div>
      </section>

      {/* ── What's launching ─────────────────────────────────── */}
      <section className="relative border-t border-shell/10 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <Eyebrow>What we&apos;re celebrating</Eyebrow>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div className="rounded-3xl border border-gold/30 bg-abyss/50 p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
                01 — The product
              </p>
              <h2 className="h-sign mt-3 text-4xl text-shell">
                Lumanai Rush
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-shell/75">
                Sun-dried kava root juice, milled to an instant powder.
                Ceremonial kava in about ten seconds, no straining, no
                grit. You'll be the first room in the world to taste it.
              </p>
            </div>
            <div className="rounded-3xl border border-shell/15 bg-abyss/40 p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-shell/50">
                02 — The house
              </p>
              <h2 className="h-sign mt-3 text-4xl text-shell">
                lumanai.com
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-shell/75">
                The website goes live to the public the same night —
                menu, booking, the whole bar. You're seeing the inside of
                it before anyone else does.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The open bar ─────────────────────────────────────── */}
      <section className="relative border-t border-shell/10 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>The bar · all night · zero alcohol</Eyebrow>
          <h2 className="h-sign mt-4 text-5xl text-shell sm:text-6xl">
            Everything is poured.
          </h2>
          <p className="mt-3 max-w-xl text-shell/70">
            Hors d&apos;oeuvres all night and no tickets at the bar. Open
            bar comes with Meridian and above; Obsidian includes a craft
            drink and a traditional shot, with everything after at a
            discount.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OPEN_BAR.map((d) => (
              <div
                key={d.name}
                className="flex items-center gap-4 rounded-2xl border border-shell/12 bg-abyss/40 p-4 sm:flex-col sm:items-start sm:p-5"
              >
                {d.image ? (
                  <SplashDrink
                    src={d.image}
                    alt={d.name}
                    accent="#185c7c"
                    imgClassName="h-20 w-auto object-contain sm:h-24"
                  />
                ) : (
                  <ShotGlass />
                )}
                <div>
                  <p className="h-sign-med text-lg text-shell">{d.name}</p>
                  <p className="mt-0.5 text-xs leading-snug text-shell/60">
                    {d.note}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* The exclusives — the actual reason to show up. */}
          <div className="mt-10 rounded-3xl border border-gold/40 bg-gradient-to-br from-amethyst/25 to-abyss/60 p-7 sm:p-9">
            <Eyebrow>Never served · never on a menu</Eyebrow>
            <p className="mt-3 max-w-lg text-sm text-shell/75">
              Two pours built for this room only. After the 28th, nobody
              can order them anywhere.
            </p>
            <div className="mt-7 grid gap-7 sm:grid-cols-2">
              {secretDrinks.map((d) => (
                <div key={d.slug} className="flex items-center gap-5">
                  {d.image && (
                    <SplashDrink
                      src={d.image}
                      alt={d.name}
                      accent={d.accent}
                      imgClassName="h-28 w-auto object-contain sm:h-32"
                    />
                  )}
                  <div>
                    <h3 className="h-sign text-2xl text-gold sm:text-3xl">
                      {d.name}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-shell/45">
                      Recipe classified
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The night ────────────────────────────────────────── */}
      <section className="relative border-t border-shell/10 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <Eyebrow>Run of the night</Eyebrow>
          <h2 className="h-sign mt-4 text-5xl text-shell">
            A mansion under
            <br />
            <span className="text-gold">a full moon.</span>
          </h2>
          <ol className="mt-8 space-y-5">
            {RUN_OF_NIGHT.map((m) => (
              <li key={m.title} className="flex gap-5 sm:gap-8">
                <span className="w-20 shrink-0 pt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-gold sm:w-24">
                  {m.time}
                </span>
                <div className="border-l border-shell/15 pl-5 sm:pl-6">
                  <p className="h-sign-med text-xl text-shell">
                    {m.title}
                    {m.gated && (
                      <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 align-middle font-mono text-[9px] uppercase tracking-[0.16em] text-gold">
                        Meridian +
                      </span>
                    )}
                  </p>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-shell/70">
                    {m.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid gap-10 sm:grid-cols-[1.2fr_1fr]">
            <div>
              <Eyebrow>The room</Eyebrow>
              <p className="mt-4 max-w-md text-shell/75">
                Hand-picked, invite only, and capped on purpose. The
                people here are the ones shaping what Vegas drinks next.
                No lines, no wristbands, no strangers.
              </p>
            </div>
            <div className="self-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-shell/40">
                Your crew
              </p>
              <ul className="mt-4 space-y-4">
                {CREW.map((c) => (
                  <li
                    key={c.name}
                    className="border-l-2 border-gold/50 pl-4"
                  >
                    <p className="h-sign-med text-2xl text-shell">
                      {c.name}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/50">
                      {c.role}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tickets ──────────────────────────────────────────── */}
      <section
        id="tickets"
        className="relative border-t border-shell/10 px-6 py-16"
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
            Keep the password and the address between friends; the room
            is capped and the list is checked at the door.
          </p>
        </div>
      </section>
    </>
  );
}
