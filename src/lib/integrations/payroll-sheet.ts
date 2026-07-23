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

/**
 * POST to the webhook and surface every failure mode:
 *   - non-2xx status
 *   - Apps Script's embedded {error} (the script always answers HTTP 200,
 *     even for a bad secret, so errors normally only show up in the body)
 *   - a broken/misconfigured script, which returns an HTML error PAGE at
 *     HTTP 200 — NOT valid JSON. Silently treating that as "no error" is
 *     exactly what let deletes/edits report success while doing nothing,
 *     so an unparseable body is always a hard failure here, never {}.
 */
async function callSheet(body: Record<string, unknown>): Promise<unknown> {
  if (!URL) throw new Error("Payroll sheet webhook not configured.");
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: SECRET, ...body }),
    redirect: "follow",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Payroll sheet ${res.status}: ${text.slice(0, 200)}`);
  }
  let data: { error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Payroll sheet returned a non-JSON response (the Apps Script may be broken) — first 200 chars: ${text.slice(0, 200)}`,
    );
  }
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
  // Unwrapped read on purpose: if the sheet can't be read right now, we
  // must NOT fall through to an empty list and "replace" the sheet with
  // nothing. Let the failure propagate instead of risking data loss.
  const all = await fetchSheetRows();
  const idx = all.findIndex((e) => e.timestamp === timestamp);
  if (idx === -1) throw new Error("Entry not found in the Payroll Sheet.");
  all[idx] = updated;
  await replaceAllSheetRows(all);
}

/** Remove one entry (matched by timestamp), then rewrite the sheet. */
export async function deleteEntryFromSheet(timestamp: string): Promise<void> {
  const all = await fetchSheetRows();
  await replaceAllSheetRows(all.filter((e) => e.timestamp !== timestamp));
}

type SheetRow = (string | number)[];

/** Raw rows in sheet order (oldest first). Throws on any failure. */
async function fetchSheetRows(): Promise<PayrollEntry[]> {
  if (!URL) throw new Error("Payroll sheet webhook not configured.");
  const sep = URL.includes("?") ? "&" : "?";
  const res = await fetch(`${URL}${sep}list=1&secret=${encodeURIComponent(SECRET)}`, {
    cache: "no-store",
    redirect: "follow",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Payroll sheet ${res.status}: ${text.slice(0, 200)}`);
  }
  let data: { rows?: SheetRow[]; error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Payroll sheet returned a non-JSON response (the Apps Script may be broken) — first 200 chars: ${text.slice(0, 200)}`,
    );
  }
  if (data.error) throw new Error(`Payroll sheet: ${data.error}`);
  return (data.rows ?? []).map(rowToEntry);
}

/**
 * Raw rows, oldest first — safe for DISPLAY use (dashboard, report page).
 * Swallows failures to an empty array so callers fall back to the local
 * CSV; never use this as the basis for a "replace" write (see fetchSheetRows).
 */
async function readSheetEntriesRaw(): Promise<PayrollEntry[]> {
  try {
    return await fetchSheetRows();
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
