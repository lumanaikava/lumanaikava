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
  /** Silhouette ridge path inside a 200×100 box; waterline at y=100. */
  ridge: string;
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
    ridge:
      "M0 100 C22 96 38 62 62 48 C74 41 84 44 96 36 C112 25 134 52 154 68 C170 81 186 94 200 100 Z",
    width: "lg:w-[17%]",
    delay: "0s",
  },
  {
    href: "/menu",
    name: "Naktail Cove",
    tagline: "What's pouring",
    ridge:
      "M0 100 C26 92 44 74 66 66 C86 59 112 62 132 70 C156 79 180 92 200 100 Z",
    width: "lg:w-[13%]",
    delay: "1.4s",
  },
  {
    href: "/products",
    name: "Trading Post",
    tagline: "Shop RUSH + bottles",
    ridge:
      "M0 100 C18 94 30 70 48 58 C60 50 70 54 80 46 C94 34 104 40 116 50 C138 68 172 90 200 100 Z",
    width: "lg:w-[15%]",
    delay: "0.8s",
  },
  {
    href: "/find-us",
    name: "The Lagoon",
    tagline: "Find us this weekend",
    ridge:
      "M0 100 C30 94 52 80 74 74 C94 69 118 72 140 66 C162 60 184 88 200 100 Z",
    width: "lg:w-[13%]",
    delay: "2.2s",
  },
  {
    href: "/ingredients",
    name: "The Grove",
    tagline: "What's inside",
    ridge:
      "M0 100 C20 90 34 58 52 40 C62 30 72 34 80 28 C88 22 96 26 104 34 C124 54 160 86 200 100 Z",
    width: "lg:w-[16%]",
    delay: "1.1s",
  },
  {
    href: "/rewards",
    name: "Coconut Cove",
    tagline: "Earn coconuts",
    ridge:
      "M0 100 C28 95 48 82 70 76 C92 70 116 74 138 80 C160 86 182 95 200 100 Z",
    width: "lg:w-[12%]",
    delay: "2.8s",
  },
  {
    href: "#waitlist",
    name: "The Lounge",
    tagline: "Las Vegas · soon",
    ridge:
      "M0 100 C24 96 40 78 60 70 C80 62 100 66 120 62 C144 57 172 88 200 100 Z",
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

/** Atmospheric island: layered silhouette, moonlit rim, haze, reflection. */
function IslandSvg({ id, ridge }: { id: string; ridge: string }) {
  return (
    <svg viewBox="0 0 200 150" className="w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d2a6e" />
          <stop offset="55%" stopColor="#1c1a45" />
          <stop offset="100%" stopColor="#0a0f2e" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ede2b4" stopOpacity="0" />
          <stop offset="55%" stopColor="#ede2b4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ede2b4" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#185c7c" stopOpacity="0" />
          <stop offset="100%" stopColor="#185c7c" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={`${id}-refl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d2a6e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3d2a6e" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      {/* island body */}
      <path d={ridge} fill={`url(#${id}-body)`} filter={`url(#${id}-soft)`} />
      {/* moonlit rim along the ridge */}
      <path
        d={ridge}
        fill="none"
        stroke={`url(#${id}-rim)`}
        strokeWidth="1.4"
        className="island-rim"
      />
      {/* shore haze */}
      <rect x="0" y="84" width="200" height="16" fill={`url(#${id}-haze)`} />
      {/* reflection below the waterline */}
      <g transform="translate(0 200) scale(1 -1)">
        <path
          d={ridge}
          fill={`url(#${id}-refl)`}
          filter={`url(#${id}-blur)`}
          transform="translate(0 62) scale(1 0.38)"
        />
      </g>
      {/* waterline glint */}
      <line
        x1="6"
        y1="100"
        x2="194"
        y2="100"
        stroke="#ede2b4"
        strokeWidth="0.5"
        opacity="0.25"
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
                  <IslandSvg id={`isl${i}`} ridge={isl.ridge} />
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
