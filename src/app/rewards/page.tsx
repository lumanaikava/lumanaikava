import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coconut Rewards — Lumanai Kava",
  description:
    "Earn coconuts every time you order or book. Redeem for free shots, drinks, growlers, and event bartending credit.",
};

const earn = [
  { label: "$1 spent", value: "1 coconut" },
  { label: "Attend a Lumanai event", value: "5 coconuts" },
  { label: "Refer a friend who books us", value: "50 coconuts" },
  { label: "Post a story tagging @lumanaikava", value: "10 coconuts" },
];

const redeem = [
  { threshold: 25, reward: "Free single kava shot" },
  { threshold: 60, reward: "Free naktail on the house" },
  { threshold: 120, reward: "Free growler with your next order" },
  { threshold: 250, reward: "10% off your next private booking" },
  {
    threshold: 500,
    reward: "Priority booking + a signature drink named after you",
  },
];

const rules = [
  "Coconuts don't expire as long as you order or attend within 12 months.",
  "One coconut redemption per order. Stack them however you like across visits.",
  "Rewards apply to Lumanai purchases only — not third-party marketplaces.",
  "We can move coconuts to a friend once per calendar year, just ask.",
];

export default function RewardsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 top-16 h-96 w-96 rounded-full bg-orchid/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-amethyst/30 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-32 text-center">
          <CoconutMark className="mx-auto h-16 w-16 text-coconut" />
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-gold">
            Coconut Rewards
          </p>
          <h1 className="h-sign mt-4 text-6xl text-shell sm:text-8xl">
            Collect coconuts.
            <span className="block text-orchid">Redeem for pours.</span>
          </h1>
          <p className="mt-6 text-lg text-shell/70">
            Every dollar and every event earns you coconuts. Stack them up and
            turn them into free shots, drinks, growlers, and — for the most
            loyal — private bartending credit.
          </p>
        </div>
      </section>

      {/* Earn */}
      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-orchid">
            How to earn
          </p>
          <h2 className="h-sign mt-4 text-4xl text-shell sm:text-5xl">
            Four ways to fill your bowl.
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {earn.map((e) => (
              <div
                key={e.label}
                className="flex items-center justify-between rounded-2xl border border-shell/10 bg-lagoon/40 p-6"
              >
                <p className="text-shell">{e.label}</p>
                <p className="font-mono text-sm text-gold">{e.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redeem ladder */}
      <section className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            The ladder
          </p>
          <h2 className="h-sign mt-4 text-4xl text-shell sm:text-5xl">
            What coconuts get you.
          </h2>

          <ol className="mt-10 space-y-4">
            {redeem.map((r, i) => (
              <li
                key={r.threshold}
                className="relative flex items-start gap-6 rounded-2xl border border-shell/10 bg-lagoon/30 p-6"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-abyss">
                  <CoconutMark className="h-8 w-8 text-coconut" />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                    Tier {i + 1} · {r.threshold} coconuts
                  </p>
                  <p className="mt-1 text-xl text-shell">{r.reward}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Rules */}
      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-orchid">
            The fine print
          </p>
          <h2 className="h-sign mt-4 text-4xl text-shell sm:text-5xl">
            Simple, no gotchas.
          </h2>
          <ul className="mt-8 space-y-4 text-shell/80">
            {rules.map((r) => (
              <li key={r} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl">Start collecting.</h2>
          <p className="mt-3 text-shell/70">
            Your coconut balance links to your email at checkout. First order
            gets you 5 coconuts on the house.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell"
            >
              Shop &amp; Earn
            </Link>
            <Link
              href="/events#book"
              className="rounded-full border border-shell/30 px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-shell hover:border-gold hover:text-gold"
            >
              Book &amp; Earn
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CoconutMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M20 50 Q35 20 50 50 T80 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <path
        d="M20 60 Q35 30 50 60 T80 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <circle cx="42" cy="42" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="55" cy="42" r="2" fill="currentColor" opacity="0.7" />
      <path
        d="M42 55 Q50 62 58 55"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
