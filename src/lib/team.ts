/**
 * The bartenders — edit bios here. Photos live in public/images/team/;
 * leave `photo` undefined until a headshot exists and the card shows a
 * branded placeholder instead of a broken image.
 */

export type TeamMember = {
  name: string;
  role: string;
  photo?: string;
  bio: string;
};

export const team: TeamMember[] = [
  {
    name: "Ash",
    role: "Founder & Master Mixologist",
    photo: "/images/team/ash.webp",
    bio: "Trained under LA's top mixologist in the city's best cocktail bars, Ash found kava in 2015 and spent the next decade perfecting how to build real cocktails around it. Every recipe on the menu is his.",
  },
  {
    name: "Zach",
    role: "Lead Bartender & Operations Manager",
    photo: "/images/team/zach.webp",
    bio: "The hands behind the bar at markets and private events across Vegas. Fast shaker, easy conversation, and the guy who'll find your new favorite drink on the first try.",
  },
];

/** Names for the booking form's bartender picker. */
export const bartenderNames = team.map((t) => t.name);
