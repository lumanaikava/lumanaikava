"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";

/**
 * The Lumanai hero: logo, slogan, and the archipelago in one viewport.
 * Destinations are distant islands on a moonlit horizon — layered
 * silhouettes with atmospheric haze and water reflections. Hover: the
 * island catches the light. Click: a golden ripple transports you.
 */

type IslandDef = {
  href: string;
  name: string;
  tagline: string;
  /** Turbulence seed — gives each ink stroke its own ragged character. */
  seed: number;
  /** Stroke thickness above the waterline. */
  h: number;
  /** Relative width on the horizon row. */
  width: string;
  delay: string;
  /** Fogged teaser island — anchors to the waitlist instead of sailing. */
  uncharted?: boolean;
};

const islands: IslandDef[] = [
  {
    href: "/events",
    name: "The Bar",
    tagline: "Build your event",
    seed: 7,
    h: 44,
    width: "lg:w-[17%]",
    delay: "0s",
  },
  {
    href: "/menu",
    name: "Naktail Cove",
    tagline: "What's pouring",
    seed: 23,
    h: 30,
    width: "lg:w-[13%]",
    delay: "1.4s",
  },
  {
    href: "/products",
    name: "Trading Post",
    tagline: "Shop RUSH + bottles",
    seed: 41,
    h: 38,
    width: "lg:w-[15%]",
    delay: "0.8s",
  },
  {
    href: "/find-us",
    name: "The Lagoon",
    tagline: "Find us this weekend",
    seed: 59,
    h: 26,
    width: "lg:w-[13%]",
    delay: "2.2s",
  },
  {
    href: "/ingredients",
    name: "The Grove",
    tagline: "What's inside",
    seed: 3,
    h: 42,
    width: "lg:w-[16%]",
    delay: "1.1s",
  },
  {
    href: "/rewards",
    name: "Coconut Cove",
    tagline: "Earn coconuts",
    seed: 31,
    h: 24,
    width: "lg:w-[12%]",
    delay: "2.8s",
  },
  {
    href: "#waitlist",
    name: "The Lounge",
    tagline: "Las Vegas · soon",
    seed: 77,
    h: 28,
    width: "lg:w-[12%]",
    delay: "3.4s",
    uncharted: true,
  },
];

const stars = Array.from({ length: 42 }, (_, i) => {
  const x = ((i * 73) % 97) / 97;
  const y = ((i * 41) % 89) / 89;
  const s = 1 + ((i * 29) % 2);
  const d = ((i * 53) % 40) / 10;
  return { left: `${x * 100}%`, top: `${y * 52}%`, size: s, delay: `${d}s` };
});

/** Sumi-e ink-stroke island: ragged brush slab, moonlit rim, reflection. */
function IslandSvg({ id, seed, h }: { id: string; seed: number; h: number }) {
  const top = 100 - h;
  return (
    <svg viewBox="0 0 200 150" className="w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a3585" />
          <stop offset="60%" stopColor="#221c4e" />
          <stop offset="100%" stopColor="#0a0f2e" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ede2b4" stopOpacity="0" />
          <stop offset="60%" stopColor="#ede2b4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e8d5a6" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`${id}-refl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a3585" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#4a3585" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-rough`} x="-20%" y="-60%" width="140%" height="220%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.07"
            numOctaves="4"
            seed={seed}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="15" />
        </filter>
        <filter id={`${id}-fine`} x="-30%" y="-120%" width="160%" height="340%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.055 0.16"
            numOctaves="3"
            seed={seed + 13}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
        </filter>
        <filter id={`${id}-blur`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* ink slab body */}
      <rect
        x="14"
        y={top}
        width="172"
        height={h}
        rx={Math.min(h * 0.42, 16)}
        fill={`url(#${id}-body)`}
        filter={`url(#${id}-rough)`}
      />
      {/* dry-brush tails past the stroke ends */}
      <rect x="2" y={top + h * 0.55} width="34" height="5" rx="2.5" fill="#2b2160" opacity="0.7" filter={`url(#${id}-fine)`} />
      <rect x="166" y={top + h * 0.35} width="32" height="4" rx="2" fill="#2b2160" opacity="0.7" filter={`url(#${id}-fine)`} />
      {/* moonlit rim along the top edge */}
      <rect
        x="20"
        y={top - 1}
        width="162"
        height="5"
        rx="2.5"
        fill={`url(#${id}-rim)`}
        filter={`url(#${id}-fine)`}
      />
      {/* reflection below the waterline */}
      <g transform={`translate(0 ${204 + h * 0.9}) scale(1 -0.42)`}>
        <rect
          x="18"
          y={top}
          width="164"
          height={h}
          rx={Math.min(h * 0.42, 16)}
          fill={`url(#${id}-refl)`}
          filter={`url(#${id}-blur)`}
        />
      </g>
      {/* waterline glint */}
      <line
        x1="8"
        y1="101"
        x2="192"
        y2="101"
        stroke="#ede2b4"
        strokeWidth="0.5"
        opacity="0.22"
      />
    </svg>
  );
}

