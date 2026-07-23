import { promises as fs } from "fs";
import path from "path";

/**
 * Payroll + commissions — the math and the local ledger.
 *
 * Two kinds of shift:
 *   - "event": bartending a paid event. Pay = Event Sales × Commission
 *     Tier (10/15/20/25%).
 *   - "hourly": kitchen prep work. Pay = Hours × Hourly Rate ($15
 *     default — editable per entry in case the rate changes later).
 * Either way: Total Payout = base pay + Tips + Bonus + Expenses
 * (reimbursed).
 *
 * Entries append to a CSV on disk (PAYROLL_CSV_PATH, or ./data/Payroll
 * Log.csv). Point that env at your Lumanai Business folder and every
 * submission from the Command Center lands in the same spreadsheet you
 * already keep — no copy/paste.
 */

export const COMMISSION_TIERS = [10, 15, 20, 25] as const;
export type CommissionTier = (typeof COMMISSION_TIERS)[number];

export type PayrollKind = "event" | "hourly";
export const DEFAULT_HOURLY_RATE = 15;

export type PayrollInput = {
  employee: string;
  kind: PayrollKind;
  event: string;
  eventDate: string;
  hours: number;
  /** "event" kind only. */
  sales: number;
  /** "event" kind only. */
  commissionPct: CommissionTier;
  /** "hourly" kind only. */
  hourlyRate: number;
  tips: number;
  bonus: number;
  expenses: number;
  expenseNote: string;
  loggedBy: string;
};

export type PayrollEntry = PayrollInput & {
  timestamp: string;
  /** Base pay before tips/bonus/expenses — commission $ or hourly $. */
  commissionAmt: number;
  totalPayout: number;
};

/**
 * Column order. New columns (Type, Hourly Rate) are appended at the END
 * so rows written before this feature existed still parse correctly —
 * their missing trailing cells just default sensibly (see readers below).
 */
const COLUMNS = [
  "Timestamp",
  "Employee",
  "Event",
  "Event Date",
  "Hours",
  "Event Sales",
  "Commission %",
  "Commission $",
  "Tips",
  "Bonus",
  "Expenses",
  "Expense Note",
  "Total Payout",
  "Logged By",
  "Type",
  "Hourly Rate",
] as const;

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function money(n: number): number {
  return Math.round(n * 100) / 100;
}

/** (event: sales × tier) or (hourly: hours × rate), + tips + bonus + expenses. */
export function computePayout(input: PayrollInput): {
  commissionAmt: number;
  totalPayout: number;
} {
  const commissionAmt =
    input.kind === "hourly"
      ? money(input.hours * (input.hourlyRate || DEFAULT_HOURLY_RATE))
      : money((input.sales * input.commissionPct) / 100);
  const totalPayout = money(
    commissionAmt + input.tips + input.bonus + input.expenses,
  );
  return { commissionAmt, totalPayout };
}

export function payrollCsvPath(): string {
  return (
    process.env.PAYROLL_CSV_PATH ||
    path.join(process.cwd(), "data", "Payroll Log.csv")
  );
}

function toRow(e: PayrollEntry): string {
  return entryToValues(e).map(csvCell).join(",");
}

/** Turn a raw input into a full entry (adds timestamp + computed pay). */
export function buildEntry(input: PayrollInput): PayrollEntry {
  const { commissionAmt, totalPayout } = computePayout(input);
  return {
    ...input,
    timestamp: new Date().toISOString(),
    commissionAmt,
    totalPayout,
  };
}

/** Append one entry to the local CSV ledger (may throw on a read-only fs). */
export async function appendCsvEntry(entry: PayrollEntry): Promise<void> {
  const file = payrollCsvPath();
  await fs.mkdir(path.dirname(file), { recursive: true });

  let exists = true;
  try {
    await fs.access(file);
  } catch {
    exists = false;
  }
  const header = exists ? "" : COLUMNS.join(",") + "\r\n";
  await fs.appendFile(file, header + toRow(entry) + "\r\n", "utf8");
}

/** Replace an existing CSV row (matched by timestamp) with new values. */
export async function updateCsvEntry(
  timestamp: string,
  input: PayrollInput,
): Promise<PayrollEntry> {
  const entries = await readAllCsvEntries();
  const idx = entries.findIndex((e) => e.timestamp === timestamp);
  if (idx === -1) throw new Error("Entry not found in the local CSV.");
  const updated: PayrollEntry = { ...buildEntry(input), timestamp };
  entries[idx] = updated;
  await writeAllCsvEntries(entries);
  return updated;
}

/** Remove a CSV row (matched by timestamp). */
export async function deleteCsvEntry(timestamp: string): Promise<void> {
  const entries = await readAllCsvEntries();
  const filtered = entries.filter((e) => e.timestamp !== timestamp);
  await writeAllCsvEntries(filtered);
}

async function writeAllCsvEntries(entries: PayrollEntry[]): Promise<void> {
  const file = payrollCsvPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const body = entries.map(toRow).join("\r\n");
  await fs.writeFile(
    file,
    COLUMNS.join(",") + "\r\n" + body + (body ? "\r\n" : ""),
    "utf8",
  );
}

/** Column order — shared with the Google Sheet integration. */
export const PAYROLL_COLUMNS = COLUMNS;

/** Ordered cell values for one entry, matching PAYROLL_COLUMNS. */
export function entryToValues(e: PayrollEntry): (string | number)[] {
  return [
    e.timestamp,
    e.employee,
    e.event,
    e.eventDate,
    e.hours,
    e.sales,
    e.commissionPct,
    e.commissionAmt,
    e.tips,
    e.bonus,
    e.expenses,
    e.expenseNote,
    e.totalPayout,
    e.loggedBy,
    e.kind,
    e.hourlyRate,
  ];
}

function rowToPayrollEntry(c: string[]): PayrollEntry {
  return {
    timestamp: c[0],
    employee: c[1],
    event: c[2],
    eventDate: c[3],
    hours: Number(c[4]) || 0,
    sales: Number(c[5]) || 0,
    commissionPct: (Number(c[6]) || 10) as CommissionTier,
    commissionAmt: Number(c[7]) || 0,
    tips: Number(c[8]) || 0,
    bonus: Number(c[9]) || 0,
    expenses: Number(c[10]) || 0,
    expenseNote: c[11] ?? "",
    totalPayout: Number(c[12]) || 0,
    loggedBy: c[13] ?? "",
    // Rows written before hourly logging existed have no Type/Hourly Rate
    // columns — default them to a plain event entry.
    kind: (c[14] === "hourly" ? "hourly" : "event") as PayrollKind,
    hourlyRate: Number(c[15]) || 0,
  };
}

/** Raw parse, oldest first (file order) — used internally for rewrites. */
async function readAllCsvEntries(): Promise<PayrollEntry[]> {
  const file = payrollCsvPath();
  let text: string;
  try {
    text = await fs.readFile(file, "utf8");
  } catch {
    return [];
  }
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];

  return lines
    .slice(1)
    .map(parseCsvLine)
    .filter((c) => c.length >= 14 && c[1]) // needs at least the original columns + an employee
    .map(rowToPayrollEntry);
}

/** Parse the CSV back for display. Returns newest first. */
export async function readPayrollEntries(): Promise<PayrollEntry[]> {
  const entries = await readAllCsvEntries();
  return entries.reverse();
}

/** Minimal CSV line parser (handles quoted cells with commas/quotes). */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}
