import type { Metadata } from "next";
import QRCode from "qrcode";
import EventMark from "@/components/party/EventMark";
import { readTicket } from "@/lib/ticket-token";
import { tierFor } from "@/lib/party-tiers";
import AddToHome from "@/components/party/AddToHome";

/**
 * The guest's ticket. One page, one QR, works offline once loaded.
 *
 * Deliberately NOT a Wallet pass: a real .pkpass needs an Apple
 * Developer certificate. This does the job on any phone, screenshots
 * cleanly, and survives a driveway with no signal — which is the actual
 * requirement.
 *
 * The QR encodes the signed token, not a URL, so the scanner never
 * needs the network either.
 */

export const metadata: Metadata = {
  title: "Your ticket — Luna Ekliptika",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const ticket = readTicket(token);

  if (!ticket) {
    return (
      <div className="luna">
        <section className="relative flex min-h-[80svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
          <div className="luna-bg pointer-events-none absolute inset-0" aria-hidden />
          <div className="luna-roots" aria-hidden />
          <div className="relative">
            <EventMark className="mx-auto mb-7 h-20 w-20" sizes="80px" />
            <h1 className="h-sign text-4xl text-shell">Not a valid ticket.</h1>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-shell/55">
              This link is incomplete or wasn&rsquo;t issued by us. Check
              you copied the whole thing, or reply to your confirmation
              email and we&rsquo;ll send a fresh one.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const cfg = tierFor(ticket.tier);
  const accent = cfg?.accent ?? "#d4af6a";

  // Rendered server-side: the phone needs no JS to show its own ticket.
  const qr = await QRCode.toString(token, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#0b0b0c", light: "#ffffff" },
  });

  return (
    <div className="luna">
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 py-10">
        <div className="luna-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="luna-roots" aria-hidden />
        <div
          className="luna-grain pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
        />

        <div
          className="relative w-full max-w-sm overflow-hidden rounded-[26px] border bg-abyss/85 backdrop-blur"
          style={{ borderColor: `${accent}66` }}
        >
          <div className="luna-roots luna-roots--soft" aria-hidden />

          {/* Header */}
          <div className="relative px-7 pt-8 text-center">
            <EventMark className="mx-auto h-20 w-20" sizes="80px" priority />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-shell/45">
              Lumanai presents
            </p>
            <h1 className="h-sign mt-1.5 text-3xl leading-none text-shell">
              Luna <span className="text-gold">Ekliptika</span>
            </h1>
            <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-shell/45">
              Fri · Aug 28 · 7PM–1AM
            </p>
          </div>

          {/* Perforation */}
          <div className="relative mt-7 flex items-center" aria-hidden>
            <span className="h-5 w-5 -translate-x-1/2 rounded-full bg-abyss" />
            <span className="h-px flex-1 border-t border-dashed border-shell/25" />
            <span className="h-5 w-5 translate-x-1/2 rounded-full bg-abyss" />
          </div>

          {/* The QR — white plate, because scanners need contrast */}
          <div className="relative px-7 pt-6">
            <div className="mx-auto w-fit rounded-2xl bg-white p-3.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.8)]">
              <div
                className="h-[190px] w-[190px] [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qr }}
              />
            </div>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-shell/35">
              Show this at the door
            </p>
          </div>

          {/* Who */}
          <div className="relative mt-6 px-7 pb-8 text-center">
            <p className="h-sign text-2xl leading-tight text-shell">
              {ticket.name}
            </p>
            <p
              className="mt-1 font-mono text-[11px] uppercase tracking-[0.28em]"
              style={{ color: accent }}
            >
              {cfg?.label ?? ticket.tier}
              {ticket.seats > 1 && ` · admits ${ticket.seats}`}
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-shell/30">
              {ticket.order}
            </p>
          </div>
        </div>

        <AddToHome />

        <p className="relative mt-6 max-w-xs text-center text-[11px] leading-relaxed text-shell/35">
          Screenshot this — the driveway has no signal. Whites, off-whites
          and kava colors; linens preferred. 21+.
        </p>
      </section>
    </div>
  );
}
