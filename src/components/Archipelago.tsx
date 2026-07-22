"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import SplashDrink from "@/components/SplashDrink";

/**
 * The Lumanai hero: a craft kava tropical bar at the shoreline, at
 * night. Silhouetted palm trees sway behind a moonlit body of water;
 * the six site sections are drinks standing at the water's edge. Hover
 * a glass: it sloshes and throws droplets. Click: a golden light-burst
 * carries you to the page. A ticker of upcoming dates streams across
 * the bottom, forever. Palette stays navy/purple. Cutouts (transparent
 * bg) live in public/images/drinks/clear/.
 */

type DrinkNav = {
  href: string;
  label: string;
  img: string;
  accent: string;
  filter?: string;
  delay: string;
};

const nav: DrinkNav[] = [
  {
    href: "/menu",
    label: "Menu",
    img: "/images/drinks/clear/hive-mind.png",
    accent: "#e8871f",
    delay: "0s",
  },
  {
    href: "/products",
    label: "Shop",
    img: "/images/drinks/clear/pacific-rim.png",
    accent: "#8aa32b",
    delay: "1.6s",
  },
  {
    href: "/events",
    label: "Book",
    img: "/images/drinks/clear/adapterol-spritz.png",
    accent: "#a93343",
    delay: "0.9s",
  },
  {
    href: "/find-us",
    label: "Find Us",
    img: "/images/drinks/clear/hive-mind.png",
    accent: "#2f9d99",
    filter: "hue-rotate(150deg) saturate(0.85)",
    delay: "2.3s",
  },
  {
    href: "/ingredients",
    label: "Ingredients",
    img: "/images/drinks/clear/adapterol-spritz.png",
    accent: "#7a5cc4",
    filter: "hue-rotate(230deg) saturate(0.9)",
    delay: "1.2s",
  },
  {
    href: "/rewards",
    label: "Rewards",
    img: "/images/drinks/clear/pacific-rim.png",
    accent: "#d8b23a",
    filter: "hue-rotate(-45deg) saturate(1.2)",
    delay: "2.9s",
  },
];

const stars = Array.from({ length: 42 }, (_, i) => {
  const x = ((i * 73) % 97) / 97;
  const y = ((i * 41) % 89) / 89;
  const s = 1 + ((i * 29) % 2);
  const d = ((i * 53) % 40) / 10;
  return { left: `${x * 100}%`, top: `${y * 52}%`, size: s, delay: `${d}s` };
});

/** A single palm-tree silhouette: curved trunk + a swaying crown. */
function PalmTree({
  className,
  color,
  delay,
  flip,
}: {
  className?: string;
  color: string;
  delay: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 320"
      className={`palm-sway ${className ?? ""}`}
      style={{ animationDelay: delay, color, transform: flip ? "scaleX(-1)" : undefined }}
      fill="currentColor"
      aria-hidden
    >
      {/* trunk */}
      <path d="M92 320 C88 250 88 182 98 118 L108 120 C104 190 108 250 108 320 Z" />
      {/* fronds radiating from the crown (~100,116) */}
      <path d="M100 116 C62 96 28 100 4 118 C30 104 64 110 100 122 Z" />
      <path d="M100 116 C66 84 40 70 22 60 C46 78 72 96 100 120 Z" />
      <path d="M100 116 C84 78 74 52 70 28 C78 60 90 92 102 118 Z" />
      <path d="M100 114 C96 78 100 50 110 28 C106 62 108 92 104 116 Z" />
      <path d="M100 116 C118 80 130 54 138 32 C124 64 110 92 102 118 Z" />
      <path d="M100 116 C134 84 160 72 178 62 C154 80 128 98 100 120 Z" />
      <path d="M100 116 C138 96 172 100 196 118 C170 104 136 110 100 122 Z" />
      <path d="M100 118 C140 112 168 122 188 140 C164 122 134 118 100 124 Z" />
      <path d="M100 118 C60 112 32 122 12 140 C36 122 66 118 100 124 Z" />
      {/* coconuts */}
      <circle cx="94" cy="126" r="4" />
      <circle cx="107" cy="128" r="4" />
      <circle cx="100" cy="133" r="3.5" />
    </svg>
  );
}

