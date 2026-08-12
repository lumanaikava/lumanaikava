import { currentMenu, type Menu, type MenuDrink } from "@/lib/menu";

/**
 * Per-event menus.
 *
 * The live Base Menu in `menu.ts` is the starting point for every event.
 * A row in the Menus tab then edits it for one night — pull a drink,
 * add a special, rename the header — WITHOUT copying the whole menu.
 * Copies rot: change the base and every duplicate silently goes stale.
 *
 * An event with no row simply shows the base, so a menu link is never
 * broken and never blank.
 */

export type EventMenuOverride = {
  /** Matches the event's slug. */
  key: string;
  /** Replaces the menu header. Blank keeps the event's own title. */
  headline: string;
  /** Drink names removed from the base, case-insensitive. */
  hide: string[];
  /** One-off pours for this event: name + ingredients. */
  add: { name: string; ingredients: string }[];
  /** A line under the header — "cash only", "last pour 10pm". */
  note: string;
};

export const MENU_COLUMNS = [
  "Event Key",
  "Headline",
  "Hide",
  "Add",
  "Note",
] as const;

/**
 * A stable, URL-safe key for an event. Date-prefixed so a recurring
 * title ("First Friday") gets its own menu each month rather than every
 * occurrence sharing one.
 */
export function eventSlug(date: string, title: string): string {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${date}-${clean}`;
}

const s = (v: unknown) => String(v ?? "").trim();

export function overrideToValues(o: EventMenuOverride): (string | number)[] {
  return [
    o.key,
    o.headline,
    o.hide.join(", "),
    o.add.map((a) => `${a.name} :: ${a.ingredients}`).join(" ; "),
    o.note,
  ];
}

export function valuesToOverride(c: (string | number)[]): EventMenuOverride {
  return {
    key: s(c[0]),
    headline: s(c[1]),
    hide: s(c[2])
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
    add: s(c[3])
      .split(";")
      .map((chunk) => {
        const [name, ...rest] = chunk.split("::");
        return { name: s(name), ingredients: s(rest.join("::")) };
      })
      .filter((a) => a.name),
    note: s(c[4]),
  };
}

/**
 * Apply one event's edits to the base menu.
 *
 * Added drinks land in the first section, which is where the naktails
 * live — a special is a naktail in practice, and giving it its own
 * section for one item would read as an error.
 */
export function menuForEvent(
  override: EventMenuOverride | undefined,
  eventTitle: string,
  location?: string,
): Menu {
  const hide = new Set((override?.hide ?? []).map((h) => h.toLowerCase()));

  const sections = currentMenu.sections.map((section, i) => {
    const kept = section.drinks.filter(
      (d) => !hide.has(d.name.trim().toLowerCase()),
    );
    if (i !== 0 || !override?.add.length) return { ...section, drinks: kept };

    const extras: MenuDrink[] = override.add.map((a) => ({
      name: a.name,
      ingredients: a.ingredients,
      accent: "#ede2b4",
    }));
    return { ...section, drinks: [...kept, ...extras] };
  });

  return {
    ...currentMenu,
    event: {
      title: override?.headline || eventTitle,
      location: location || currentMenu.event.location,
    },
    // Sections that lost every drink shouldn't render as an empty band.
    sections: sections.filter((sec) => sec.drinks.length > 0),
  };
}
