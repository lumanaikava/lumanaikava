"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import SmsConsent from "@/components/SmsConsent";
import { eventPackages, experienceUpgrades } from "@/lib/packages";
import { eventImages } from "@/lib/images";

/**
 * Build an experience — the booking flow.
 *
 * No prices. Every event is quoted after a conversation, so showing a
 * number here either anchors the wrong figure or forces a fake one.
 * The customer assembles what they want, tells us about it, and we call
 * them.
 *
 * One page, no jumping. The old version had a Book button that scrolled
 * to a form sitting directly underneath it, which read as a bug. The
 * form is simply the last thing you reach.
 */

const EXPERIENCES = [
  {
    name: "Kava Ceremony",
    blurb: "Guided, story-driven, and slow. The full ritual.",
    image: eventImages.bartenderPair,
  },
  {
    name: "Open Bar",
    blurb: "Unlimited craft pours all night, no tabs.",
    image: eventImages.pouring,
  },
  {
    name: "Drink + Shot",
    blurb: "One craft drink and one traditional shot per guest.",
    image: eventImages.drinkClose,
  },
  {
    name: "Paid Bar",
    blurb: "We bring the bar, guests buy their own.",
    image: eventImages.boothSignage,
  },
] as const;

const GUEST_BANDS = ["Under 25", "25–50", "50–100", "100–200", "200+"];

const INCLUDED = [
  "Full bar setup",
  "Trained kava bartenders",
  "A menu written for your event",
  "Glassware, ice, garnishes",
  "NA spirits for mixed crowds",
];

