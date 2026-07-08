import Image from "next/image";
import type { Metadata } from "next";
import { currentMenu } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "The Lumanai craft kava bar's current menu — naktails, functional mocktails, kava shots.",
};

/**
 * Reproduces the Canva "Base Menu" design: a white menu card framed by the
 * signature roots pattern, teal Anton headings, colored drink names.
 */
export default function MenuPage() {
  return (
    <section
      className="relative bg-cover bg-center py-8 sm:py-12"
      style={{ backgroundImage: "url(/images/roots-hero.webp)" }}
    >
      <div className="absolute inset-0 bg-abyss/30" aria-hidden />

      <div className="relative mx-auto max-w-2xl px-4">
        {/* The white card */}
        <div className="rounded-md bg-white px-6 py-10 text-center shadow-2xl sm:px-12">
          {/* Naktails */}
          <h1 className="h-sign text-4xl text-teal sm:text-5xl">
            {currentMenu.sections[0].title}{" "}
            <sup className="text-2xl sm:text-3xl">
              {currentMenu.sections[0].price}
            </sup>
          </h1>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {currentMenu.sections[0].drinks.map((d) => (
              <div key={d.name}>
                {d.image && (
                  <Image
                    src={d.image}
                    alt={d.name}
                    width={280}
                    height={340}
                    className="mx-auto h-44 w-auto object-contain sm:h-52"
                  />
                )}
                <h2
                  className="h-sign mt-3 text-3xl"
                  style={{ color: d.accent ?? "#185c7c" }}
                >
                  {d.name}
                </h2>
                <p className="mx-auto mt-2 max-w-[300px] text-sm font-semibold leading-relaxed text-abyss">
                  {d.ingredients}
                </p>
              </div>
            ))}
          </div>

          <hr className="mx-auto mt-10 border-teal/40" />

          {/* Mocktail */}
          <h2 className="h-sign mt-8 text-4xl text-teal sm:text-5xl">
            {currentMenu.sections[1].title}{" "}
            <sup className="text-2xl sm:text-3xl">
              {currentMenu.sections[1].price}
            </sup>
          </h2>

          {currentMenu.sections[1].drinks.map((d) => (
            <div key={d.name} className="mt-6">
              {d.image && (
                <Image
                  src={d.image}
                  alt={d.name}
                  width={280}
                  height={340}
                  className="mx-auto h-44 w-auto object-contain sm:h-52"
                />
              )}
              <h3
                className="h-sign mt-3 text-3xl"
                style={{ color: d.accent ?? "#185c7c" }}
              >
                {d.name}
              </h3>
              <p className="mx-auto mt-2 max-w-[420px] text-sm font-semibold leading-relaxed text-abyss">
                {d.ingredients}
              </p>
            </div>
          ))}

          <hr className="mx-auto mt-10 border-teal/40" />

          {/* Shots + combo */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {currentMenu.extras.map((x) => (
              <p
                key={x.label}
                className="h-sign text-2xl sm:text-3xl"
                style={{ color: x.accent ?? "#185c7c" }}
              >
                {x.label} <span className="text-abyss">{x.price}</span>
              </p>
            ))}
          </div>

          {currentMenu.addOn && (
            <p className="h-sign-med mt-6 text-lg text-teal">
              {currentMenu.addOn.label}{" "}
              <span className="underline underline-offset-4">
                {currentMenu.addOn.highlight}
              </span>{" "}
              to any drink!{" "}
              <span className="text-abyss">{currentMenu.addOn.price}</span>
            </p>
          )}
        </div>

        {/* Wordmark on the roots border, like the printed menu */}
        <div className="mt-8 flex justify-center pb-4">
          <Image
            src="/lumanai-wordmark.svg"
            alt="LUMANAI"
            width={220}
            height={89}
            className="h-auto w-[180px] sm:w-[220px]"
          />
        </div>
      </div>
    </section>
  );
}
