import { ingredients, type Ingredient } from "@/lib/ingredients";

/**
 * The drinks database — every pour, its functional stack, and (soon)
 * real nutrition numbers. The ingredients page reads this to show
 * "Found in: …" per ingredient; a future nutrition page can render the
 * whole thing.
 *
 * `functional` entries are slugs from src/lib/ingredients.ts (typo-safe
 * via the Ingredient type). `alsoIn` is everything else in the glass.
 * Calories are ESTIMATES until the real numbers come from the kitchen —
 * they render with a ~ prefix everywhere.
 */

export type DrinkRecord = {
  slug: string;
  name: string;
  kind: "naktail" | "mocktail" | "shot" | "instant";
  accent: string;
  image?: string;
  functional: Ingredient["slug"][];
  alsoIn: string[];
  calories?: number;
  caloriesEstimated?: boolean;
};

export const drinks: DrinkRecord[] = [
  {
    slug: "hive-mind",
    name: "Hive Mind",
    kind: "naktail",
    accent: "#e8871f",
    image: "/images/drinks/clear/hive-mind.png",
    functional: ["premium-noble-kava", "manuka-honey"],
    alsoIn: ["Fresh ginger", "Lemon essence"],
    calories: 90,
    caloriesEstimated: true,
  },
  {
    slug: "pacific-rim",
    name: "Pacific Rim",
    kind: "naktail",
    accent: "#8aa32b",
    image: "/images/drinks/clear/pacific-rim.png",
    functional: ["premium-noble-kava"],
    alsoIn: [
      "Pineapple juice",
      "Fresh-pressed coconut milk",
      "Madagascar vanilla bean",
      "Vitamin C",
    ],
    calories: 140,
    caloriesEstimated: true,
  },
  {
    slug: "adapterol-spritz",
    name: "Adapterol Spritz",
    kind: "mocktail",
    accent: "#a93343",
    image: "/images/drinks/clear/adapterol-spritz.png",
    functional: ["damiana-leaf", "schisandra-berry"],
    alsoIn: [
      "Handcrafted sugar-free syrup",
      "Pineapple & lemon juice",
      "Raspberry Rose Poppi",
    ],
    calories: 60,
    caloriesEstimated: true,
  },
  {
    slug: "kava-shot",
    name: "Kava Shot",
    kind: "shot",
    accent: "#185c7c",
    functional: ["premium-noble-kava"],
    alsoIn: [],
    calories: 15,
    caloriesEstimated: true,
  },
  {
    slug: "rush",
    name: "RUSH Instant Kava",
    kind: "instant",
    accent: "#ede2b4",
    functional: ["premium-noble-kava"],
    alsoIn: [],
    calories: 10,
    caloriesEstimated: true,
  },
];

/** Drinks that pour a given functional ingredient. */
export function drinksWithIngredient(slug: Ingredient["slug"]): DrinkRecord[] {
  return drinks.filter((d) => d.functional.includes(slug));
}

/** Full ingredient records for one drink, for a nutrition/menu detail view. */
export function ingredientsOfDrink(drink: DrinkRecord): Ingredient[] {
  return drink.functional
    .map((slug) => ingredients.find((i) => i.slug === slug))
    .filter((i): i is Ingredient => Boolean(i));
}
