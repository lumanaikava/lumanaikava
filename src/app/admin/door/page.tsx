import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";
import DoorScanner from "@/components/party/DoorScanner";
import EventMark from "@/components/party/EventMark";
import { getSession } from "@/lib/admin-session";
import { ticketSecretConfigured } from "@/lib/ticket-token";

export const metadata: Metadata = {
  title: "Door",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The door, for whoever is working it.
 *
 * Any signed-in crew, not owners only — Jadon is on the door and Jadon
 * is staff. It shows a name and a tier, which the person holding the
 * ticket is about to say out loud anyway; that's a very different
 * disclosure from the guest list's emails and phone numbers.
 */
export default async function DoorPage() {
  const session = await getSession();

  if (!session.authed) {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
          Crew only
        </p>
        <h1 className="h-sign mt-3 text-5xl text-shell">Door</h1>
        <p className="mt-4 text-sm text-shell/60">
          Sign in to scan tickets.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </section>
    );
  }

  return (
    <div className="luna">
      <section className="relative min-h-[100svh] overflow-hidden px-5 py-8">
        <div className="luna-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="luna-roots luna-roots--soft" aria-hidden />

        <div className="relative mx-auto max-w-md">
          <div className="flex items-center gap-3">
            <EventMark className="h-11 w-11 shrink-0" sizes="44px" />
            <div className="min-w-0">
              <h1 className="h-sign text-2xl leading-none text-shell">
                Door
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/40">
                Luna Ekliptika · {session.name}
              </p>
            </div>
            <Link
              href="/admin"
              className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-shell/40 hover:text-gold"
            >
              Admin
            </Link>
          </div>

          {!ticketSecretConfigured() ? (
            <div className="mt-8 rounded-2xl border border-coconut/40 bg-coconut/10 p-5">
              <p className="text-sm text-coconut">
                <b>TICKET_SECRET isn&rsquo;t set.</b> No ticket can be
                issued or checked until it is — add it in Vercel and
                redeploy. Without it every scan would say &ldquo;not
                valid&rdquo;, including real tickets.
              </p>
            </div>
          ) : (
            <div className="mt-7">
              <DoorScanner />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
