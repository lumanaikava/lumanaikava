"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";

/**
 * The Lumanai hero: logo, slogan, and the archipelago in one viewport.
 * Every destination is a stylized-3D island on a night ocean. Hover: the
 * island rises and its shore ripples. Click: a golden ripple transports you.
 */

type IslandDef = {
  href: string;
  name: string;
  tagline: string;
  glyph: React.ReactNode;
  pos: string;
  delay: string;
  scale: number;
};

const strokeProps = {
  fill: "none",
  stroke: "#ede2b4",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const islands: IslandDef[] = [
  {
    href: "/events",
    name: "The Bar",
    tagline: "Build your event",
    glyph: (
      <g {...strokeProps}>
        <path d="M10 26 L24 12 L38 26" />
        <path d="M14 26 V38 M34 26 V38 M14 38 H34" />
      </g>
    ),
    pos: "lg:left-[3%] lg:top-[30%]",
    delay: "0s",
    scale: 1.12,
  },
  {
    href: "/menu",
    name: "Naktail Cove",
    tagline: "What's pouring",
    glyph: (
      <g {...strokeProps}>
        <path d="M14 14 H34 L32 36 H16 Z" />
        <path d="M15 22 H33" opacity="0.6" />
      </g>
    ),
    pos: "lg:left-[21%] lg:top-[2%]",
    delay: "1.3s",
    scale: 0.88,
  },
  {
    href: "/products",
    name: "Trading Post",
    tagline: "Shop RUSH + bottles",
    glyph: (
      <g {...strokeProps}>
        <path d="M21 10 H27 V16 C30 18 32 21 32 25 V36 A2 2 0 0 1 30 38 H18 A2 2 0 0 1 16 36 V25 C16 21 18 18 21 16 Z" />
      </g>
    ),
    pos: "lg:left-[41%] lg:top-[34%]",
    delay: "0.7s",
    scale: 1,
  },
  {
    href: "/find-us",
    name: "The Lagoon",
    tagline: "Find us this weekend",
    glyph: (
      <g {...strokeProps}>
        <path d="M24 8 C29 8 33 12 33 17 C33 24 24 32 24 32 C24 32 15 24 15 17 C15 12 19 8 24 8 Z" />
        <circle cx="24" cy="17" r="3" opacity="0.7" />
      </g>
    ),
    pos: "lg:left-[62%] lg:top-[0%]",
    delay: "2.1s",
    scale: 0.88,
  },
  {
    href: "/ingredients",
    name: "The Grove",
    tagline: "What's inside",
    glyph: (
      <g {...strokeProps}>
        <path d="M24 38 C24 24 26 14 36 10 C34 22 30 30 24 38 Z" />
        <path d="M24 38 C22 28 18 22 12 20 C14 28 18 34 24 38 Z" opacity="0.7" />
      </g>
    ),
    pos: "lg:left-[82%] lg:top-[28%]",
    delay: "1.7s",
    scale: 1.05,
  },
  {
    href: "/rewards",
    name: "Coconut Cove",
    tagline: "Earn coconuts",
    glyph: (
      <g {...strokeProps}>
        <circle cx="24" cy="25" r="12" />
        <circle cx="20.5" cy="24" r="1.4" fill="#ede2b4" stroke="none" />
        <circle cx="27.5" cy="24" r="1.4" fill="#ede2b4" stroke="none" />
        <path d="M20.5 29.5 Q24 32.5 27.5 29.5" />
      </g>
    ),
    pos: "lg:left-[30%] lg:top-[58%]",
    delay: "2.6s",
    scale: 0.95,
  },
];

const stars = Array.from({ length: 46 }, (_, i) => {
  const x = ((i * 73) % 97) / 97;
  const y = ((i * 41) % 89) / 89;
  const s = 1 + ((i * 29) % 3);
  const d = ((i * 53) % 40) / 10;
  return { left: `${x * 100}%`, top: `${y * 55}%`, size: s, delay: `${d}s` };
});

/** Stylized-3D island: shaded dome, sand rim, lagoon glow, palm, reflection. */
function IslandSvg({ id, glyph }: { id: string; glyph: React.ReactNode }) {
  return (
    <svg viewBox="0 0 200 168" className="w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-mound`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8a4fbf" />
          <stop offset="45%" stopColor="#5b3596" />
          <stop offset="100%" stopColor="#241a4e" />
        </linearGradient>
        <linearGradient id={`${id}-mound2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d2a6e" />
          <stop offset="100%" stopColor="#101636" />
        </linearGradient>
        <linearGradient id={`${id}-sand`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0dfae" />
          <stop offset="100%" stopColor="#a3865a" />
        </linearGradient>
        <radialGradient id={`${id}-lagoon`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#2f8bb5" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#185c7c" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#185c7c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-reflect`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0f2e" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0a0f2e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-trunk`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a2f18" />
          <stop offset="100%" stopColor="#8a6034" />
        </linearGradient>
      </defs>

      {/* lagoon glow on the water */}
      <ellipse cx="100" cy="126" rx="86" ry="22" fill={`url(#${id}-lagoon)`} />
      {/* shore ripple rings (hover) */}
      <g className="shore-ring" fill="none" stroke="#ede2b4">
        <ellipse cx="100" cy="126" rx="70" ry="15" strokeWidth="1.5" />
      </g>
      {/* reflection */}
      <ellipse cx="100" cy="136" rx="55" ry="12" fill={`url(#${id}-reflect)`} />

      {/* sand base — two ellipses give the rim thickness */}
      <ellipse cx="100" cy="124" rx="62" ry="15" fill="#6b5232" />
      <ellipse cx="100" cy="120" rx="62" ry="15" fill={`url(#${id}-sand)`} />

      {/* dome with lit + shadow faces */}
      <path
        d="M44 118 C50 92 70 78 100 78 C130 78 150 92 156 118 C138 124 118 127 100 127 C82 127 62 124 44 118 Z"
        fill={`url(#${id}-mound)`}
      />
      <path
        d="M100 78 C130 78 150 92 156 118 C138 124 118 127 100 127 Z"
        fill={`url(#${id}-mound2)`}
        opacity="0.75"
      />
      {/* moonlit rim */}
      <path
        d="M44 118 C50 92 70 78 100 78 C122 78 138 86 148 98"
        fill="none"
        stroke="#e9a7d0"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* palm — trunk + shaded fronds */}
      <path
        d="M66 112 C64 96 60 86 52 76"
        fill="none"
        stroke={`url(#${id}-trunk)`}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <g fill="none" strokeLinecap="round">
        <g stroke="#0e4d68" strokeWidth="4">
          <path d="M52 76 C42 70 33 70 26 75" />
          <path d="M52 76 C48 65 41 61 32 60" />
          <path d="M52 76 C57 65 65 61 74 62" />
          <path d="M52 76 C61 70 70 71 76 77" />
        </g>
        <g stroke="#2f8bb5" strokeWidth="2" opacity="0.8">
          <path d="M52 76 C43 71 35 71 29 75" />
          <path d="M52 76 C49 67 43 63 35 62" />
        </g>
      </g>
      {/* coconuts */}
      <circle cx="54" cy="79" r="3" fill="#4a2f18" />
      <circle cx="49" cy="80" r="3" fill="#6b4a26" />

      {/* glyph lantern */}
      <circle cx="128" cy="44" r="26" fill="#060b24" opacity="0.9" />
      <circle
        cx="128"
        cy="44"
        r="26"
        fill="none"
        stroke="#ede2b4"
        strokeWidth="1.5"
      />
      <circle cx="128" cy="44" r="32" fill="none" stroke="#ede2b4" strokeWidth="0.75" opacity="0.35" />
      <g transform="translate(104 20)">{glyph}</g>
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
    null
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
      {/* Sky over roots */}
      <div
        className="hero-roots pointer-events-none absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: "url(/images/roots-hero.webp)" }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-abyss/80 via-ocean/70 to-lagoon/80" />
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
            opacity: 0.3,
          }}
          aria-hidden
        />
      ))}
      <div
        className="pointer-events-none absolute right-[8%] top-[6%] h-28 w-28 rounded-full bg-gold/90 shadow-[0_0_110px_50px_rgba(237,226,180,0.22)]"
        aria-hidden
      />
      {/* Ocean sheen across the island band */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]">
        <div className="ocean-surface absolute inset-0 opacity-70" />
      </div>

      {/* Top: logo + slogan + CTAs */}
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-16 text-center lg:pt-20">
        <Image
          src="/lumanai-wordmark.svg"
          alt="LUMANAI"
          width={420}
          height={170}
          priority
          className="h-auto w-[62vw] max-w-[420px]"
        />
        <h1 className="h-sign mt-5 text-2xl text-shell sm:text-4xl">
          All the buzz <span className="text-orchid">without the booze</span>
        </h1>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/events"
            className="rounded-full bg-gold px-7 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-abyss transition-colors hover:bg-shell"
          >
            Build Your Event
          </Link>
          <Link
            href="/find-us"
            className="rounded-full border border-shell/40 px-7 py-3 font-mono text-xs uppercase tracking-[0.16em] text-shell transition-colors hover:border-gold hover:text-gold"
          >
            Find the Bar
          </Link>
        </div>
      </div>

      {/* Islands */}
      <div className="relative mx-auto w-full max-w-6xl flex-1 px-6">
        <div className="relative mt-8 grid grid-cols-2 gap-x-4 gap-y-6 pb-8 sm:grid-cols-3 lg:mt-0 lg:block lg:h-full lg:min-h-[360px] lg:pb-0">
          {islands.map((isl, i) => (
            <a
              key={isl.href}
              href={isl.href}
              onClick={(e) => sail(e, isl.href)}
              className={`island-link group relative block lg:absolute lg:w-[168px] ${isl.pos}`}
              style={{ transform: `scale(${isl.scale})` }}
            >
              <div className="island-bob" style={{ animationDelay: isl.delay }}>
                <div className="island-body relative mx-auto w-full max-w-[168px]">
                  <IslandSvg id={`isl${i}`} glyph={isl.glyph} />
                  <p className="island-label -mt-1 text-center transition-colors">
                    <span className="h-sign-med block text-lg text-shell">
                      {isl.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-shell/55">
                      {isl.tagline}
                    </span>
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Bottom ticker: next appearances */}
      <div className="relative border-t border-shell/15 bg-abyss/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-1.5 px-6 py-3.5">
          {nextEvents.map((e) => (
            <p
              key={e.label + e.date}
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-shell/75"
            >
              <span className="text-orchid">{e.date}</span> · {e.label}
            </p>
          ))}
          <Link
            href="/find-us"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold hover:text-shell"
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
                "radial-gradient(circle, rgba(237,226,180,0.9) 0%, rgba(198,58,142,0.85) 35%, rgba(5,16,42,1) 70%)",
            }}
          />
        </div>
      )}
    </section>
  );
}
