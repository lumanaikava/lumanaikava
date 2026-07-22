import Image from "next/image";
import Link from "next/link";
import Archipelago from "@/components/Archipelago";
import { currentMenu } from "@/lib/menu";
import { galleryImages } from "@/lib/images";
import { upcomingEventsSynced, formatEventDate } from "@/lib/calendar";

// The appearances ticker rolls forward — refresh hourly.
export const revalidate = 3600;

export default async function Home() {
  const nextEvents = (await upcomingEventsSynced())
    .slice(0, 3)
    .map((e) => {
      const d = formatEventDate(e.date);
      return { date: `${d.weekday} ${d.month} ${d.day}`, label: e.title };
    });

  return (
    <>
      {/* Everything important in one viewport: logo, slogan, islands, dates */}
      <Archipelago nextEvents={nextEvents} />

      {/* The word we own — dictionary entry */}
      <section className="border-b border-shell/10 bg-abyss/60">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <p className="h-sign text-5xl text-shell sm:text-6xl">
            nak·tail
          </p>
          <p className="mt-2 text-sm tracking-[0.2em] text-shell/50">
            /ˈnak-tāl/ · noun
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg text-shell/85">
            A craft cocktail built on kava instead of alcohol — shaken with
            adaptogens, botanicals, and real bar technique. Invented behind
            our bar. Only pours in Las Vegas.
          </p>
        </div>
      </section>

      {/* Pouring now — one tight band */}
      <section className="border-b border-shell/10">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="h-sign text-3xl text-shell sm:text-4xl">
              Pouring <span className="text-coconut">now</span>
            </h2>
            <Link
              href="/menu"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold hover:text-shell"
            >
              Full menu →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {currentMenu.sections
              .flatMap((s) => s.drinks.map((d) => ({ ...d, price: s.price })))
              .map((d) => (
                <Link
                  key={d.name}
                  href="/menu"
                  className="group flex items-center gap-4 rounded-2xl border border-shell/10 bg-lagoon/30 p-4 transition-colors hover:border-gold"
                >
                  {d.image && (
                    <Image
                      src={d.image}
                      alt=""
                      width={64}
                      height={80}
                      className="h-16 w-auto shrink-0 object-contain"
                    />
                  )}
                  <span>
                    <span className="h-sign-med block text-xl text-shell group-hover:text-gold">
                      {d.name}
                    </span>
                    <span className="font-mono text-xs text-gold">
                      ${d.price}
                    </span>
                    {d.effects && (
                      <span className="mt-1 flex gap-1.5">
                        {d.effects.map((fx) => (
                          <span
                            key={fx}
                            className="rounded-full border border-shell/25 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-shell/60"
                          >
                            {fx}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* One row of real nights + the ask */}
      <section className="relative overflow-hidden bg-abyss">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url(/images/roots-texture.webp)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-4 gap-3">
            {galleryImages.slice(0, 4).map((src) => (
              <div
                key={src}
                className="brush-mask relative aspect-square overflow-hidden sm:aspect-[4/3]"
              >
                <Image
                  src={src}
                  alt="Lumanai event"
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-5 text-center">
            <h2 className="h-sign text-4xl text-shell sm:text-5xl">
              Your next event,{" "}
              <span className="text-coconut">but everyone remembers it.</span>
            </h2>
            <Link
              href="/events"
              className="btn-brush font-mono text-xs font-bold uppercase tracking-[0.2em] text-shell"
              style={{ "--brush-bg": "var(--amethyst)" } as React.CSSProperties}
            >
              Build Your Event
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
