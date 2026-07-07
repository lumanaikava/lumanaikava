/**
 * Digital menu — edit this file to update what's pouring at the current event.
 * The /menu page reproduces the Canva "Base Menu" design 1:1 from this data.
 *
 * To change a drink: name, ingredients, `image` (put the photo in
 * public/images/drinks/), and `accent` (the name's display color).
 */

export type MenuDrink = {
  name: string;
  ingredients: string;
  image?: string;
  /** Display color for the drink name, from the Canva menu. */
  accent?: string;
};

export type MenuSection = {
  title: string;
  price: string;
  drinks: MenuDrink[];
};

export type Menu = {
  event: {
    title: string;
    location: string;
  };
  sections: MenuSection[];
  extras: { label: string; price: string; accent?: string }[];
  addOn?: { label: string; highlight: string; price: string };
};

export const currentMenu: Menu = {
  event: {
    title: "Base Menu",
    location: "Las Vegas, NV",
  },
  sections: [
    {
      title: "Craft Kava Naktails",
      price: "15",
      drinks: [
        {
          name: "Hive Mind",
          ingredients:
            "LUMANAI KAVA · Clover Honey · Fresh Ginger · Lemon Essence",
          image: "/images/drinks/hive-mind.png",
          accent: "#e8871f",
        },
        {
          name: "Pacific Rim",
          ingredients:
            "LUMANAI KAVA · Pineapple Juice · Fresh-Pressed Coconut Milk · Madagascar Vanilla Bean · Vitamin C",
          image: "/images/drinks/pacific-rim.png",
          accent: "#8aa32b",
        },
      ],
    },
    {
      title: "Functional Mocktail",
      price: "13",
      drinks: [
        {
          name: "Adapterol Spritz",
          ingredients:
            "Damiana Flower · Schisandra Berry · Handcrafted Sugar-Free Syrup · Pineapple & Lemon Juice · Raspberry Rose Poppi",
          image: "/images/drinks/adapterol-spritz.png",
          accent: "#a93343",
        },
      ],
    },
  ],
  extras: [
    { label: "Kava Shot", price: "6", accent: "#185c7c" },
    { label: "Shot & Drink Combo", price: "+3", accent: "#6b3a9c" },
  ],
  addOn: {
    label: "+ Add",
    highlight: "RUSH Instant Kava",
    price: "+4",
  },
};
