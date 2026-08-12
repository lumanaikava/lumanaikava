/**
 * Our Story — copied from lumanai.com/pages/our-story.
 *
 * This is Ash's own first-person account, and the tone is the point. Do
 * not paraphrase, tighten or "improve" it. If it changes, it should be
 * because he changed it — either here or through the Command Center,
 * which overrides these blocks by id.
 */

export type StoryBlock = {
  id: string;
  /** Optional section heading. Blank renders as body-only. */
  heading: string;
  /** One string per paragraph. */
  body: string[];
};

export const STORY_LEDE =
  "Lumanai is a small but growing startup based in Las Vegas, Nevada with the singular mission of making kava a mainstream social beverage.";

export const storyBlocks: StoryBlock[] = [
  {
    id: "name",
    heading: "The name",
    body: ["Our name is based on the Samoan word for future, lumana'i."],
  },
  {
    id: "discovery",
    heading: "How it started",
    body: [
      "I'm not exactly sure when I first became aware of kava, but it definitely began with the tinctures and powders you can find on grocery store shelves in the wellness aisle. It wasn't until 2015 that I discovered traditional kava consumed as a beverage. My curiosity was piqued and I got my hands on some as soon as I could. I ended up enjoying it so much I decided to make it my career.",
      "In 2013, I happened to be in the right place at the right time and found myself with the opportunity to be trained and mentored by Julian Cox, LA's top mixologist at the time. Through him, I learned an advanced, culinary approach to crafting cocktails and found myself working in some of the best bars in Los Angeles.",
    ],
  },
  {
    id: "craft",
    heading: "Making it taste good",
    body: [
      "If you know anything about traditional kava, you probably know that it tastes, well… earthy is putting it generously. Bitter dirt water is more accurate. I knew that if I was going to make it popular it had to taste good, so I used my craft cocktail training to create a strong, water-extracted kava without the use of solvents or CO2 — the unhealthy and questionable methods, respectively — and to come up with recipes that actually taste delicious while complementing the natural flavour of kava. Because, let's face it, there's no masking it.",
    ],
  },
  {
    id: "mission",
    heading: "Why it matters",
    body: [
      "My goal is to bring kava and the culture surrounding it into mainstream consciousness. Kava's a huge economic driver in the South Pacific and the farmers who grow it live very modestly, in what I'd describe as third world conditions based on my experience in Fiji. The world needs kava now more than ever, and increased adoption can hopefully bring a concomitant boon for the farmers' way of life. By increasing the popularity of kava, more money will flow into the islands.",
    ],
  },
  {
    id: "tradition",
    heading: "Rooted in tradition",
    body: [
      "Everything we do at Lumanai is rooted in tradition, even as we innovate to make kava more approachable and enjoyable for a mass audience. If it wasn't for the 3,000 years of cultivation, we wouldn't be able to do what we do; so it's with the utmost respect for the culture of the South Pacific that we bring you the future of alcohol replacement. Our deepest gratitude goes to those who've spent their lives working with this incredible plant medicine.",
      "In the spirit of this, we donate a portion of the proceeds from every online sale to the South Pacific Islander Organization, a nonprofit creating opportunities for Pacific Islanders to create, navigate and attain higher education. As our profit margin grows, so will the percentage of our donations. As of now it's 1% but we hope to increase that very soon.",
    ],
  },
];

export const STORY_SIGNOFF = {
  farewell: "Bula vinaka",
  name: "Etienne Asher",
  title: "Founder and CEO (Chief Euphoria Officer)",
};
