import type { Metadata } from "next";
import { cookies } from "next/headers";
import PartyGate from "@/components/party/PartyGate";
import BuyTicket from "@/components/party/BuyTicket";
import { getProductByHandle, formatPrice } from "@/lib/integrations/shopify";
import { PARTY_TICKET_HANDLE } from "@/lib/catalog";

/**
 * The exclusive Aug 28 kava party — invite only. This page is never
 * linked in the nav; the URL travels by word of mouth with the
 * password. Ticket = a physical ticket mailed to you (Shopify checkout
 * collects the shipping address).
 */

export const metadata: Metadata = {
  title: "Invited",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function InvitedPage() {
  const jar = await cookies();
  const invited =
    !!process.env.PARTY_PASSCODE &&
    jar.get("lumanai_invited")?.value === process.env.PARTY_PASSCODE;

  if (!invited) {
    return (
      <section className="relative flex min-h-[80svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url(/images/roots-hero.webp)" }}
          aria-hidden
        />
        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            08 · 28 · Las Vegas
          </p>
          <h1 className="h-sign mt-4 text-6xl text-shell sm:text-7xl">
            Invite <span className="text-coconut">only.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-shell/70">
            If you're supposed to be here, you already know the word.
          </p>
          <PartyGate />
        </div>
      </section>
    );
  }

  // Ticket product — lives in Shopify, hidden from the shop.
  let ticket: {
    variantId: string;
    priceLabel: string;
    available: boolean;
  } | null = null;
  try {
    const p = await getProductByHandle(PARTY_TICKET_HANDLE);
    const variant =
      p?.variants.edges.find((v) => v.node.availableForSale)?.node ??
      p?.variants.edges[0]?.node;
    if (p && variant) {
      ticket = {
        variantId: variant.id,
        priceLabel: formatPrice(
          p.priceRange.minVariantPrice.amount,
          p.priceRange.minVariantPrice.currencyCode,
        ),
        available: p.availableForSale,
      };
    }
  } catch {
    /* Shopify unreachable — page still renders, buy button waits. */
  }

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url(/images/roots-hero.webp)" }}
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-[85svh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
          You're on the list
        </p>
        <h1 className="h-sign mt-4 text-6xl text-shell sm:text-8xl">
          August <span className="text-coconut">28.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-shell/85">
          One night. The full Lumanai bar, uncut — new naktails that
          haven't touched a menu, the crew pouring until late, and a
          room full of people who found the password.
        </p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
          Las Vegas · location revealed to ticket holders
        </p>

        <div className="mt-10 w-full max-w-md rounded-3xl border border-gold/40 bg-abyss/60 p-8 backdrop-blur">
          {ticket ? (
            ticket.available ? (
              <>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                  Your ticket comes in the mail
                </p>
                <p className="mt-3 text-sm text-shell/70">
                  A real, physical ticket — mailed to your door. That's
                  your key in. Checkout collects your shipping address.
                </p>
                <div className="mt-6">
                  <BuyTicket
                    variantId={ticket.variantId}
                    priceLabel={ticket.priceLabel}
                  />
                </div>
                <p className="mt-6 text-xs text-shell/55">
                  Friends of the bar: code{" "}
                  <span className="font-mono font-bold text-coconut">
                    BULAFRIENDS
                  </span>{" "}
                  takes 35% off at checkout.
                </p>
              </>
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
            )
          ) : (
            <p className="text-shell/75">
              Tickets drop here any minute — keep this page close.
            </p>
          )}
        </div>

        <p className="mt-8 max-w-md text-xs text-shell/45">
          Keep the password between friends. 21+ vibes, zero booze —
          everyone drives home sharp.
        </p>
      </div>
    </section>
  );
}
