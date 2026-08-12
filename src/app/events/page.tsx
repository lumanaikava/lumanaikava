import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ExperienceBuilder from "@/components/ExperienceBuilder";
import { team } from "@/lib/team";

export const metadata: Metadata = {
  title: "Build an Experience",
  description:
    "Build your own kava bar experience — choose the format, the room, and the add-ons, and we'll reach out to talk it through. Las Vegas.",
};

/**
 * Booking — "build an experience".
 *
 * No prices anywhere: every event is quoted after a conversation, and a
 * number on the page either anchors the wrong figure or forces a fake
 * one. The photo strip and the "full bar setup · trained bartenders ·"
 * ticker that used to sit above the builder are gone — those photos now
 * live inside the choice buttons, where they do actual work.
 */
export default function EventsPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-shell/10">
        <div
          className="ether-drift pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-amethyst/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <p className="ether-in font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            Private events · Las Vegas
          </p>
          <h1 className="h-sign ether-in mt-4 max-w-3xl text-5xl leading-[0.92] text-shell sm:text-7xl">
            Build an
            <br />
            <span className="text-coconut">experience.</span>
          </h1>
          <p className="ether-in mt-6 max-w-xl text-lg text-shell/70">
            Pick the shape of your night. Tell us who it&apos;s for. We&apos;ll
            reach out and build the rest together — the menu, the pours, the
            room.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <ExperienceBuilder />
      </section>

      {/* Meet your bartenders */}
      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <h2 className="h-sign text-4xl text-shell sm:text-5xl">
            Meet your <span className="text-coconut">bartenders.</span>
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {team.map((t) => (
              <div
                key={t.name}
                className="flex gap-5 overflow-hidden rounded-3xl border border-shell/10 bg-lagoon/30"
              >
                <div className="relative aspect-[3/4] w-36 shrink-0 bg-abyss/50 sm:w-44">
                  {t.photo ? (
                    <Image
                      src={t.photo}
                      alt={`${t.name} behind the Lumanai bar`}
                      fill
                      sizes="176px"
                      // Top-anchored: object-cover alone centres on torsos
                      // and cuts their heads off.
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="h-sign text-6xl text-shell/20">
                        {t.name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="py-6 pr-5">
                  <h3 className="h-sign text-2xl text-shell">{t.name}</h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
                    {t.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-shell/65">
                    {t.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-link to public appearances */}
      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-4xl px-6 py-10 text-center">
          <p className="text-lg font-medium text-shell/80">
            Want to taste it before you book it?
          </p>
          <Link
            href="/find-us"
            className="prose-link mt-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold"
          >
            Find the bar at a market →
          </Link>
        </div>
      </section>
    </>
  );
}
