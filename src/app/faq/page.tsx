import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "FAQ — Lumanai Kava" };

const faqs = [
  {
    q: "How much should I drink?",
    a: "Kava hits everyone a little differently depending on your body chemistry. Start with at least 4 oz of a naktail or the full 8 oz bottle of a flavored drink. After a couple sessions, reverse tolerance kicks in and 2–4 oz will do it. Best sipped 2–3 hours after eating. Nausea means you've had enough.",
  },
  {
    q: "Is kava bad for your liver?",
    a: "Not the way we make it. Kava has been consumed safely for thousands of years across the Pacific Islands, and it's served daily in roughly 200 U.S. kava bars without incident. The old scary studies used solvent-extracted kava in tablet form alongside alcohol or acetaminophen — that's not what we do. The WHO now recognizes traditional water-extracted kava's safety.",
  },
  {
    q: "Can I drink kava if I'm pregnant or breastfeeding?",
    a: "Err on the side of caution and avoid kava during pregnancy and nursing. The safety data just isn't there yet.",
  },
  {
    q: "Why is my mouth tingly?",
    a: "Completely normal, not an allergic reaction. Kavain — one of the active compounds — is a mild numbing agent, similar to lidocaine.",
  },
  {
    q: "What should I avoid taking with kava?",
    a: "Acetaminophen (Tylenol), benzodiazepines (Xanax, Ativan), alcohol, and St. John's Wort. Kava affects liver enzymes, which can change how your body processes some medications — so check on anything you take regularly.",
  },
  {
    q: "Can kava give you a hangover?",
    a: "No traditional hangover. A big pour right before bed can leave you a little groggy in the morning, though.",
  },
  {
    q: "Are the naktails actually alcohol-free?",
    a: "Completely alcohol-free — not low-ABV. Kava is psychoactive but not psychedelic, and it works on GABA receptors the same way a drink does. No alcohol required.",
  },
  {
    q: "Do you cater weddings and private events?",
    a: "That's most of what we do. We bring the full craft bar to Las Vegas events — private, corporate, weddings, retreats, market booths. Reach out via the events page for a quote.",
  },
  {
    q: "How do coconut rewards work?",
    a: "Earn 1 coconut per dollar spent, plus bonuses for attending events, referring friends, or posting to Instagram. Redeem for free shots, drinks, growlers, and eventually private-booking credit. Full ladder is on the Rewards page.",
  },
  {
    q: "Are you affiliated with the Lumanai Church?",
    a: "No, we're not affiliated with the Lumanai Church in any way. Our name comes from “lumana’i,” the Samoan word for “future.”",
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-16 h-96 w-96 rounded-full bg-orchid/20 blur-3xl" />
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
                  <span className="shrink-0 font-mono text-orchid transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-shell/70">{item.a}</p>
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
