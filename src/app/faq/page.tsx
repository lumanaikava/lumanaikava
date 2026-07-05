import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ — Lumanai Kava" };

const faqs = [
  {
    q: "How much should I drink?",
    a: "Kava affects everyone differently depending on liver enzymes and neurophysiology. Start with at least 4 oz of the Basic Batch, or the full 8 oz bottle of a flavored drink. After a session or two, reverse tolerance kicks in and 2–4 oz may get you to the same place. Best sipped 2–3 hours after eating. Nausea means you've had enough.",
  },
  {
    q: "Is kava bad for your liver?",
    a: "This is a common misconception. Kava has been consumed safely for thousands of years across the Pacific Islands with no liver damage on record, and it's served in roughly 200 U.S. kava bars without known incidents. The World Health Organization now recognizes kava's safety.",
  },
  {
    q: "Can I drink kava if I'm pregnant or breastfeeding?",
    a: "We'd recommend erring on the side of caution and avoiding kava during pregnancy and nursing — the safety research just isn't there yet.",
  },
  {
    q: "Why is my mouth tingly?",
    a: "Completely normal, not an allergic reaction. Kavain, one of kava's active compounds, works as a numbing agent — similar to lidocaine or Novocain.",
  },
  {
    q: "What should I avoid taking with kava?",
    a: "Acetaminophen (Tylenol), benzodiazepines (Xanax, Ativan), alcohol, and St. John's Wort. Kava affects liver enzymes, which can change how your body processes certain medications — so it's worth checking on anything you take regularly.",
  },
  {
    q: "Are there side effects?",
    a: "Kava is a natural diuretic, so it can lead to dehydration and dry skin. Overdoing it may cause nausea or vomiting.",
  },
  {
    q: "Can kava give you a hangover?",
    a: "No traditional hangover. Large amounts right before bed can leave you a little groggy the next morning, though.",
  },
  {
    q: "Is kava like kratom?",
    a: "No. Kratom affects opioid receptors and carries addiction risk. Kava acts on GABA receptors and is non-addictive.",
  },
  {
    q: "Is kava like kombucha?",
    a: "No. Kava is completely alcohol-free with psychoactive — not psychedelic — effects. Kombucha typically contains trace alcohol but has no psychoactive effect.",
  },
  {
    q: "Are you affiliated with the Lumanai Church?",
    a: "No, we're not affiliated with the Lumanai Church in any way. Our name comes from “lumana’i,” the Samoan word for “future.”",
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-jade">
        FAQ
      </p>
      <h1 className="mt-4 font-display text-4xl italic sm:text-5xl">
        Questions, answered straight.
      </h1>

      <div className="mt-12 divide-y divide-ink/10 border-t border-ink/10">
        {faqs.map((item) => (
          <details key={item.q} className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg text-ink">
              {item.q}
              <span className="shrink-0 font-mono text-jade transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-ink/70">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
