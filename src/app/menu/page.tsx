import Image from "next/image";
import type { Metadata } from "next";
import Ripple from "@/components/Ripple";
import { currentMenu } from "@/lib/menu";
import { eventImages } from "@/lib/images";

export const metadata: Metadata = {
  title: "Menu — Lumanai Kava",
  description:
    "The Lumanai craft kava bar's current menu of naktails and functional mocktails. Updated event to event.",
};

export default function MenuPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src={eventImages.menuOnBar}
          alt="Lumanai printed menu on the bar"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/60 via-abyss/80 to-abyss" />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-40 text-center sm:pt-48">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
            {currentMenu.event.location}
          </p>
          <h1 className="mt-6 font-display text-5xl italic sm:text-7xl">
            {currentMenu.event.title}
          </h1>
          <p className="mt-4 text-shell/70">{currentMenu.event.date}</p>
          {currentMenu.event.tagline && (
            <p className="mt-3 font-display text-lg italic text-shell/60">
              {currentMenu.event.tagline}
            </p>
          )}
        </div>
      </section>

      {/* Menu body */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6">
          {currentMenu.sections.map((section, sIdx) => (
            <div key={section.title} className={sIdx === 0 ? "" : "mt-16"}>
              <div className="flex items-end justify-between border-b border-shell/20 pb-6">
                <div>
                  <h2 className="font-display text-4xl italic text-shell">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-orchid">
                      {section.subtitle}
                    </p>
                  )}
                </div>
                <p className="font-mono text-2xl text-gold">{section.priceLabel}</p>
              </div>

              <ul className="divide-y divide-shell/10">
                {section.drinks.map((d) => (
                  <li key={d.name} className="py-8">
                    <div className="flex items-baseline justify-between gap-6">
                      <h3 className="font-display text-2xl italic text-shell">
                        {d.name}
                      </h3>
                      <Ripple
                        className="h-6 w-6 shrink-0 text-orchid/60"
                        rings={3}
                        animated={false}
                      />
                    </div>
                    <p className="mt-3 text-shell/70">{d.ingredients}</p>
                    {d.note && (
                      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-gold/80">
                        {d.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {currentMenu.extras.length > 0 && (
            <div className="mt-16 rounded-3xl border border-shell/10 bg-lagoon/40 p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">
                Add-ons
              </p>
              <ul className="mt-4 space-y-3">
                {currentMenu.extras.map((x) => (
                  <li
                    key={x.label}
                    className="flex items-center justify-between font-display text-lg italic text-shell"
                  >
                    <span>{x.label}</span>
                    <span className="font-mono text-base text-gold">
                      {x.priceLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="font-display text-2xl italic text-shell">
            Want this menu — or a whole new one — at your event?
          </p>
          <a
            href="/events#book"
            className="mt-8 inline-block rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss hover:bg-shell"
          >
            Book the Bar
          </a>
        </div>
      </section>
    </>
  );
}
