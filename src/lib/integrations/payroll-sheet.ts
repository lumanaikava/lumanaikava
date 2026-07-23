import {
  entryToValues,
  type PayrollEntry,
  type PayrollKind,
  type CommissionTier,
} from "@/lib/payroll";

/**
 * Payroll → Google Sheet, via a bound Apps Script Web App.
 *
 * On a deployed (serverless) host the app can't write local files, so
 * the canonical payroll ledger is a Google Sheet. A tiny Apps Script
 * bound to that sheet exposes a URL that:
 *   • POST { action: "append", values }        → appends one row
 *   • POST { action: "replace", rows }          → rewrites every data row
 *   • GET  ?list=1                              → returns recent rows
 *
 * "replace" is how edits and deletes work: read every row, mutate the
 * one that changed (or drop it) in JS, then send the whole list back —
 * simpler and safer than asking Apps Script to find-and-patch one row.
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

/** POST to the webhook and surface Apps Script's embedded {error} — the
 * script always answers HTTP 200, so errors (bad secret, etc.) only show
 * up in the JSON body, not the status code. */
async function callSheet(body: Record<string, unknown>): Promise<unknown> {
  if (!URL) throw new Error("Payroll sheet webhook not configured.");
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: SECRET, ...body }),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Payroll sheet ${res.status}`);
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (data.error) throw new Error(`Payroll sheet: ${data.error}`);
  return data;
}

export async function appendEntryToSheet(entry: PayrollEntry): Promise<void> {
  await callSheet({ action: "append", values: entryToValues(entry) });
}

/** Rewrite every data row in the sheet with this exact list. */
async function replaceAllSheetRows(entries: PayrollEntry[]): Promise<void> {
  await callSheet({ action: "replace", rows: entries.map(entryToValues) });
}

/** Edit one entry in place (matched by timestamp), then rewrite the sheet. */
export async function updateEntryInSheet(
  timestamp: string,
  updated: PayrollEntry,
): Promise<void> {
  const all = await readSheetEntriesRaw();
  const idx = all.findIndex((e) => e.timestamp === timestamp);
  if (idx === -1) throw new Error("Entry not found in the Payroll Sheet.");
  all[idx] = updated;
  await replaceAllSheetRows(all);
}

/** Remove one entry (matched by timestamp), then rewrite the sheet. */
export async function deleteEntryFromSheet(timestamp: string): Promise<void> {
  const all = await readSheetEntriesRaw();
  await replaceAllSheetRows(all.filter((e) => e.timestamp !== timestamp));
}

type SheetRow = (string | number)[];

/** Raw rows in sheet order (oldest first). Empty on any failure. */
async function readSheetEntriesRaw(): Promise<PayrollEntry[]> {
  if (!URL) return [];
  try {
    const sep = URL.includes("?") ? "&" : "?";
    const res = await fetch(
      `${URL}${sep}list=1&secret=${encodeURIComponent(SECRET)}`,
      { cache: "no-store", redirect: "follow" },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { rows?: SheetRow[]; error?: string };
    if (data.error) return [];
    return (data.rows ?? []).map(rowToEntry);
  } catch {
    return [];
  }
}

/** Recent entries from the sheet, newest first. Empty on any failure. */
export async function readSheetEntries(): Promise<PayrollEntry[]> {
  return (await readSheetEntriesRaw()).reverse();
}

function rowToEntry(c: SheetRow): PayrollEntry {
  const s = (v: unknown) => String(v ?? "");
  const n = (v: unknown) => Number(v) || 0;
  // Sheets may hand back a date cell as a full ISO timestamp — keep just
  // the calendar day for display.
  const day = (v: unknown) => {
    const str = s(v);
    return /^\d{4}-\d{2}-\d{2}T/.test(str) ? str.slice(0, 10) : str;
  };
  return {
    timestamp: s(c[0]),
    employee: s(c[1]),
    event: s(c[2]),
    eventDate: day(c[3]),
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
    // Rows written before hourly logging existed have no Type/Hourly Rate
    // columns — default them to a plain event entry.
    kind: (c[14] === "hourly" ? "hourly" : "event") as PayrollKind,
    hourlyRate: n(c[15]),
  };
}
