/**
 * The FAQ — copied verbatim from the live lumanai.com/pages/faq.
 *
 * These answers are the ones customers have already been reading for
 * years, and several make safety claims (liver, medication interactions,
 * pregnancy). Don't paraphrase them casually — if the wording changes it
 * should be because Ash decided it changed.
 *
 * Answers are arrays so multi-paragraph entries keep their breaks. This
 * shape is what the Command Center editor writes to.
 */

export type FaqItem = {
  q: string;
  /** One string per paragraph. */
  a: string[];
};

export const faqs: FaqItem[] = [
  {
    q: "How much should I drink?",
    a: [
      "Kava affects everyone differently depending on factors like type and quantity of liver enzymes and neurophysiology, so tolerances can vary quite a bit. Additionally, it's more potent on an empty stomach, so it's best consumed 2–3 hours after your last meal. However, drinking too much on an empty stomach can sometimes lead to nausea due to the accumulation of sediment.",
      "Many people experience what's called a \"reverse tolerance,\" meaning you may need a larger amount for your first or even first few times. We recommend starting with at least 4 oz of the Basic Batch or the full 8 oz bottle of one of our flavored drinks but more can be consumed if needed. Once the initial effects wear off, you'll need less to maintain the desired mood-lifting effects, and after your first few kava sessions, you may only need 2–4 oz to achieve the same experience. Some of our customers report feeling great with just ⅓ of an 8 oz bottle but most people will get 1–2 servings out of our flavors and 2–3 out of our Basic Batch. This is why our growlers are such a great option.",
      "Since kava is a potent plant medicine, always drink responsibly. If you experience nausea, this may indicate that you've reached your personal limit. Discontinue use temporarily if this occurs. This is more common when drinking on an empty stomach or in excessively large doses.",
    ],
  },
  {
    q: "Is kava bad for your liver?",
    a: [
      "This is a common misconception. Kava has been consumed safely for thousands of years in the Pacific Islands without causing liver damage. It is also widely enjoyed in around 200 kava bars across the United States with no known incidents of harm. For more information, there are plenty of studies and resources on the web that explain kava's safety. Additionally, the World Health Organization now recognizes the safety of kava.",
    ],
  },
  {
    q: "Can I drink kava if I'm pregnant or breastfeeding?",
    a: [
      "Since there isn't enough research on the safety of kava during pregnancy or breastfeeding, we recommend erring on the side of caution and avoiding kava if you're pregnant or nursing.",
    ],
  },
  {
    q: "Why is my mouth tingly?",
    a: [
      "The numbing sensation is completely normal and not an allergic reaction. It happens because one of the active compounds in kava, Kavain, acts as a numbing agent, similar to lidocaine or Novocain. Many people actually enjoy this part of the experience!",
    ],
  },
  {
    q: "What should I avoid taking with kava?",
    a: [
      "We advise against using acetaminophen (Tylenol) while drinking kava, as it could potentially put excessive strain on the liver. Even a slight overdose of acetaminophen can harm the liver.",
      "If you're on any medications, we recommend doing some research (e.g., \"Kava + [medication name]\") to check for potential interactions. Kava affects liver enzymes, which could alter the way your body processes certain medications.",
      "Additionally, avoid mixing kava with benzodiazepines (e.g., Xanax, Ativan), as this combination can amplify the medication's sedative effects. Mixing alcohol with kava is also not recommended due to the potential risk of liver strain and increased intoxication. St. John's Wort may also intensify the sedative effects of kava.",
    ],
  },
  {
    q: "Are there side effects?",
    a: [
      "Like any plant medicine, kava can have some side effects, especially when consumed frequently or excessively. Kava is a natural diuretic, meaning it can lead to dehydration and dry skin. To avoid this, make sure to stay hydrated, especially with electrolytes (we recommend high-sodium options), and moisturize your skin regularly.",
      "Overconsumption or drinking on an empty stomach can lead to nausea or, in rare cases, vomiting. If this happens, stop drinking kava until the discomfort subsides.",
    ],
  },
  {
    q: "Can kava give you a hangover?",
    a: [
      "No, kava doesn't cause hangovers in the same way alcohol does. If you drink a large amount before bed, you may wake up feeling a bit groggy, but it won't be like a traditional alcohol hangover.",
    ],
  },
  {
    q: "Is kava like kratom?",
    a: [
      "No, although both are psychoactive plants from different parts of the world that start with a \"K,\" they are very different. Kratom affects the opioid receptors in the brain and causes an elevated risk of addiction. Kava, on the other hand, acts on GABA receptors and is non-addictive.",
    ],
  },
  {
    q: "Is kava like kombucha?",
    a: [
      "Nope! Kava is completely alcohol-free and has psychoactive (not psychedelic) effects. Kombucha, on the other hand, contains small amounts of alcohol but does not produce psychoactive effects.",
    ],
  },
  {
    q: "Are you affiliated with Lumanai Church?",
    a: [
      "No, we are not affiliated with the Lumanai Church in any way. Our name is derived from the Samoan word for \"future\", Lumana'i, and we had no knowledge of the church when choosing it.",
    ],
  },
];
