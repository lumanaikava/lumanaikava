import Image from "next/image";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { getCatalog } from "@/lib/catalog";
import { galleryImages, lifestyleImages } from "@/lib/images";
import { artworkFor, isHiddenFromShop, shopRank } from "@/lib/shop-display";

// Catalog comes from Shopify with 60s revalidation.
export const dynamic = "force-dynamic";

const EVENTS_SITE = "https://events.lumanai.com";

/**
 * lumanai.com — the product brand's front door.
 *
 * The events business has its own landing page at events.lumanai.com
 * (src/app/bar). This one exists to get people browsing the bottles:
 * one lifestyle photo, the slogan, the lineup, and why it's different.
 *
 * The hero photo is portrait, so on desktop it takes the right half of
 * a split layout; on a phone it sits on top with the words beneath.
 * "Drink Different" rides the bottom of the photo on a torn strip of
 * the root pattern, the way it does on the handout card.
 */
export default async function Home() {
  const { items } = await getCatalog();
  const products = items
    .filter((p) => !isHiddenFromShop(p.handle, p.name))
    .sort((a, b) => shopRank(a.handle) - shopRank(b.handle));

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative flex flex-col overflow-hidden bg-abyss md:grid md:min-h-[calc(100svh_-_5.5rem)] md:grid-cols-2">
        {/* Words + the bottles. Under the photo on a phone, their own
            column on desktop. */}
        <div className="relative order-2 px-6 pb-12 pt-8 md:order-1 md:flex md:flex-col md:justify-center md:px-12 md:py-10 lg:px-20">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: "url(/images/roots-texture.webp)" }}
            aria-hidden
          />
          <div className="relative">
            <p className="rise-in font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
              Craft kava · Zero proof
            </p>
            <h1
              className="h-sign rise-in mt-3 text-5xl leading-[0.92] text-shell sm:text-6xl lg:text-7xl"
              style={{ "--delay": "120ms" } as React.CSSProperties}
            >
              All the buzz
              <br />
              <span className="text-coconut">without the booze.</span>
            </h1>
            <p
              className="rise-in mt-5 max-w-md text-base leading-relaxed text-shell/80 sm:text-lg"
              style={{ "--delay": "240ms" } as React.CSSProperties}
            >
              Hand-pressed noble kava, crafted into ready-to-drink naktails
              and instant kava. No alcohol, no hangover, no compromise.
            </p>
            <div
              className="rise-in mt-8 flex flex-wrap items-center gap-4"
              style={{ "--delay": "360ms" } as React.CSSProperties}
            >
              <Link
                href="/products"
                className="btn-brush text-xs font-bold uppercase tracking-[0.2em] text-shell"
              >
                Shop Now
              </Link>
              <a
                href={EVENTS_SITE}
                className="rounded-full border border-shell/30 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-shell/85 transition-colors hover:border-gold hover:text-gold"
              >
                Book the Bar
              </a>
            </div>
            <HeroLineup />
          </div>
        </div>

        {/* Photo, with the torn "Drink Different" strip from the card. */}
        <div className="relative order-1 h-[52svh] min-h-[380px] overflow-hidden md:order-2 md:h-auto md:min-h-0">
          <Image
            src={lifestyleImages.trailSip}
            alt="Sipping Lumanai kava on a boulder in the mountains outside Las Vegas"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="hero-settle object-cover object-[50%_18%] md:object-[50%_30%]"
          />
          {/* A soft edge into the text column on desktop. */}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-abyss/70 via-transparent md:block" />
          <div className="torn-strip px-4 pb-5 pt-9 sm:pb-7 sm:pt-12">
            <p className="h-sign text-center text-4xl tracking-wide text-shell drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-6xl">
              Drink Different
            </p>
          </div>
        </div>
      </section>

      {/* ---------- The lineup ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="reveal mb-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
            The lineup
          </p>
          <h2 className="h-sign mt-2 text-4xl text-shell sm:text-5xl">
            Bottled for one. <span className="text-coconut">Poured for the table.</span>
          </h2>
        </div>
        <ProductGrid products={products} />
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="btn-brush text-xs font-bold uppercase tracking-[0.2em] text-shell"
          >
            Shop All
          </Link>
        </div>
      </section>

      {/* ---------- Why it's different ---------- */}
      <section className="relative overflow-hidden border-t border-shell/10 bg-abyss">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url(/images/roots-texture.webp)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <h2 className="h-sign text-center text-4xl text-shell sm:text-5xl">
            The small batch <span className="text-coconut">difference.</span>
          </h2>
          <dl className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              {
                t: "Hand-pressed",
                d: "Water extraction only — no CO₂, no solvents. Just the root, the way it's been done for centuries.",
              },
              {
                t: "Fiji's finest",
                d: "Top-grade noble kava, sourced only from Fiji. The best of an already premium root, third-party tested for purity.",
              },
              {
                t: "Real craft",
                d: "Formulated with craft cocktail and culinary techniques. All-natural ingredients, reverse osmosis water.",
              },
            ].map((f) => (
              <div key={f.t} className="reveal text-center sm:text-left">
                <dt className="h-sign-med text-xl text-gold">{f.t}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-shell/75">
                  {f.d}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-center">
            <Link href="/our-process" className="prose-link text-sm text-gold">
              How we make it →
            </Link>
          </p>
        </div>
      </section>

      {/* ---------- The bar (cross-link to the events site) ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <div className="reveal grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="brush-mask relative aspect-[4/3] overflow-hidden">
            <Image
              src={galleryImages[0]}
              alt="The Lumanai bar pouring at an event"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
              Lumanai Bar
            </p>
            <h2 className="h-sign mt-2 text-4xl leading-[1.02] text-shell sm:text-5xl">
              Bring the bar
              <br />
              <span className="text-coconut">to your event.</span>
            </h2>
            <p className="mt-4 max-w-md text-shell/75">
              Premium craft kava and functional mocktails, bartended live at
              weddings, parties, and brand events across Las Vegas.
            </p>
            <a
              href={EVENTS_SITE}
              className="btn-brush mt-7 inline-block text-xs font-bold uppercase tracking-[0.2em] text-shell"
              style={{ "--brush-bg": "var(--amethyst)" } as React.CSSProperties}
            >
              Book the Bar
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * The bottles and RUSH, fanned out under the hero words. They rise in
 * one after another from the middle outward, then drift gently. Each
 * one is a link to its product page. Handles are Shopify's (RUSH's is
 * still the auto-generated one) — see src/lib/shop-display.ts.
 */
const LINEUP = [
  { handle: "basic-batch", name: "Basic Batch", tilt: -7, delay: 760 },
  { handle: "the-kolada", name: "The Kolada", tilt: -3, delay: 620 },
  { handle: "untitled-may21_11-42-27", name: "Lumanai Rush", tilt: 0, delay: 480 },
  { handle: "raspberry-orange-spice", name: "Raspberry Orange Spice", tilt: 3, delay: 620 },
  { handle: "ginger-honey-lemon", name: "Ginger Honey Lemon", tilt: 7, delay: 760 },
];

function HeroLineup() {
  return (
    <div className="relative mt-10 md:mt-12">
      <div
        className="lineup-glow pointer-events-none absolute inset-x-0 -bottom-4 h-24"
        aria-hidden
      />
      <ul className="relative flex items-end justify-center md:justify-start">
        {LINEUP.map((b, i) => {
          const art = artworkFor(b.handle);
          if (!art) return null;
          const rush = b.tilt === 0;
          return (
            <li key={b.handle} className={rush ? "z-10 -mx-1" : "-mx-1.5 sm:-mx-1"}>
              <Link
                href={`/products/${b.handle}`}
                aria-label={b.name}
                className="lineup-item block"
                style={
                  {
                    "--tilt": `${b.tilt}deg`,
                    "--delay": `${b.delay}ms`,
                  } as React.CSSProperties
                }
              >
                <span
                  className="lineup-float block"
                  style={{ "--float-delay": `${i * -1.2}s` } as React.CSSProperties}
                >
                  <Image
                    src={art}
                    alt={b.name}
                    width={rush ? 627 : 339}
                    height={900}
                    sizes="(min-width: 1024px) 12vw, 22vw"
                    className={`w-auto object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.55)] ${
                      rush
                        ? "h-32 sm:h-40 lg:h-48"
                        : "h-36 sm:h-44 lg:h-52"
                    }`}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
