"use client";

import { useMemo, useRef, useState } from "react";
import BookingForm from "./BookingForm";
import Ripple from "./Ripple";
import {
  eventPackages,
  experienceUpgrades,
  upgradeBundle,
} from "@/lib/packages";

const shortNames = [
  "Kava Ceremony",
  "Full Open Bar",
  "Drink + Shot",
  "Paid Bar",
];

const packageBlurbs = [
  "The guided, story-driven luxury experience",
  "Unlimited pours all night",
  "One drink + one shot per guest",
  "We show up, guests buy their own",
];

function money(n: number) {
  return n === 0 ? "Free to host" : `$${n.toLocaleString("en-US")}`;
}

export default function EventBuilder() {
  const [pkgIdx, setPkgIdx] = useState(1); // Full Open Bar preselected
  const [tierIdx, setTierIdx] = useState(0);
  const [upgrades, setUpgrades] = useState<Set<number>>(new Set());
  const [prefill, setPrefill] = useState<string | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  const pkg = eventPackages[pkgIdx];
  const tier = pkg.tiers[Math.min(tierIdx, pkg.tiers.length - 1)];
  const allUpgrades = upgrades.size === experienceUpgrades.length;

  const upgradesTotal = allUpgrades
    ? upgradeBundle.amount
    : [...upgrades].reduce((sum, i) => sum + experienceUpgrades[i].amount, 0);
  const upgradesSaved = allUpgrades
    ? [...upgrades].reduce((s, i) => s + experienceUpgrades[i].amount, 0) -
      upgradeBundle.amount
    : 0;
  const total = tier.amount + upgradesTotal;

  const summary = useMemo(() => {
    const lines = [
      `Package: ${pkg.name} (${tier.guests} — ${tier.price})`,
      ...(upgrades.size
        ? [
            `Upgrades: ${
              allUpgrades
                ? `Complete Upgrade Bundle (${upgradeBundle.price})`
                : [...upgrades]
                    .map(
                      (i) =>
                        `${experienceUpgrades[i].name} (${experienceUpgrades[i].price})`
                    )
                    .join(", ")
            }`,
          ]
        : []),
      `Estimated total: ${money(total)}`,
      "",
      "Venue / date / vibe: ",
    ];
    return lines.join("\n");
  }, [pkg, tier, upgrades, allUpgrades, total]);

  function toggleUpgrade(i: number) {
    setUpgrades((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function lockItIn() {
    setPrefill(summary);
    // Let React paint the prefilled form before scrolling to it.
    requestAnimationFrame(() =>
      bookRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: the three choices */}
        <div className="space-y-10">
          {/* 01 · Experience */}
          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">
              01 · Pick your experience
            </legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {eventPackages.map((p, i) => {
                const active = i === pkgIdx;
                return (
                  <button
                    key={p.number}
                    type="button"
                    onClick={() => {
                      setPkgIdx(i);
                      setTierIdx(0);
                    }}
                    aria-pressed={active}
                    className={`rounded-2xl border p-5 text-left transition-all ${
                      active
                        ? "border-gold bg-violet/40 shadow-[0_0_30px_rgba(237,226,180,0.15)]"
                        : "border-shell/15 bg-lagoon/30 hover:border-shell/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="h-sign-med text-xl text-shell">
                        {shortNames[i]}
                      </span>
                      {active && (
                        <Ripple
                          className="h-5 w-5 text-gold"
                          rings={3}
                          animated={false}
                        />
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-shell/60">
                      {packageBlurbs[i]}
                    </p>
                    <p className="mt-3 font-mono text-xs text-gold">
                      {p.tiers[0].amount === 0
                        ? "Free to host"
                        : `from ${p.tiers[0].price}`}
                    </p>
                  </button>
                );
              })}
            </div>
            {/* Selected package details */}
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
              {pkg.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-xs text-shell/65"
                >
                  <span className="h-1 w-1 rounded-full bg-orchid" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </fieldset>

          {/* 02 · Guests */}
          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">
              02 · How many guests?
            </legend>
            <div className="mt-4 flex flex-wrap gap-3">
              {pkg.tiers.map((t, i) => {
                const active = i === Math.min(tierIdx, pkg.tiers.length - 1);
                return (
                  <button
                    key={t.guests}
                    type="button"
                    onClick={() => setTierIdx(i)}
                    aria-pressed={active}
                    className={`rounded-full border px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] transition-all ${
                      active
                        ? "border-gold bg-gold text-abyss"
                        : "border-shell/20 text-shell/75 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {t.guests}
                    <span className="ml-2 opacity-70">{t.price}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* 03 · Upgrades */}
          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">
              03 · Tune the bar to your crowd{" "}
              <span className="text-shell/40">(optional)</span>
            </legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {experienceUpgrades.map((u, i) => {
                const active = upgrades.has(i);
                return (
                  <button
                    key={u.name}
                    type="button"
                    onClick={() => toggleUpgrade(i)}
                    aria-pressed={active}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? "border-orchid bg-violet/40"
                        : "border-shell/15 bg-lagoon/30 hover:border-shell/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="h-sign-med text-base text-shell">
                        {u.name}
                      </span>
                      <span
                        className={`font-mono text-xs ${active ? "text-orchid" : "text-gold"}`}
                      >
                        {active ? "Added ✓" : `+${u.price}`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-shell/55">
                      {u.items.map((x) => x.name).join(" · ")}
                    </p>
                  </button>
                );
              })}
            </div>
            <p
              className={`mt-3 font-mono text-[11px] uppercase tracking-[0.18em] ${
                allUpgrades ? "text-gold" : "text-shell/40"
              }`}
            >
              {allUpgrades
                ? `Complete bundle applied — you save $${upgradesSaved}`
                : `Add all four → ${upgradeBundle.price} bundle (save $200)`}
            </p>
          </fieldset>
        </div>

        {/* Right: sticky live quote */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-abyss p-8">
            <div
              className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: "url(/images/roots-texture.webp)" }}
              aria-hidden
            />
            <div className="relative">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">
                Your event
              </p>
              <h3 className="h-sign-med mt-3 text-2xl text-shell">
                {pkg.name}
              </h3>
              <dl className="mt-6 space-y-3 border-t border-shell/15 pt-5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-shell/60">{tier.guests}</dt>
                  <dd className="font-mono text-shell">{tier.price}</dd>
                </div>
                {[...upgrades].map((i) => (
                  <div key={i} className="flex justify-between gap-4">
                    <dt className="text-shell/60">
                      {experienceUpgrades[i].name}
                    </dt>
                    <dd className="font-mono text-shell">
                      +{experienceUpgrades[i].price}
                    </dd>
                  </div>
                ))}
                {allUpgrades && (
                  <div className="flex justify-between gap-4 text-gold">
                    <dt>Bundle discount</dt>
                    <dd className="font-mono">−${upgradesSaved}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-6 flex items-baseline justify-between border-t border-gold/30 pt-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/60">
                  Estimated total
                </p>
                <p className="h-sign text-4xl text-gold">{money(total)}</p>
              </div>
              <p className="mt-3 text-xs text-shell/45">
                Las Vegas metro pricing. Final quote may vary with duration
                and customization.
              </p>
              <button
                type="button"
                onClick={lockItIn}
                className="mt-6 w-full rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss transition-colors hover:bg-shell"
              >
                Lock It In → Get a Real Quote
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Booking form, prefilled by the builder */}
      <div ref={bookRef} id="book" className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-20 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
              Almost there
            </p>
            <h2 className="h-sign mt-4 text-5xl text-shell sm:text-6xl">
              Tell us about your night.
            </h2>
            <p className="mt-5 text-shell/70">
              {prefill
                ? "Your build is loaded below — add the venue, date, and vibe, and we'll confirm the real number within 24 hours."
                : "Build your event above, or just write to us directly."}
            </p>
            <div className="mt-8 space-y-3 text-shell/70">
              <p>
                <a
                  href="mailto:lumanai.events@gmail.com"
                  className="prose-link text-shell hover:text-gold"
                >
                  lumanai.events@gmail.com
                </a>
              </p>
              <p>
                <a
                  href="tel:+17026260858"
                  className="prose-link text-shell hover:text-gold"
                >
                  (702) 626-0858
                </a>{" "}
                <span className="text-shell/40">· call or text</span>
              </p>
            </div>
          </div>
          <BookingForm key={prefill ?? "blank"} prefill={prefill ?? undefined} />
        </div>
      </div>
    </>
  );
}
