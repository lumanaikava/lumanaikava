/**
 * Functional ingredients used across the Lumanai naktail + mocktail bar,
 * lifted straight from the BARSIGN.
 */

export type Ingredient = {
  slug: string;
  name: string;
  category:
    "kava" | "adaptogen" | "nootropic" | "mineral" | "botanical" | "sweetener";
  claim: string;
};

export const ingredients: Ingredient[] = [
  {
    slug: "premium-noble-kava",
    name: "Premium Noble Kava",
    category: "kava",
    claim:
      "Enhances mood with social euphoria, calms the central nervous system, anti-inflammatory.",
  },
  {
    slug: "kanna-leaf-extract",
    name: "Kanna Leaf Extract",
    category: "botanical",
    claim:
      "Brightens mood, promotes emotional openness, and delivers an easygoing uplift.",
  },
  {
    slug: "lions-mane",
    name: "Lion's Mane",
    category: "nootropic",
    claim: "Supports clear-headed focus and a gently sharpened mental edge.",
  },
  {
    slug: "reishi-mushroom",
    name: "Reishi Mushroom",
    category: "adaptogen",
    claim:
      "Promotes deep calm, stress resilience, and a grounded, mellow feel.",
  },
  {
    slug: "siberian-golden-root",
    name: "Siberian Golden Root",
    category: "adaptogen",
    claim: "Clean energy, alert focus, and stress-resistant clarity.",
  },
  {
    slug: "schisandra-berry",
    name: "Schisandra Berry",
    category: "adaptogen",
    claim: "Balanced, steady vitality with a centered feel.",
  },
  {
    slug: "ashwagandha-root",
    name: "Ashwagandha Root",
    category: "adaptogen",
    claim: "Grounded calm and a smooth sense of ease.",
  },
  {
    slug: "shilajit",
    name: "Shilajit",
    category: "mineral",
    claim:
      "Acts as a grounding Himalayan resin rich in fulvic acid and minerals for overall vitality.",
  },
  {
    slug: "manuka-honey",
    name: "Manuka Honey",
    category: "sweetener",
    claim:
      "Supports immunity and gut health with powerful antibacterial compounds.",
  },
  {
    slug: "ceremonial-cacao",
    name: "Ceremonial Cacao",
    category: "botanical",
    claim: "Delivers polyphenols with subtle stimulating mood elevation.",
  },
  {
    slug: "goji-berry",
    name: "Goji Berry",
    category: "botanical",
    claim:
      "Provides antioxidant-rich support for sustained energy and vitality.",
  },
  {
    slug: "damiana-leaf",
    name: "Damiana Leaf",
    category: "botanical",
    claim: "A traditional aphrodisiac with relaxed uplift and playful vibe.",
  },
  {
    slug: "hibiscus-flower",
    name: "Hibiscus Flower",
    category: "botanical",
    claim:
      "Supplies bright, tart antioxidants that support hydration and internal balance.",
  },
];

export const categoryLabels: Record<Ingredient["category"], string> = {
  kava: "The base",
  adaptogen: "Adaptogens",
  nootropic: "Nootropics",
  mineral: "Minerals",
  botanical: "Botanicals",
  sweetener: "Sweeteners",
};
