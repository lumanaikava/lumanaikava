"use client";

import { useState } from "react";
import SmsConsent from "@/components/SmsConsent";
import Waiver, { WAIVER_TEXT } from "@/components/party/Waiver";
import { tierFor } from "@/lib/party-tiers";

export type Tier = {
  variantId: string;
  /** Shopify variant title — "General Admission", "VIP", … */
  title: string;
  priceLabel: string;
  available: boolean;
};

/** Fallback for a variant with no tier config — better than a blank card. */
const GENERIC_PERKS = [
  "Entry to LUNA EKLIPTIKA",
  "Complimentary anti-inflammatory hors d'oeuvres all night",
];

function perksFor(title: string): string[] {
  return tierFor(title)?.perks ?? GENERIC_PERKS;
}

/** The tier's display name, falling back to whatever Shopify calls it. */
function labelFor(title: string): string {
  return tierFor(title)?.label ?? title;
}

export default function BuyTicket({ tiers }: { tiers: Tier[] }) {
  const firstAvailable = tiers.find((t) => t.available) ?? tiers[0];
  const [selected, setSelected] = useState(firstAvailable?.variantId ?? "");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // SMS opt-in, captured here rather than at Shopify's checkout so the
  // consent lands in our CRM with our exact wording — and so a number is
  // only ever asked for when someone actually wants texts.
  const [smsConsent, setSmsConsent] = useState(false);
  const [smsName, setSmsName] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  // Ash: password + waiver are what make this defensible legally.
  const [waiver, setWaiver] = useState(false);

  const digits = smsPhone.replace(/\D/g, "").length;
  const phoneLooksReal = digits >= 10;

  const tier = tiers.find((t) => t.variantId === selected) ?? firstAvailable;
  // A single-variant product doesn't need a chooser — Shopify names that
  // lone variant "Default Title", which should never reach a guest's eyes.
  const showTiers = tiers.length > 1;

  async function buy() {
    if (!tier) return;

    if (!waiver) {
      setError("Please read and accept the acknowledgement to continue.");
      return;
    }

    // A ticked box with no number isn't permission to anything — stop
    // here rather than recording a consent we can't act on.
    if (smsConsent && !phoneLooksReal) {
      setError("Add a mobile number, or untick the text-message box.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: tier.variantId,
          quantity: qty,
          // Names the moment for the consent record — the shop checkout
          // files the same opt-in under different wording.
          context: "ticket",
          // Recorded with the order so the acceptance has a timestamp
          // and the exact text agreed to, not just a ticked box.
          waiverAccepted: true,
          waiverText: WAIVER_TEXT,
          ...(smsConsent && phoneLooksReal
            ? { smsConsent: "yes", name: smsName.trim(), phone: smsPhone.trim() }
            : {}),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.checkoutUrl) {
        throw new Error(body.error ?? "Checkout is unavailable right now.");
      }
      window.location.href = body.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (!tier) return null;

  return (
    <div className="flex flex-col gap-6">
      {showTiers && (
        <fieldset className="space-y-3">
          <legend className="sr-only">Choose your ticket</legend>
          {tiers.map((t) => {
            const active = t.variantId === tier.variantId;
            const cfg = tierFor(t.title);
            return (
              <label
                key={t.variantId}
                data-flourish={cfg?.flourish ?? 0}
                style={
                  { "--tier": cfg?.accent ?? "#d4af6a" } as React.CSSProperties
                }
                className={`tier-card relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-5 text-left transition sm:flex-row sm:items-start sm:gap-6 ${
                  active
                    ? "tier-card--on border-gold"
                    : "border-shell/15 bg-abyss/40 hover:border-shell/35"
                } ${t.available ? "" : "cursor-not-allowed opacity-45"}`}
              >
                {/* Corner marks earn their way in as the tier climbs. */}
                {(cfg?.flourish ?? 0) >= 2 && (
                  <>
                    <span aria-hidden className="tier-corner tier-corner--tl" />
                    <span aria-hidden className="tier-corner tier-corner--br" />
                  </>
                )}
                <input
                  type="radio"
                  name="tier"
                  value={t.variantId}
                  checked={active}
                  disabled={!t.available}
                  onChange={() => setSelected(t.variantId)}
                  className="sr-only"
                />

                <div className="sm:w-48 sm:shrink-0">
                  <span
                    className="h-sign block text-2xl"
                    style={{ color: cfg?.accent ?? "var(--shell)" }}
                  >
                    {labelFor(t.title)}
                  </span>
                  <span
                    aria-hidden
                    className="mt-1 block h-px w-9 rounded-full"
                    style={{ background: cfg?.accent ?? "var(--gold)", opacity: 0.7 }}
                  />
                  <span className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="font-mono text-xl font-bold text-gold">
                      {t.priceLabel}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-shell/40">
                      donation
                    </span>
                  </span>
                  {cfg?.vipReception && (
                    <span className="mt-1.5 inline-block rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-gold">
                      VIP Reception 7–8PM
                    </span>
                  )}
                  {cfg?.note && (
                    <span className="mt-1 block text-[11px] italic leading-snug text-shell/45">
                      {cfg.note}
                    </span>
                  )}
                  {!t.available && (
                    <span className="mt-1.5 inline-block rounded-full bg-shell/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-coconut">
                      Sold out
                    </span>
                  )}
                </div>

                <ul className="flex-1 space-y-1">
                  {perksFor(t.title).map((p) => (
                    <li key={p} className="text-xs leading-relaxed text-shell/70">
                      <span
                        aria-hidden
                        className="mr-1.5"
                        style={{ color: cfg?.accent ?? "var(--gold)" }}
                      >
                        ·
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>

                {/* The selected tier needs to be obvious at a glance when
                    five of them are stacked. */}
                <span
                  aria-hidden
                  className="absolute right-4 top-4 h-3 w-3 rounded-full border transition"
                  style={
                    active
                      ? {
                          borderColor: cfg?.accent ?? "var(--gold)",
                          background: cfg?.accent ?? "var(--gold)",
                        }
                      : undefined
                  }
                />
              </label>
            );
          })}
        </fieldset>
      )}

      {/* One ticket, one price — say what it buys instead of showing a
          chooser with nothing to choose. */}
      {!showTiers && (
        <div className="text-center">
          <p className="h-sign text-3xl text-shell">{labelFor(tier.title)}</p>
          <p className="h-sign mt-1 text-5xl text-gold">{tier.priceLabel}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/40">
            donation
          </p>
          <ul className="mt-4 inline-flex flex-col gap-1.5 text-left">
            {perksFor(tier.title).map((p: string) => (
              <li key={p} className="text-sm text-shell/75">
                <span aria-hidden className="mr-2 text-gold">
                  ·
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4">
        <label
          htmlFor="ticket-qty"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50"
        >
          Quantity
        </label>
        <select
          id="ticket-qty"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="rounded-full border border-shell/25 bg-abyss/60 px-4 py-2 text-shell outline-none focus:border-gold"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* SMS opt-in. Unchecked, optional, and it only asks for a number
          once someone actually wants texts — no dead fields otherwise. */}
      <div className="space-y-3 text-left">
        <SmsConsent
          checked={smsConsent}
          onChange={setSmsConsent}
          note="Optional — your ticket is the same either way."
        />
        {smsConsent && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/50">
                Your name
              </span>
              <input
                value={smsName}
                onChange={(e) => setSmsName(e.target.value)}
                autoComplete="name"
                className="mt-1.5 w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-2.5 text-sm text-shell outline-none focus:border-gold"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/50">
                Mobile number
              </span>
              <input
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(702) 555-0123"
                aria-invalid={smsPhone.length > 0 && !phoneLooksReal}
                className="mt-1.5 w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-2.5 text-sm text-shell outline-none placeholder:text-shell/30 focus:border-gold"
              />
            </label>
          </div>
        )}
      </div>

      <Waiver checked={waiver} onChange={setWaiver} />

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={buy}
          disabled={busy || !tier.available || !waiver}
          className="btn-brush font-mono text-sm font-bold uppercase tracking-[0.2em] text-shell disabled:cursor-not-allowed disabled:opacity-45"
          style={{ "--brush-bg": "var(--amethyst)" } as React.CSSProperties}
        >
          {busy
            ? "Opening checkout..."
            : !tier.available
              ? "Sold out"
              : `Secure ${qty > 1 ? `${qty} spots` : "your spot"}${
                  // The price already sits above a lone tier — only repeat
                  // it when a chooser makes "which price?" a real question.
                  showTiers ? ` · ${tier.priceLabel}` : ""
                }`}
        </button>
        {error && <p className="text-sm text-coconut">{error}</p>}
      </div>
    </div>
  );
}
