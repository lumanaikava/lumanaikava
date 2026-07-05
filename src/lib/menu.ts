/**
 * Digital menu — edit this file to update what's pouring at the current event.
 * Each edit auto-deploys once you push (or shows immediately in the local dev server).
 *
 * Structure:
 *   - `event` shows above the menu (title + date + location)
 *   - `sections` are grouped drinks (e.g. Naktails, Mocktails)
 *   - `extras` are small add-ons that show at the bottom
 */

export type MenuDrink = {
  name: string;
  ingredients: string;
  note?: string;
};

export type MenuSection = {
  title: string;
  subtitle?: string;
  priceLabel: string;
  drinks: MenuDrink[];
};

export type Menu = {
  event: {
    title: string;
    date: string;
    location: string;
    tagline?: string;
  };
  sections: MenuSection[];
  extras: { label: string; priceLabel: string }[];
};

export const currentMenu: Menu = {
  event: {
    title: "Current Pour Menu",
    date: "Updates before every event",
    location: "Los Angeles · Las Vegas",
    tagline: "Ask your bartender what's new this week.",
  },
  sections: [
    {
      title: "Naktails",
      subtitle: "with kava — the buzz you can feel",
      priceLabel: "$14",
      drinks: [
        {
          name: "Warrior One",
          ingredients:
            "Lumanai kava, shilajit, muddled raspberries, handcrafted sugar-free Madagascar vanilla syrup, orange bitters, aquafaba foam",
        },
        {
          name: "Downward-Facing Grog",
          ingredients:
            "Lumanai kava, manuka honey, organic turmeric and Ceylon cinnamon, fresh ginger and lemon",
        },
        {
          name: "Kava Kolada",
          ingredients:
            "Lumanai kava, pineapple juice, fresh-pressed coconut milk, handcrafted sugar-free Madagascar vanilla syrup, vitamin C",
        },
      ],
    },
    {
      title: "Mocktails",
      subtitle: "zero-proof, still functional",
      priceLabel: "$10",
      drinks: [
        {
          name: "Šavasana Spritz",
          ingredients:
            "Handcrafted sugar-free lavender hibiscus syrup, pineapple and lemon juice, sparkling mineral water",
        },
        {
          name: "Prana Colada",
          ingredients:
            "Pineapple juice, Thai basil, fresh-pressed coconut milk, handcrafted sugar-free Madagascar vanilla syrup, CocoLove coconut water",
        },
      ],
    },
  ],
  extras: [
    { label: "Single Kava Shot", priceLabel: "$6" },
    { label: "Drink + Kava Shot", priceLabel: "+$4" },
  ],
};