export default function Archipelago({
  nextEvents,
}: {
  nextEvents: { date: string; label: string }[];
}) {
  const router = useRouter();
  const [transport, setTransport] = useState<{ x: number; y: number } | null>(
    null,
  );

  function sail(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    setTransport({ x: e.clientX, y: e.clientY });
    window.setTimeout(() => router.push(href), 480);
  }

  return (
    <section
      aria-label="Lumanai — explore the site"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* Night sky over the roots pattern */}
      <div
        className="hero-roots pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url(/images/roots-hero.webp)" }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-abyss/85 via-ocean/75 to-abyss/90" />
      {stars.map((s, i) => (
        <span
          key={i}
          className="star pointer-events-none absolute rounded-full bg-shell"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            opacity: 0.28,
          }}
          aria-hidden
        />
      ))}
      {/* Moon */}
      <div
        className="pointer-events-none absolute right-[10%] top-[7%] h-20 w-20 rounded-full bg-gold/80 shadow-[0_0_100px_44px_rgba(237,226,180,0.18)]"
        aria-hidden
      />

      {/* Logo + slogan + CTAs */}
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-16 text-center lg:pt-20">
        <Image
          src="/lumanai-wordmark.svg"
          alt="LUMANAI"
          width={420}
          height={170}
          priority
          className="h-auto w-[60vw] max-w-[420px]"
        />
        <h1 className="h-sign mt-6 text-2xl text-shell sm:text-4xl">
          All the buzz <span className="text-coconut">without the booze</span>
        </h1>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/events"
            className="rounded-full bg-gold px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-shell"
          >
            Build Your Event
          </Link>
          <Link
            href="/find-us"
            className="rounded-full border border-shell/40 px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-shell transition-colors hover:border-gold hover:text-gold"
          >
            Find the Bar
          </Link>
        </div>
      </div>

      {/* The horizon — six islands on one waterline */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-6 pb-6">
        <div className="grid grid-cols-3 gap-x-4 gap-y-8 pb-4 lg:flex lg:items-end lg:justify-between lg:gap-0 lg:pb-0">
          {islands.map((isl, i) => (
            <a
              key={isl.href}
              href={isl.href}
              onClick={isl.uncharted ? undefined : (e) => sail(e, isl.href)}
              className={`island-link group relative block w-full ${isl.width}`}
            >
              <div className="island-bob" style={{ animationDelay: isl.delay }}>
                <div
                  className={`island-body relative ${isl.uncharted ? "opacity-50 blur-[1.5px] transition-all group-hover:opacity-80 group-hover:blur-[0.5px]" : ""}`}
                >
                  <IslandSvg id={`isl${i}`} seed={isl.seed} h={isl.h} />
                </div>
              </div>
              <p className="island-label -mt-3 text-center transition-colors">
                <span
                  className={`h-sign-med block text-base lg:text-lg ${isl.uncharted ? "text-shell/50" : "text-shell/90"}`}
                >
                  {isl.name}
                </span>
                <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.2em] text-shell/45 sm:block">
                  {isl.tagline}
                </span>
                {isl.uncharted && (
                  <span className="mt-1 inline-block rounded-full border border-gold/40 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
                    Uncharted
                  </span>
                )}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Next appearances ticker */}
      <div className="relative border-t border-shell/15 bg-abyss/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-1.5 px-6 py-3.5">
          {nextEvents.map((e) => (
            <p
              key={e.label + e.date}
              className="text-[10px] font-medium uppercase tracking-[0.2em] text-shell/75"
            >
              <span className="text-coconut">{e.date}</span> · {e.label}
            </p>
          ))}
          <Link
            href="/find-us"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold hover:text-shell"
          >
            Full calendar →
          </Link>
        </div>
      </div>

      {/* Transport ripple overlay */}
      {transport && (
        <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
          <span
            className="transport-ring absolute block h-[120vmax] w-[120vmax] rounded-full"
            style={{
              left: transport.x,
              top: transport.y,
              marginLeft: "-60vmax",
              marginTop: "-60vmax",
              background:
                "radial-gradient(circle, rgba(237,226,180,0.9) 0%, rgba(107,58,156,0.9) 35%, rgba(5,16,42,1) 70%)",
            }}
          />
        </div>
      )}
    </section>
  );
}
