import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";
import ContentManager from "@/components/admin/ContentManager";
import { getSession } from "@/lib/admin-session";
import {
  readEventsSafe,
  readFaqSafe,
  contentSheetConfigured,
} from "@/lib/integrations/content-sheet";

export const metadata: Metadata = {
  title: "Site Content",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const session = await getSession();

  if (!session.isOwner) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {session.authed ? "Owners only" : "Crew only"}
        </p>
        <h1 className="h-sign mt-3 text-5xl text-shell">Site Content</h1>
        {session.authed ? (
          <p className="mt-4 text-shell/70">
            Ash or Zach can make changes to the site.
          </p>
        ) : (
          <LoginForm />
        )}
      </section>
    );
  }

  const ready = contentSheetConfigured();
  const [events, faq] = ready
    ? await Promise.all([readEventsSafe(), readFaqSafe()])
    : [[], []];

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Command Center
          </p>
          <h1 className="h-sign mt-2 text-5xl text-shell">Site content</h1>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-shell/25 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-shell hover:border-gold hover:text-gold"
        >
          ← Command Center
        </Link>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-shell/60">
        Add, edit and remove upcoming appearances and FAQ answers. Changes
        go live within a minute — no deploy, nothing to ask me for. The
        weekly markets are generated automatically and don&apos;t need
        adding here.
      </p>

      <div className="mt-7">
        <ContentManager
          initialEvents={events}
          initialFaq={faq}
          ready={ready}
        />
      </div>
    </section>
  );
}
