import type { Metadata } from "next";
import Link from "next/link";
import PayrollReport from "@/components/admin/PayrollReport";
import { readPayrollEntries } from "@/lib/payroll";
import {
  readSheetEntriesStrict,
  payrollSheetConfigured,
} from "@/lib/integrations/payroll-sheet";
import { getSession } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Payroll Report",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PayrollReportPage() {
  // The full report is everyone's pay in one table — owners only. Staff
  // see their own numbers on the Command Center instead.
  const session = await getSession();

  if (!session.isOwner) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {session.authed ? "Owners only" : "Crew only"}
        </p>
        <h1 className="h-sign mt-3 text-5xl text-shell">Payroll Report</h1>
        <p className="mt-4 text-shell/70">
          {session.authed ? (
            <>
              This page shows the whole crew&apos;s pay. Your own hours and
              totals are on the{" "}
              <Link
                href="/admin"
                className="prose-link text-shell hover:text-gold"
              >
                Command Center
              </Link>
              .
            </>
          ) : (
            <>
              Sign in at the{" "}
              <Link
                href="/admin"
                className="prose-link text-shell hover:text-gold"
              >
                Command Center
              </Link>{" "}
              first.
            </>
          )}
        </p>
      </section>
    );
  }

  // Same shared source of truth as the dashboard: the Google Sheet,
  // with the local backup used only if the sheet can't be reached.
  let entries;
  if (payrollSheetConfigured()) {
    try {
      entries = await readSheetEntriesStrict();
    } catch (err) {
      console.error("[report] Payroll sheet unreachable, using local backup:", err);
      entries = await readPayrollEntries();
    }
  } else {
    entries = await readPayrollEntries();
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Command Center · Payroll
          </p>
          <h1 className="h-sign mt-2 text-4xl text-shell sm:text-5xl">
            Payroll report.
          </h1>
        </div>
        <Link
          href="/admin"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-shell/60 hover:text-gold"
        >
          ← Back to Command Center
        </Link>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-shell/60">
        Every shift, sortable by any column. Filter to one employee to see
        their real totals — hours, sales, tips, and take-home — updating
        live as you narrow it down.
      </p>
      <div className="mt-8">
        <PayrollReport entries={entries} />
      </div>
    </section>
  );
}
