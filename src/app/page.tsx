import Image from "next/image";
import Link from "next/link";
import Archipelago from "@/components/Archipelago";
import { currentMenu } from "@/lib/menu";
import { galleryImages } from "@/lib/images";
import { upcomingEvents, formatEventDate } from "@/lib/calendar";

// The appearances ticker rolls forward — refresh hourly.
export const revalidate = 3600;

export default function Home() {
  const nextEvents = upcomingEvents()
    .slice(0, 3)
    .map((e) => {
      const d = formatEventDate(e.date);
      return { date: `${d.weekday} ${d.month} ${d.day}`, label: e.title };
    });

  return (
    <>
      {/* Everything important in one viewport: logo, slogan, islands, dates */}
      <Archipelago nextEvents={nextEvents} />

      {/* Pouring now — one tight band */}
      <section className="border-b border-shell/10">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="h-sign text-3xl text-shell sm:text-4xl">
              Pouring now
            </h2>
            <Link
              href="/menu"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold hover:text-shell"
            >
              Full menu →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {currentMenu.sections
              .flatMap((s) =>
                s.drinks.map((d) => ({ ...d, price: s.price }))
              )
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
                className="relative aspect-square overflow-hidden rounded-2xl border border-shell/10 sm:aspect-[4/3]"
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
              <span className="text-orchid">but everyone remembers it.</span>
            </h2>
            <Link
              href="/events"
              className="rounded-full bg-gold px-9 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss transition-colors hover:bg-shell"
            >
              Build Your Event
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
