import Image from "next/image";
import Link from "next/link";
import SplashDrink from "@/components/SplashDrink";

/**
 * The Lumanai hero: logo, slogan, and the back bar in one viewport.
 * Navigation = the drinks themselves, lined up on a lit shelf. Hover a
 * glass and it sloshes + throws droplets (SplashDrink). Labels are the
 * plain site sections — no fantasy names. Until we have a unique PNG
 * per destination, some glasses are recolored with hue-rotate filters.
 * Cutouts (transparent bg) live in public/images/drinks/clear/.
 */

type DrinkNav = {
  href: string;
  label: string;
  img: string;
  /** Droplet color — roughly matches the (filtered) drink. */
  accent: string;
  /** Optional recolor so three PNGs can cover seven doors. */
  filter?: string;
  delay: string;
  /** The Lounge — fogged-out teaser, anchors to the waitlist. */
  lounge?: boolean;
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
    label: "Events",
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
  {
    href: "#waitlist",
    label: "The Lounge",
    img: "/images/drinks/clear/hive-mind.png",
    accent: "#8892b0",
    filter: "grayscale(1) brightness(0.5) contrast(1.05)",
    delay: "3.5s",
    lounge: true,
  },
];

const stars = Array.from({ length: 42 }, (_, i) => {
  const x = ((i * 73) % 97) / 97;
  const y = ((i * 41) % 89) / 89;
  const s = 1 + ((i * 29) % 2);
  const d = ((i * 53) % 40) / 10;
  return { left: `${x * 100}%`, top: `${y * 52}%`, size: s, delay: `${d}s` };
});

export default function Archipelago({
  nextEvents,
}: {
  nextEvents: { date: string; label: string }[];
}) {
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
        <nav
          aria-label="Site sections"
          className="flex flex-wrap items-end justify-center gap-x-4 gap-y-7 pb-1 sm:gap-x-8 lg:justify-between"
        >
          {nav.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className={`group block text-center ${d.lounge ? "opacity-70 transition-opacity hover:opacity-100" : ""}`}
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
              <span
                className={`h-sign-med mt-2 block text-base transition-colors duration-300 lg:text-lg ${
                  d.lounge
                    ? "text-shell/50 group-hover:text-gold"
                    : "text-shell/90 group-hover:text-gold"
                }`}
              >
                {d.label}
              </span>
              {d.lounge && (
                <span className="mt-1 inline-block rounded-full border border-gold/40 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
                  Soon
                </span>
              )}
            </Link>
          ))}
        </nav>
        {/* Lit shelf edge under the glasses */}
        <div
          className="h-px w-full bg-gradient-to-r from-transparent via-gold/45 to-transparent"
          aria-hidden
        />
        <div
          className="mx-auto h-6 w-4/5 bg-gradient-to-b from-gold/[0.07] to-transparent"
          aria-hidden
        />
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
    </section>
  );
}