export default function Archipelago({
  events,
}: {
  events: { date: string; label: string; kind?: string }[];
}) {
  const router = useRouter();
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);

  /** The light-burst transport: golden explosion from the click point. */
  function sail(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    setBurst({ x: e.clientX, y: e.clientY });
    window.setTimeout(() => router.push(href), 480);
  }

  // Duplicate the list so the marquee loops seamlessly.
  const ticker = events.length ? [...events, ...events] : [];

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
        className="pointer-events-none absolute right-[12%] top-[8%] h-16 w-16 rounded-full bg-gold/80 shadow-[0_0_90px_40px_rgba(237,226,180,0.18)]"
        aria-hidden
      />

      {/* The body of water — moonlit, shimmering, lower third */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#12234f] via-[#0c1a3e] to-[#060f28]" />
        <div className="ocean-surface absolute inset-0 opacity-60" />
        {/* moon reflection streak */}
        <div className="absolute right-[12%] top-0 h-full w-10 -translate-x-1/2 bg-gradient-to-b from-gold/25 to-transparent blur-md" />
        {/* horizon glow where sky meets water */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* Palm-tree silhouettes framing the scene */}
      <PalmTree
        className="pointer-events-none absolute -left-8 bottom-[26%] w-40 opacity-90 blur-[0.5px] lg:w-56"
        color="#070d24"
        delay="0s"
      />
      <PalmTree
        className="pointer-events-none absolute left-[14%] bottom-[30%] hidden w-28 opacity-70 blur-[1.5px] lg:block"
        color="#0a1230"
        delay="1.5s"
      />
      <PalmTree
        className="pointer-events-none absolute -right-6 bottom-[24%] w-44 opacity-90 blur-[0.5px] lg:w-60"
        color="#070d24"
        delay="0.8s"
        flip
      />
      <PalmTree
        className="pointer-events-none absolute right-[16%] bottom-[31%] hidden w-24 opacity-70 blur-[1.5px] lg:block"
        color="#0a1230"
        delay="2.2s"
        flip
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
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <Link
            href="/events"
            className="btn-brush text-xs font-bold uppercase tracking-[0.2em] text-shell"
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

      {/* The drinks, standing at the water's edge — every one a door */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-6 pb-6">
        <nav
          aria-label="Site sections"
          className="relative flex flex-wrap items-end justify-center gap-x-4 gap-y-7 pb-2 sm:gap-x-8 lg:justify-between lg:px-6"
        >
          {nav.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              onClick={(e) => sail(e, d.href)}
              className="group block text-center"
            >
              <span
                className="island-bob block"
                style={{ animationDelay: d.delay }}
              >
                <SplashDrink
                  src={d.img}
                  alt=""
                  accent={d.accent}
                  imgClassName="h-24 w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105 sm:h-28 lg:h-36"
                  imgStyle={
                    d.filter
                      ? { filter: `${d.filter} drop-shadow(0 12px 16px rgba(0,0,0,0.55))` }
                      : { filter: "drop-shadow(0 12px 16px rgba(0,0,0,0.55))" }
                  }
                />
              </span>
              <span className="h-sign-med mt-2 block text-base text-shell/90 transition-colors duration-300 group-hover:text-gold lg:text-lg">
                {d.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Upcoming-dates ticker — streams across forever, markets purple */}
      {ticker.length > 0 && (
        <div className="relative overflow-hidden border-t border-shell/15 bg-abyss/80 py-3 backdrop-blur">
          <div className="ticker-track flex w-max items-center gap-x-10 whitespace-nowrap pr-10">
            {ticker.map((e, i) => (
              <span
                key={i}
                className="flex items-center gap-x-3 text-xs font-semibold uppercase tracking-[0.14em] text-shell/80"
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: e.kind === "market" ? "#c9a7ee" : "#9ec5ea",
                  }}
                  aria-hidden
                />
                <span
                  style={{ color: e.kind === "market" ? "#c9a7ee" : "#9ec5ea" }}
                >
                  {e.date}
                </span>
                {e.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Light-burst transport overlay */}
      {burst && (
        <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
          <span
            className="transport-ring absolute block h-[120vmax] w-[120vmax] rounded-full"
            style={{
              left: burst.x,
              top: burst.y,
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
