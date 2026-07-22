import {
  entryToValues,
  type PayrollEntry,
  type CommissionTier,
} from "@/lib/payroll";

/**
 * Payroll → Google Sheet, via a bound Apps Script Web App.
 *
 * On a deployed (serverless) host the app can't write local files, so
 * the canonical payroll ledger is a Google Sheet. A tiny Apps Script
 * bound to that sheet exposes a URL that:
 *   • POST  → appends one row
 *   • GET   → returns recent rows (newest first)
 *
 * Setup lives in "Payroll Sheet Setup.md" (Lumanai Business folder).
 * Until PAYROLL_SHEET_WEBHOOK_URL is set the app falls back to the local
 * CSV, so nothing breaks before the script is deployed.
 */

const URL = process.env.PAYROLL_SHEET_WEBHOOK_URL;
const SECRET = process.env.PAYROLL_SHEET_SECRET ?? "";

export function payrollSheetConfigured(): boolean {
  return Boolean(URL);
}

export async function appendEntryToSheet(entry: PayrollEntry): Promise<void> {
  if (!URL) throw new Error("Payroll sheet webhook not configured.");
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: SECRET, values: entryToValues(entry) }),
    // Apps Script 302-redirects to its content host; follow it.
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Payroll sheet POST ${res.status}`);
}

type SheetRow = (string | number)[];

/** Recent entries from the sheet, newest first. Empty on any failure. */
export async function readSheetEntries(): Promise<PayrollEntry[]> {
  if (!URL) return [];
  try {
    const sep = URL.includes("?") ? "&" : "?";
    const res = await fetch(
      `${URL}${sep}list=1&secret=${encodeURIComponent(SECRET)}`,
      { cache: "no-store", redirect: "follow" },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { rows?: SheetRow[] };
    const rows = data.rows ?? [];
    return rows.map(rowToEntry).reverse();
  } catch {
    return [];
  }
}

function rowToEntry(c: SheetRow): PayrollEntry {
  const s = (v: unknown) => String(v ?? "");
  const n = (v: unknown) => Number(v) || 0;
  return {
    timestamp: s(c[0]),
    employee: s(c[1]),
    event: s(c[2]),
    eventDate: s(c[3]),
    hours: n(c[4]),
    sales: n(c[5]),
    commissionPct: (n(c[6]) || 10) as CommissionTier,
    commissionAmt: n(c[7]),
    tips: n(c[8]),
    bonus: n(c[9]),
    expenses: n(c[10]),
    expenseNote: s(c[11]),
    totalPayout: n(c[12]),
    loggedBy: s(c[13]),
  };
}
