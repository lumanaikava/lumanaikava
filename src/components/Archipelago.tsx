"use client";

import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";

/**
 * The Lumanai Archipelago — the home page's navigation is a night ocean,
 * and every destination on the site is an island. Hover: the island rises
 * and its shore ripples. Click: a golden ripple washes over the screen and
 * you're transported.
 *
 * Falls back to a simple tappable grid on small screens and skips all
 * motion for prefers-reduced-motion visitors.
 */

type Island = {
  href: string;
  name: string;
  tagline: string;
  glyph: React.ReactNode;
  /** Desktop position within the scene. */
  pos: string;
  /** Idle bob stagger. */
  delay: string;
  /** Depth scale — back islands smaller. */
  scale: string;
};

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const islands: Island[] = [
  {
    href: "/events",
    name: "The Bar",
    tagline: "Build your event",
    glyph: (
      // Tiki hut
      <g {...strokeProps}>
        <path d="M10 26 L24 12 L38 26" />
        <path d="M14 26 V38 M34 26 V38 M14 38 H34" />
        <path d="M24 26 V38" opacity="0.6" />
      </g>
    ),
    pos: "lg:left-[6%] lg:top-[34%]",
    delay: "0s",
    scale: "lg:scale-110",
  },
  {
    href: "/menu",
    name: "Naktail Cove",
    tagline: "What's pouring",
    glyph: (
      // Rocks glass
      <g {...strokeProps}>
        <path d="M14 14 H34 L32 36 H16 Z" />
        <path d="M15 22 H33" opacity="0.6" />
        <circle cx="21" cy="28" r="2.5" opacity="0.6" />
      </g>
    ),
    pos: "lg:left-[26%] lg:top-[12%]",
    delay: "1.3s",
    scale: "lg:scale-90",
  },
  {
    href: "/products",
    name: "Trading Post",
    tagline: "Shop bottles + RUSH",
    glyph: (
      // Bottle
      <g {...strokeProps}>
        <path d="M21 10 H27 V16 C30 18 32 21 32 25 V36 A2 2 0 0 1 30 38 H18 A2 2 0 0 1 16 36 V25 C16 21 18 18 21 16 Z" />
        <path d="M17 27 H31" opacity="0.6" />
      </g>
    ),
    pos: "lg:left-[47%] lg:top-[30%]",
    delay: "0.7s",
    scale: "lg:scale-100",
  },
  {
    href: "/find-us",
    name: "The Lagoon",
    tagline: "Find us this weekend",
    glyph: (
      // Map pin over waves
      <g {...strokeProps}>
        <path d="M24 8 C29 8 33 12 33 17 C33 24 24 32 24 32 C24 32 15 24 15 17 C15 12 19 8 24 8 Z" />
        <circle cx="24" cy="17" r="3" opacity="0.7" />
        <path d="M12 38 Q18 34 24 38 T36 38" opacity="0.6" />
      </g>
    ),
    pos: "lg:left-[68%] lg:top-[10%]",
    delay: "2.1s",
    scale: "lg:scale-90",
  },
  {
    href: "/ingredients",
    name: "The Grove",
    tagline: "What's inside",
    glyph: (
      // Leaf sprig
      <g {...strokeProps}>
        <path d="M24 38 C24 24 26 14 36 10 C34 22 30 30 24 38 Z" />
        <path d="M24 38 C22 28 18 22 12 20 C14 28 18 34 24 38 Z" opacity="0.7" />
      </g>
    ),
    pos: "lg:left-[86%] lg:top-[36%]",
    delay: "1.7s",
    scale: "lg:scale-105",
  },
  {
    href: "/rewards",
    name: "Coconut Cove",
    tagline: "Earn coconuts",
    glyph: (
      // Coconut
      <g {...strokeProps}>
        <circle cx="24" cy="25" r="12" />
        <path d="M18 20 Q24 14 30 20" opacity="0.6" />
        <circle cx="20.5" cy="24" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="27.5" cy="24" r="1.4" fill="currentColor" stroke="none" />
        <path d="M20.5 29.5 Q24 32.5 27.5 29.5" opacity="0.8" />
      </g>
    ),
    pos: "lg:left-[38%] lg:top-[58%]",
    delay: "2.6s",
    scale: "lg:scale-95",
  },
];

