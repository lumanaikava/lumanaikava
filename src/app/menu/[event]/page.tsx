import type { Metadata } from "next";
import Link from "next/link";
import MenuCard from "@/components/MenuCard";
import { upcomingEventsSynced, formatEventDate } from "@/lib/calendar";
import { eventSlug, menuForEvent } from "@/lib/event-menu";
import {
  readMenusSafe,
  contentSheetConfigured,
} from "@/lib/integrations/content-sheet";

export const revalidate = 60;

/** Twelve weeks back and forward, so a menu link still works the morning after. */
async function findEvent(slug: string) {
  const events = await upcomingEventsSynced(new Date(), 12);
  return events.find((e) => eventSlug(e.date, e.title) === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ event: string }>;
}): Promise<Metadata> {
  const { event } = await params;
  const found = await findEvent(event);
  return {
    title: found ? `${found.title} — Menu` : "Menu — Lumanai Kava",
  };
}

/**
 * The menu for one event.
 *
 * Starts from the live Base Menu and applies that event's edits. An
 * event with no edits shows the base unchanged, so a QR code printed for
 * the booth is never broken and never blank — the worst case is the
 * house menu, which is still correct.
 */
export default async function EventMenuPage({
  params,
}: {
  params: Promise<{ event: string }>;
}) {
  const { event: slug } = await params;
  const found = await findEvent(slug);

  const overrides = contentSheetConfigured() ? await readMenusSafe() : [];
  const override = overrides.find((o) => o.key === slug);

  const menu = menuForEvent(
    override,
    found?.title ?? "Tonight",
    found?.location,
  );

  const when = found ? formatEventDate(found.date) : null;

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 pt-6 text-center">
        {when && (
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
            {when.weekday} {when.month} {when.day}
            {found?.time ? ` · ${found.time}` : ""}
          </p>
        )}
        {override?.note && (
          <p className="mt-2 text-sm text-shell/70">{override.note}</p>
        )}
      </div>

      <MenuCard menu={menu} />

      <div className="pb-10 text-center">
        <Link
          href="/find-us"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50 hover:text-gold"
        >
          ← Where else to find us
        </Link>
      </div>
    </>
  );
}
