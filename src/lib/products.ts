export type Product = {
  handle: string;
  name: string;
  category: "premium" | "growler";
  price: number;
  priceLabel: string;
  reviewCount: number;
  notes: string;
  description: string;
  image?: string;
};

// Shaped to line up with the Shopify Storefront API product/variant fields,
// so this file can be swapped for a live fetch without touching page markup.
export const products: Product[] = [
  {
    handle: "the-kolada",
    name: "The Kolada",
    category: "premium",
    price: 10,
    priceLabel: "$10.00",
    reviewCount: 2,
    notes: "Coconut cream · pineapple · toasted vanilla",
    description:
      "A kava riff on the classic piña colada — fresh coconut milk and pineapple built around our water-extracted Fijian kava base.",
    image: "/images/drinks/kolada.png",
  },
  {
    handle: "raspberry-orange-spice",
    name: "Raspberry Orange Spice",
    category: "premium",
    price: 10,
    priceLabel: "$10.00",
    reviewCount: 4,
    notes: "Raspberry · blood orange · cardamom",
    description:
      "Tart raspberry and bright citrus over a warm spice finish, cut with kava's natural earthiness.",
    image: "/images/drinks/grog.png",
  },
  {
    handle: "ginger-honey-lemon",
    name: "Ginger Honey Lemon",
    category: "premium",
    price: 10,
    priceLabel: "$10.00",
    reviewCount: 6,
    notes: "Fresh ginger · raw honey · lemon",
    description:
      "Our most-poured batch — fresh-pressed ginger and lemon balanced with raw honey, built for sipping slow.",
    image: "/images/drinks/warrior.png",
  },
  {
    handle: "basic-batch-growler",
    name: "Basic Batch Growler",
    category: "growler",
    price: 35,
    priceLabel: "From $35.00",
    reviewCount: 15,
    notes: "Unflavored · traditional strength",
    description:
      "Straight, traditional-strength kava for the table — share-sized, no flavoring, full potency.",
  },
  {
    handle: "raspberry-orange-spice-growler",
    name: "Raspberry Orange Spice Growler",
    category: "growler",
    price: 35,
    priceLabel: "From $35.00",
    reviewCount: 5,
    notes: "Raspberry · blood orange · cardamom",
    description:
      "The Raspberry Orange Spice batch, poured by the growler for the group.",
  },
  {
    handle: "the-kolada-growler",
    name: "The Kolada Growler",
    category: "growler",
    price: 35,
    priceLabel: "From $35.00",
    reviewCount: 6,
    notes: "Coconut cream · pineapple · toasted vanilla",
    description: "The Kolada batch, poured by the growler for the group.",
  },
  {
    handle: "ginger-honey-lemon-growler",
    name: "Ginger Honey Lemon Growler",
    category: "growler",
    price: 35,
    priceLabel: "From $35.00",
    reviewCount: 7,
    notes: "Fresh ginger · raw honey · lemon",
    description:
      "The Ginger Honey Lemon batch, poured by the growler for the group.",
  },
];

export function getProduct(handle: string) {
  return products.find((p) => p.handle === handle);
}
