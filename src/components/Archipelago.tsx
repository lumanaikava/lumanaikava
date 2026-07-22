"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
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
      viewBox="0 0 240 300"
      className={`palm-sway ${className ?? ""}`}
      style={{ animationDelay: delay, color, transform: flip ? "scaleX(-1)" : undefined }}
      fill="currentColor"
      aria-hidden
    >
      {/* trunk */}
      <path d="M108 300 C102 224 102 150 116 88 L132 90 C124 156 130 228 132 300 Z" />
      {/* full, broad fronds radiating from the crown (~122,88) */}
      {/* far-left droop */}
      <path d="M122 100 C72 98 30 118 0 152 C30 128 70 114 122 110 Z" />
      {/* left low */}
      <path d="M122 96 C68 84 26 92 2 114 C30 96 72 102 122 106 Z" />
      {/* left mid */}
      <path d="M122 92 C70 64 34 48 6 36 C34 66 78 84 122 104 Z" />
      {/* left high */}
      <path d="M120 88 C90 52 78 22 74 -4 C88 32 106 72 126 96 Z" />
      {/* center-left */}
      <path d="M118 88 C106 50 108 18 116 -10 C128 20 124 60 126 94 Z" />
      {/* center-right */}
      <path d="M124 88 C136 50 134 18 128 -10 C116 20 120 60 120 94 Z" />
      {/* right high */}
      <path d="M124 88 C154 52 166 22 170 -4 C156 32 138 72 118 96 Z" />
      {/* right mid */}
      <path d="M122 92 C174 64 210 48 238 36 C210 66 166 84 122 104 Z" />
      {/* right low */}
      <path d="M122 96 C176 84 216 92 242 114 C214 96 172 102 122 106 Z" />
      {/* far-right droop */}
      <path d="M122 100 C172 98 214 118 244 152 C214 128 174 114 122 110 Z" />
      {/* coconut cluster */}
      <circle cx="116" cy="102" r="5" />
      <circle cx="130" cy="104" r="5" />
      <circle cx="123" cy="110" r="4.5" />
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

  // Cycle through upcoming dates, fading between them.
  const [dateIdx, setDateIdx] = useState(0);
  useEffect(() => {
    if (events.length <= 1) return;
    const t = setInterval(
      () => setDateIdx((i) => (i + 1) % events.length),
      4000,
    );
    return () => clearInterval(t);
  }, [events.length]);
  const current = events.length ? events[dateIdx % events.length] : null;

  return (
    <section
      aria-label="Lumanai — explore the site"
      className="relative flex min-h-[calc(100svh_-_5.5rem)] flex-col overflow-hidden"
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

      {/* Big palm-tree silhouettes hugging the edges of the screen */}
      <PalmTree
        className="pointer-events-none absolute -left-28 bottom-0 w-80 opacity-95 sm:w-96 lg:-left-24 lg:w-[30rem]"
        color="#0e1638"
        delay="0s"
      />
      <PalmTree
        className="pointer-events-none absolute -right-28 bottom-0 w-80 opacity-95 sm:w-96 lg:-right-24 lg:w-[30rem]"
        color="#0e1638"
        delay="0.8s"
        flip
      />
      {/* Smaller depth palms tucked into the corners */}
      <PalmTree
        className="pointer-events-none absolute -left-8 bottom-0 hidden w-60 opacity-60 blur-[2px] lg:block"
        color="#0b1230"
        delay="1.8s"
      />
      <PalmTree
        className="pointer-events-none absolute -right-8 bottom-0 hidden w-60 opacity-60 blur-[2px] lg:block"
        color="#0b1230"
        delay="2.6s"
        flip
      />

      {/* Logo + slogan + CTAs */}
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-12 text-center lg:pt-14">
        <Image
          src="/lumanai-wordmark.svg"
          alt="LUMANAI"
          width={420}
          height={170}
          priority
          className="h-auto w-[72vw] max-w-[504px]"
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

      {/* The drinks — lifted up so the titles read without scrolling */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-10">
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

      {/* Upcoming dates — one at a time, fading in and out */}
      {current && (
        <div className="relative border-t border-shell/15 bg-abyss/80 py-4 backdrop-blur">
          <div className="mx-auto flex h-5 max-w-6xl items-center justify-center px-6">
            <p
              key={dateIdx}
              className="date-fade flex items-center gap-x-3 text-xs font-semibold uppercase tracking-[0.14em] text-shell/85"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor:
                    current.kind === "market" ? "#c9a7ee" : "#9ec5ea",
                }}
                aria-hidden
              />
              <span
                style={{
                  color: current.kind === "market" ? "#c9a7ee" : "#9ec5ea",
                }}
              >
                {current.date}
              </span>
              {current.label}
            </p>
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
