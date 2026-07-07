/**
 * Digital menu — edit this file to update what's pouring at the current event.
 * Changes show immediately in local dev; on the live site they deploy on push.
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
    title: "Base Menu",
    date: "Pouring now",
    location: "Las Vegas, NV",
    tagline: "Ask your bartender what's new this week.",
  },
  sections: [
    {
      title: "Craft Kava Naktails",
      subtitle: "with kava — the buzz you can feel",
      priceLabel: "$15",
      drinks: [
        {
          name: "Hive Mind",
          ingredients:
            "Lumanai kava · clover honey · fresh ginger · lemon essence",
        },
        {
          name: "Pacific Rim",
          ingredients:
            "Lumanai kava · pineapple juice · fresh-pressed coconut milk · Madagascar vanilla bean · vitamin C",
        },
      ],
    },
    {
      title: "Functional Mocktail",
      subtitle: "zero-proof, still functional",
      priceLabel: "$13",
      drinks: [
        {
          name: "Adapterol Spritz",
          ingredients:
            "Damiana flower · schisandra berry · handcrafted sugar-free syrup · pineapple & lemon juice · Raspberry Rose Poppi",
        },
      ],
    },
  ],
  extras: [
    { label: "Kava Shot", priceLabel: "$6" },
    { label: "Shot & Drink Combo", priceLabel: "+$3" },
    { label: "Add RUSH instant kava to any drink", priceLabel: "+$4" },
  ],
};
