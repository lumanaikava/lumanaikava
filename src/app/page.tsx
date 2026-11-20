import Image from "next/image";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { getCatalog } from "@/lib/catalog";
import { galleryImages, lifestyleImages } from "@/lib/images";
import { isHiddenFromShop, shopRank } from "@/lib/shop-display";

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
 * a split layout; on a phone it fills the screen with the words laid
 * over the bottom — the same composition as the handout card.
 */
export default async function Home() {
  const { items } = await getCatalog();
  const products = items
    .filter((p) => !isHiddenFromShop(p.handle, p.name))
    .sort((a, b) => shopRank(a.handle) - shopRank(b.handle));

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-abyss md:grid md:min-h-[calc(100svh_-_5.5rem)] md:grid-cols-2">
        {/* Words — overlaid on the photo on a phone, their own column
            on desktop. */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-10 md:relative md:flex md:flex-col md:justify-center md:px-12 md:pb-0 lg:px-20">
          <div
            className="pointer-events-none absolute inset-0 hidden bg-cover bg-center opacity-25 md:block"
            style={{ backgroundImage: "url(/images/roots-texture.webp)" }}
            aria-hidden
          />
          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
              Craft kava · Zero proof
            </p>
            <h1 className="h-sign mt-3 text-5xl leading-[0.92] text-shell sm:text-6xl lg:text-7xl">
              All the buzz
              <br />
              <span className="text-coconut">without the booze.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-shell/80 sm:text-lg">
              Hand-pressed noble kava, crafted into ready-to-drink naktails
              and instant kava. No alcohol, no hangover, no compromise.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
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
          </div>
        </div>

        {/* Photo */}
        <div className="relative h-[calc(100svh_-_5.5rem)] min-h-[560px] md:h-auto md:min-h-0">
          <Image
            src={lifestyleImages.trailSip}
            alt="Sipping Lumanai kava on a boulder in the mountains outside Las Vegas"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-[50%_30%]"
          />
          {/* Darkens the lower half on a phone so the words stay legible;
              a soft edge into the text column on desktop. */}
          <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/60 to-transparent md:bg-gradient-to-r md:from-abyss/70 md:via-transparent" />
        </div>
      </section>

      {/* ---------- Drink Different band (from the card) ---------- */}
      <section className="relative overflow-hidden border-y border-shell/10">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/root-pattern.jpg)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-abyss/35" aria-hidden />
        <p className="h-sign relative py-8 text-center text-4xl tracking-wide text-shell sm:py-10 sm:text-6xl">
          Drink Different
        </p>
      </section>

      {/* ---------- The lineup ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
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
          <dl className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "Hand-pressed",
                d: "Water extraction only — no CO₂, no solvents. Just the root, the way it's been done for centuries.",
              },
              {
                t: "Noble kava",
                d: "Premium noble cultivars from Fiji and Vanuatu, third-party tested for purity.",
              },
              {
                t: "Real craft",
                d: "Formulated with craft cocktail and culinary technique. All-natural ingredients, reverse osmosis water.",
              },
              {
                t: "Gives back",
                d: "1% of every sale goes to a South Pacific Islander organization.",
              },
            ].map((f) => (
              <div key={f.t} className="text-center sm:text-left">
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
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
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
