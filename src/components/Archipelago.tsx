"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import SplashDrink from "@/components/SplashDrink";

/**
 * The Lumanai hero: a craft kava tropical bar at night. The six site
 * sections are drinks standing on a lit wooden back-bar shelf —
 * out-of-focus palm fronds frame the scene, warm light pools behind
 * the glasses. Hover a glass: it sloshes and throws droplets. Click:
 * a golden light-burst carries you to the page (the "transport").
 * Cutouts (transparent bg) live in public/images/drinks/clear/.
 */

type DrinkNav = {
  href: string;
  label: string;
  img: string;
  /** Droplet color — roughly matches the (filtered) drink. */
  accent: string;
  /** Optional recolor so three PNGs can cover six doors. */
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

/** Out-of-focus palm fronds — depth foliage, not decoration. */
function Frond({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 320"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M8,318 C70,240 150,190 285,168 C160,204 80,262 8,318 Z" />
      <path d="M4,312 C50,215 110,140 230,86 C120,160 50,240 4,312 Z" />
      <path d="M12,316 C100,270 210,240 350,242 C215,255 105,285 12,316 Z" />
      <path d="M2,308 C30,200 60,110 130,30 C70,130 30,220 2,308 Z" />
      <path d="M16,318 C120,296 250,290 400,306 C255,282 120,288 16,318 Z" />
    </svg>
  );
}

export default function Archipelago({
  nextEvents,
}: {
  nextEvents: { date: string; label: string; kind?: string }[];
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
      {/* Foreground foliage framing the bar */}
      <Frond className="pointer-events-none absolute -left-16 bottom-10 w-[340px] text-[#0d1436] opacity-70 blur-[3px] lg:w-[420px]" />
      <Frond className="pointer-events-none absolute -right-16 bottom-6 w-[320px] -scale-x-100 text-[#101040] opacity-60 blur-[4px] lg:w-[400px]" />

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

      {/* The back bar — every drink is a door */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-6 pb-6">
        {/* Warm light pooling behind the bottles */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-10 h-56 bg-[radial-gradient(60%_100%_at_50%_100%,rgba(237,226,180,0.12),transparent_70%)]"
          aria-hidden
        />
        <nav
          aria-label="Site sections"
          className="relative flex flex-wrap items-end justify-center gap-x-4 gap-y-7 pb-1 sm:gap-x-8 lg:justify-between lg:px-6"
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
                      ? { filter: `${d.filter} drop-shadow(0 10px 14px rgba(0,0,0,0.45))` }
                      : { filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.45))" }
                  }
                />
              </span>
              <span className="h-sign-med mt-2 block text-base text-shell/90 transition-colors duration-300 group-hover:text-gold lg:text-lg">
                {d.label}
              </span>
            </Link>
          ))}
        </nav>
        {/* The wooden shelf they stand on */}
        <div className="relative" aria-hidden>
          <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <div className="h-3 w-full rounded-b-md bg-gradient-to-b from-[#6b4a26] via-[#4a3118] to-[#2c1c0d] shadow-[0_10px_24px_rgba(0,0,0,0.55)]" />
          <div className="mx-auto h-8 w-11/12 bg-gradient-to-b from-gold/[0.08] to-transparent" />
        </div>
      </div>

      {/* Next appearances ticker — purple dates for markets, blue for events */}
      <div className="relative border-t border-shell/15 bg-abyss/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-1.5 px-6 py-3.5">
          {nextEvents.map((e) => (
            <p
              key={e.label + e.date}
              className="text-[10px] font-medium uppercase tracking-[0.2em] text-shell/75"
            >
              <span
                className={
                  e.kind === "market" ? "text-[#c9a7ee]" : "text-[#9ec5ea]"
                }
              >
                {e.date}
              </span>{" "}
              · {e.label}
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
