import type { Metadata } from "next";
import Link from "next/link";
import { faqs } from "@/lib/faq";

export const metadata: Metadata = { title: "FAQ — Lumanai Kava" };


export default function FaqPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-16 h-96 w-96 rounded-full bg-amethyst/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 py-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            FAQ
          </p>
          <h1 className="h-sign mt-4 text-5xl text-shell sm:text-7xl">
            Questions, answered straight.
          </h1>

          <div className="mt-8 divide-y divide-shell/10 border-t border-shell/10">
            {faqs.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg text-shell">
                  {item.q}
                  <span className="shrink-0 font-mono text-coconut transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="mt-3 max-w-2xl space-y-3">
                  {item.a.map((para) => (
                    <p key={para} className="text-shell/70">
                      {para}
                    </p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-shell/10 bg-abyss">
        <div className="mx-auto max-w-3xl px-6 py-10 text-center">
          <p className="text-2xl text-shell">Something we didn&apos;t cover?</p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell"
          >
            Ask us
          </Link>
        </div>
      </section>
    </>
  );
}