export default function ExperienceBuilder() {
  const [experience, setExperience] = useState<string>(EXPERIENCES[1].name);
  const [guests, setGuests] = useState<string>(GUEST_BANDS[1]);
  const [upgrades, setUpgrades] = useState<Set<string>>(new Set());
  const [smsConsent, setSmsConsent] = useState(false);
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "busy" } | { kind: "sent" } | { kind: "error"; msg: string }
  >({ kind: "idle" });

  const toggleUpgrade = (name: string) =>
    setUpgrades((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  /** What we tell ourselves about this lead, assembled from the choices. */
  const summary = useMemo(() => {
    const lines = [
      `Experience: ${experience}`,
      `Guests: ${guests}`,
      upgrades.size
        ? `Upgrades: ${[...upgrades].join(", ")}`
        : "Upgrades: none selected",
    ];
    return lines.join("\n");
  }, [experience, guests, upgrades]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const phone = String(f.get("phone") ?? "").trim();

    if (smsConsent && phone.replace(/\D/g, "").length < 10) {
      setStatus({
        kind: "error",
        msg: "Add a mobile number, or untick the text-message box.",
      });
      return;
    }

    setStatus({ kind: "busy" });
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          phone,
          date: f.get("date"),
          city: f.get("city"),
          guests,
          smsConsent: smsConsent ? "yes" : "",
          message: `${summary}\n\n${String(f.get("message") ?? "").trim()}`,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't send that.");
      }
      setStatus({ kind: "sent" });
    } catch (err) {
      setStatus({
        kind: "error",
        msg: err instanceof Error ? err.message : "Couldn't send that.",
      });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="ether-in mx-auto max-w-xl py-10 sm:py-16 text-center">
        <div className="ether-pulse mx-auto h-20 w-20 rounded-full border border-gold/50" />
        <h2 className="h-sign mt-8 text-4xl text-shell sm:text-5xl">
          We&apos;ve got it.
        </h2>
        <p className="mt-4 text-shell/70">
          Ash or Zach will reach out personally — usually within a day — to
          talk through what you&apos;re imagining and put real numbers to
          it. Nothing is locked in until you say so.
        </p>
      </div>
    );
  }

  const field =
    "mt-2 w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-3 text-shell outline-none transition-colors focus:border-gold";
  const label =
    "font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50";

  return (
    <form onSubmit={submit} className="space-y-10 sm:space-y-14">
      {/* 1 — the experience */}
      <section className="ether-in">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
          01 — The experience
        </p>
        <h2 className="h-sign mt-3 text-3xl text-shell sm:text-4xl">
          What kind of night is it?
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {EXPERIENCES.map((x) => {
            const active = experience === x.name;
            return (
              <label
                key={x.name}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-500 ${
                  active
                    ? "border-gold shadow-[0_0_28px_-6px_rgba(237,226,180,0.45)]"
                    : "border-shell/15 hover:border-shell/40"
                }`}
              >
                <input
                  type="radio"
                  name="experience"
                  checked={active}
                  onChange={() => setExperience(x.name)}
                  className="sr-only"
                />
                {/* The photo IS the button — no separate gallery above. */}
                <Image
                  src={x.image}
                  alt=""
                  width={600}
                  height={800}
                  className={`h-32 w-full object-cover transition-all duration-700 sm:h-44 ${
                    active
                      ? "scale-105 opacity-70"
                      : "opacity-35 group-hover:opacity-55"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-left sm:p-4">
                  <p
                    className={`h-sign-med text-lg transition-colors sm:text-xl ${
                      active ? "text-gold" : "text-shell"
                    }`}
                  >
                    {x.name}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-shell/65">
                    {x.blurb}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* 2 — size */}
      <section className="ether-in">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
          02 — The room
        </p>
        <h2 className="h-sign mt-3 text-3xl text-shell sm:text-4xl">
          How many people?
        </h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {GUEST_BANDS.map((g) => {
            const active = guests === g;
            return (
              <label
                key={g}
                className={`cursor-pointer rounded-full border px-6 py-2.5 text-sm transition-all duration-300 ${
                  active
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-shell/20 text-shell/70 hover:border-shell/45"
                }`}
              >
                <input
                  type="radio"
                  name="guests"
                  checked={active}
                  onChange={() => setGuests(g)}
                  className="sr-only"
                />
                {g}
              </label>
            );
          })}
        </div>
      </section>

      {/* 3 — upgrades */}
      <section className="ether-in">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
          03 — Go deeper
        </p>
        <h2 className="h-sign mt-3 text-3xl text-shell sm:text-4xl">
          Anything to add?
        </h2>
        <p className="mt-2 max-w-lg text-sm text-shell/55">
          Optional functional add-ons. Pick what sounds right — we&apos;ll
          talk through what actually suits your crowd.
        </p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
          {experienceUpgrades.map((u) => {
            const active = upgrades.has(u.name);
            return (
              <label
                key={u.name}
                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 sm:p-5 ${
                  active
                    ? "border-gold bg-gold/[0.07]"
                    : "border-shell/15 bg-lagoon/20 hover:border-shell/35"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleUpgrade(u.name)}
                  className="sr-only"
                />
                <p
                  className={`h-sign-med text-lg transition-colors ${
                    active ? "text-gold" : "text-shell"
                  }`}
                >
                  {u.name}
                </p>
                <ul className="mt-2 space-y-1">
                  {u.items.map((i) => (
                    <li key={i.name} className="text-xs leading-snug text-shell/55">
                      {i.name}
                    </li>
                  ))}
                </ul>
              </label>
            );
          })}
        </div>
      </section>

      {/* 4 — the conversation */}
      <section className="ether-in relative overflow-hidden rounded-3xl border border-shell/12 bg-lagoon/25 p-6 sm:p-9">
        <div className="ether-drift pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/[0.07] blur-3xl" />
        <div className="relative">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
            04 — Tell us about it
          </p>
          <h2 className="h-sign mt-3 text-3xl text-shell sm:text-4xl">
            Then we&apos;ll talk.
          </h2>
          <p className="mt-2 max-w-lg text-sm text-shell/55">
            No quote here on purpose — every event is different and we&apos;d
            rather price it properly after hearing what you want.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-5">
            <label className="col-span-2 block sm:col-span-1">
              <span className={label}>Your name</span>
              <input name="name" required className={field} />
            </label>
            <label className="col-span-2 block sm:col-span-1">
              <span className={label}>Email</span>
              <input name="email" type="email" required className={field} />
            </label>
            <label className="block">
              <span className={label}>Mobile</span>
              <input name="phone" type="tel" className={field} />
            </label>
            <label className="block">
              <span className={label}>Event date</span>
              <input name="date" type="date" className={field} />
            </label>
            <label className="col-span-2 block">
              <span className={label}>Where</span>
              <input
                name="city"
                placeholder="Venue or neighbourhood"
                className={field}
              />
            </label>
            <label className="col-span-2 block">
              <span className={label}>What are you imagining?</span>
              <textarea name="message" rows={3} className={`${field} resize-y`} />
            </label>
          </div>

          <div className="mt-5">
            <SmsConsent
              checked={smsConsent}
              onChange={setSmsConsent}
              note="Optional — we'll reply either way."
            />
          </div>

          {/* What we're sending, shown plainly rather than hidden. */}
          <div className="mt-6 rounded-2xl border border-shell/10 bg-abyss/40 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/40">
              Your build
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-shell/75">
              {summary}
            </p>
          </div>

          {status.kind === "error" && (
            <p className="mt-4 text-sm text-coconut">{status.msg}</p>
          )}

          <button
            type="submit"
            disabled={status.kind === "busy"}
            className="btn-brush ether-glow mt-7 font-mono text-sm font-bold uppercase tracking-[0.2em] text-shell disabled:opacity-60"
            style={{ "--brush-bg": "var(--amethyst)" } as React.CSSProperties}
          >
            {status.kind === "busy" ? "Sending…" : "Send it over"}
          </button>
        </div>
      </section>

      <p className="text-center text-xs text-shell/35">
        Every event includes {INCLUDED.join(" · ").toLowerCase()}.
      </p>
    </form>
  );
}
