import type { Metadata } from "next";
import Image from "next/image";
import { eventImages } from "@/lib/images";
import { storyBlocks, STORY_LEDE, STORY_SIGNOFF } from "@/lib/story";
import {
  readStorySafe,
  contentSheetConfigured,
} from "@/lib/integrations/content-sheet";

export const metadata: Metadata = { title: "Our Story — Lumanai Kava" };

export const revalidate = 60;

/**
 * Our Story — Ash's own account, lifted from lumanai.com.
 *
 * Blocks edited in the Command Center override the built-in ones BY ID
 * and anything new is appended, so an empty or unreachable sheet leaves
 * the real story standing rather than blanking the page.
 */
export default async function OurStoryPage() {
  const managed = contentSheetConfigured() ? await readStorySafe() : [];
  const overrides = new Map(
    managed.filter((b) => !b.hidden && b.body.length).map((b) => [b.id, b]),
  );
  const hidden = new Set(managed.filter((b) => b.hidden).map((b) => b.id));

  const blocks = [
    ...storyBlocks
      .filter((b) => !hidden.has(b.id))
      .map((b) => overrides.get(b.id) ?? b),
    ...managed.filter(
      (m) =>
        !m.hidden &&
        m.body.length &&
        !storyBlocks.some((b) => b.id === m.id),
    ),
  ];

  return (
    <>
      <section className="relative overflow-hidden">
        <Image
          src={eventImages.bartenderShaker}
          alt="Etienne shaking a drink at a Lumanai booth"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/75 via-abyss/80 to-abyss" />
        <div className="relative mx-auto max-w-3xl px-6 pb-14 pt-32 text-center sm:pt-40">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            Our story
          </p>
          <h1 className="h-sign mt-4 text-4xl leading-[0.95] text-shell sm:text-6xl">
            Making kava a
            <br />
            <span className="text-coconut">mainstream</span> beverage.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-shell/70">
            {STORY_LEDE}
          </p>
        </div>
      </section>

      <section className="border-t border-shell/10">
        <div className="mx-auto max-w-2xl px-6 py-14">
          <div className="space-y-11">
            {blocks.map((b) => (
              <div key={b.id}>
                {b.heading && (
                  <h2 className="h-sign-med text-xl text-gold">{b.heading}</h2>
                )}
                <div className="mt-3 space-y-4">
                  {b.body.map((para) => (
                    <p
                      key={para.slice(0, 40)}
                      className="leading-relaxed text-shell/75"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 border-t border-shell/10 pt-8">
            <p className="h-sign text-3xl text-coconut">
              {STORY_SIGNOFF.farewell}
            </p>
            <p className="mt-3 text-shell">— {STORY_SIGNOFF.name}</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-shell/45">
              {STORY_SIGNOFF.title}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
