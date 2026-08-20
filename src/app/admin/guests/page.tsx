import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";
import GuestList from "@/components/admin/GuestList";
import { loadGuestBoard } from "@/lib/guest-board";
import { getSession } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Guest List",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function GuestsPage() {
  // Guest contact details are customer data — owners only.
  const session = await getSession();

  if (!session.isOwner) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {session.authed ? "Owners only" : "Crew only"}
        </p>
        <h1 className="h-sign mt-3 text-5xl text-shell">Guest List</h1>
        {session.authed ? (
          <p className="mt-4 text-shell/70">
            Ash or Zach can get you what you need from the list.
          </p>
        ) : (
          <LoginForm />
        )}
      </section>
    );
  }

  const board = await loadGuestBoard();

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Lumanai Launch · Fri Aug 28
          </p>
          <h1 className="h-sign mt-2 text-5xl text-shell">Guest list</h1>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-shell/25 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-shell hover:border-gold hover:text-gold"
        >
          ← Command Center
        </Link>
      </div>

      <p className="mt-3 max-w-2xl text-sm text-shell/60">
        The whole room in one list. Add anyone you&rsquo;re working on —
        with any mix of phone, email or Instagram — and tick each channel
        as you reach out. Hit <b>Secure spot</b> when they&rsquo;re a yes,
        then <b>Check in</b> as they walk through the door.
      </p>

      {/* Setup gaps, stated plainly rather than failing quietly. */}
      {!board.sheetReady && (
        <p className="mt-5 rounded-3xl border border-coconut/30 bg-coconut/10 p-5 text-sm text-coconut">
          <b>Read-only right now.</b> The Guest List sheet isn't connected,
          so leads can't be saved and statuses won't stick. Setup takes
          about ten minutes — see <b>Guest List Sheet Setup.md</b> in the
          Lumanai Business folder, then add{" "}
          <b>GUESTLIST_SHEET_WEBHOOK_URL</b> in Vercel.
        </p>
      )}
      {board.warnings.map((w) => (
        <p
          key={w}
          className="mt-4 rounded-3xl border border-coconut/30 bg-coconut/10 p-5 text-sm text-coconut"
        >
          {w}
        </p>
      ))}

      <div className="mt-6">
        <GuestList
          initialGuests={board.guests}
          canWrite={board.sheetReady}
          canSeed={board.sheetReady && session.isOwner}
        />
      </div>
    </section>
  );
}
