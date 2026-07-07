/**
 * Event packages + pricing — mirrors the "LUMANAI Event Experiences & Pricing" deck.
 * Pricing reflects events within the Las Vegas metro area; final pricing may vary
 * based on guest count, duration, customization, and event requirements.
 */

export type PackageTier = {
  guests: string;
  price: string;
  /** Numeric price for the interactive builder's math. */
  amount: number;
};

export type EventPackage = {
  number: string;
  name: string;
  features: string[];
  tiers: PackageTier[];
  highlight?: boolean;
};

export const eventPackages: EventPackage[] = [
  {
    number: "01",
    name: "Luxury Immersive Kava Ceremony",
    highlight: true,
    features: [
      "Open craft kava + functional mocktail bar",
      "Guided multi-step ceremony with cultural storytelling",
      "Custom mocktail created exclusively for the event",
      "Elevated floral & botanical garnishes",
      "Complimentary bottle of LUMANAI kava for each guest",
    ],
    tiers: [
      { guests: "10–30 guests", price: "$2,750", amount: 2750 },
      { guests: "31–40 guests", price: "$3,550", amount: 3550 },
      { guests: "41–50 guests", price: "$4,500", amount: 4500 },
    ],
  },
  {
    number: "02",
    name: "Full Open Craft Kava & Functional Mocktail Bar",
    features: [
      "Unlimited handcrafted kava & functional mocktails",
      "Premium noble kava",
      "Traditional kava shots",
      "Elevated bar presentation & garnishes",
    ],
    tiers: [
      { guests: "10–30 guests", price: "$1,250", amount: 1250 },
      { guests: "31–60 guests", price: "$2,250", amount: 2250 },
      { guests: "61–100 guests", price: "$3,500", amount: 3500 },
    ],
  },
  {
    number: "03",
    name: "Signature Drink + Shot Package",
    features: [
      "One signature kava or functional mocktail per guest",
      "One traditional kava shot per guest",
      "Additional drinks available for purchase",
    ],
    tiers: [
      { guests: "10–30 guests", price: "$750", amount: 750 },
      { guests: "31–60 guests", price: "$1,250", amount: 1250 },
      { guests: "61–100 guests", price: "$1,500", amount: 1500 },
    ],
  },
  {
    number: "04",
    name: "Paid Craft Kava Bar",
    features: [
      "All drinks available for purchase",
      "We just show up!",
    ],
    tiers: [{ guests: "Any size", price: "Free to host", amount: 0 }],
  },
];

export type ExperienceUpgrade = {
  name: string;
  price: string;
  /** Numeric price for the interactive builder's math. */
  amount: number;
  items: { name: string; copy: string }[];
};

export const experienceUpgrades: ExperienceUpgrade[] = [
  {
    name: "Ancient Plant Medicine",
    price: "$300",
    amount: 300,
    items: [
      {
        name: "Kratom Leaf",
        copy: "Smooth energy with a relaxed, euphoric edge (non-extract)",
      },
      {
        name: "Kanna Leaf Extract",
        copy: "Brightened mood, emotional openness, and easygoing uplift",
      },
    ],
  },
  {
    name: "Medicinal Mushroom",
    price: "$150",
    amount: 150,
    items: [
      {
        name: "Lion's Mane",
        copy: "Clear-headed focus and a gently sharpened mental edge",
      },
      {
        name: "Reishi",
        copy: "Deep calm and stress resilience with a grounded, mellow feel",
      },
    ],
  },
  {
    name: "Athletic Performance",
    price: "$125",
    amount: 125,
    items: [
      {
        name: "Grass-Fed Whey Protein",
        copy: "Incorporated into a rich and creamy shake",
      },
      {
        name: "Electrolytes",
        copy: "Essential micronutrients for improved cognition and endurance",
      },
      {
        name: "Micronized Creatine",
        copy: "Cognitive enhancement and physical readiness",
      },
    ],
  },
  {
    name: "Biohacker Optimization",
    price: "$125",
    amount: 125,
    items: [
      {
        name: "Shilajit",
        copy: "Grounding Himalayan resin rich in fulvic acid and minerals",
      },
      {
        name: "L-Theanine",
        copy: "Amino acid for calm clarity and relaxation without drowsiness",
      },
      {
        name: "L-Tyrosine",
        copy: "Dopamine-boosting amino acid for clean motivation and drive",
      },
    ],
  },
];

export const upgradeBundle = { name: "Complete Upgrade Bundle", price: "$500", amount: 500 };