/** Deterministic star field — stable between server and client render. */
const stars = Array.from({ length: 54 }, (_, i) => {
  const x = ((i * 73) % 97) / 97;
  const y = ((i * 41) % 89) / 89;
  const s = 1 + ((i * 29) % 3);
  const d = ((i * 53) % 40) / 10;
  return { left: `${x * 100}%`, top: `${y * 58}%`, size: s, delay: `${d}s` };
});

export default function Archipelago() {
  const router = useRouter();
  const [transport, setTransport] = useState<{ x: number; y: number } | null>(
    null
  );

  function sail(e: MouseEvent<HTMLAnchorElement>, href: string) {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return; // plain navigation
    e.preventDefault();
    setTransport({ x: e.clientX, y: e.clientY });
    window.setTimeout(() => router.push(href), 480);
  }

  return (
    <section
      aria-label="Explore the site"
      className="relative overflow-hidden border-y border-shell/10"
    >
      {/* Sky */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-abyss via-ocean to-lagoon" />
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
            opacity: 0.35,
          }}
          aria-hidden
        />
      ))}
      {/* Moon glow */}
      <div
        className="pointer-events-none absolute right-[12%] top-[8%] h-40 w-40 rounded-full bg-gold/90 blur-[2px] shadow-[0_0_120px_60px_rgba(237,226,180,0.25)]"
        aria-hidden
      />
      {/* Ocean */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-b from-lagoon via-violet/60 to-abyss">
        <div className="ocean-surface absolute inset-0" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 lg:pb-24">
        <p className="text-center font-mono text-xs uppercase tracking-[0.28em] text-gold">
          The Lumanai Archipelago
        </p>
        <h2 className="h-sign mt-4 text-center text-4xl text-shell sm:text-6xl">
          Choose your island.
        </h2>

        {/* Desktop: scattered scene · Mobile: tidy grid */}
        <div className="relative mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:mt-0 lg:block lg:h-[520px]">
          {islands.map((isl) => (
            <a
              key={isl.href}
              href={isl.href}
              onClick={(e) => sail(e, isl.href)}
              className={`island-link group relative block lg:absolute lg:w-[190px] ${isl.pos} ${isl.scale}`}
            >
              <div
                className="island-bob"
                style={{ animationDelay: isl.delay }}
              >
                <div className="island-body relative mx-auto w-full max-w-[190px]">
                  <svg viewBox="0 0 200 150" className="w-full" aria-hidden>
                    {/* shore ripple rings (hover) */}
                    <g className="shore-ring" fill="none" stroke="#ede2b4">
                      <ellipse cx="100" cy="118" rx="66" ry="14" strokeWidth="1.5" />
                    </g>
                    {/* reflection */}
                    <ellipse
                      cx="100"
                      cy="124"
                      rx="58"
                      ry="10"
                      fill="#05102a"
                      opacity="0.55"
                    />
                    {/* island mounds */}
                    <path
                      d="M30 118 C40 96 62 84 100 84 C138 84 160 96 170 118 Z"
                      fill="#3d2a6e"
                    />
                    <path
                      d="M42 118 C52 100 70 92 100 92 C130 92 148 100 158 118 Z"
                      fill="#17285a"
                    />
                    <path
                      d="M30 118 C40 96 62 84 100 84 C138 84 160 96 170 118"
                      fill="none"
                      stroke="#c63a8e"
                      strokeWidth="1.5"
                      opacity="0.65"
                    />
                    {/* palm */}
                    <g stroke="#05102a" strokeWidth="4" fill="none" strokeLinecap="round">
                      <path d="M64 112 C62 96 58 86 50 78" />
                    </g>
                    <g stroke="#185c7c" strokeWidth="3" fill="none" strokeLinecap="round">
                      <path d="M50 78 C42 72 34 72 28 76" />
                      <path d="M50 78 C46 68 40 64 32 62" />
                      <path d="M50 78 C54 68 62 64 70 64" />
                      <path d="M50 78 C58 72 66 72 72 78" />
                    </g>
                    {/* glyph lantern */}
                    <circle
                      cx="100"
                      cy="52"
                      r="27"
                      fill="#05102a"
                      stroke="#ede2b4"
                      strokeWidth="1.5"
                      opacity="0.92"
                    />
                    <g
                      transform="translate(76 28)"
                      className="text-gold"
                      color="#ede2b4"
                    >
                      {isl.glyph}
                    </g>
                  </svg>
                  <p className="island-label mt-1 text-center transition-colors">
                    <span className="h-sign-med block text-xl text-shell">
                      {isl.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-shell/50">
                      {isl.tagline}
                    </span>
                  </p>
                </div>
              </div>
            </a>
          ))}
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
