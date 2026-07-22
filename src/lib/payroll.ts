import { promises as fs } from "fs";
import path from "path";

/**
 * Payroll + commissions — the math and the local ledger.
 *
 * Each entry: an employee worked an event, the event did some total in
 * sales, they earn a commission tier (10/15/20/25%) on those sales,
 * plus tips, plus an optional bonus, plus reimbursed expenses.
 *
 * Entries append to a CSV on disk (PAYROLL_CSV_PATH, or ./data/Payroll
 * Log.csv). Point that env at your Lumanai Business folder and every
 * submission from the Command Center lands in the same spreadsheet you
 * already keep — no copy/paste.
 */

export const COMMISSION_TIERS = [10, 15, 20, 25] as const;
export type CommissionTier = (typeof COMMISSION_TIERS)[number];

export type PayrollInput = {
  employee: string;
  event: string;
  eventDate: string;
  hours: number;
  sales: number;
  commissionPct: CommissionTier;
  tips: number;
  bonus: number;
  expenses: number;
  expenseNote: string;
  loggedBy: string;
};

export type PayrollEntry = PayrollInput & {
  timestamp: string;
  commissionAmt: number;
  totalPayout: number;
};

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
] as const;

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function money(n: number): number {
  return Math.round(n * 100) / 100;
}

/** commission + tips + bonus + reimbursed expenses. */
export function computePayout(input: PayrollInput): {
  commissionAmt: number;
  totalPayout: number;
} {
  const commissionAmt = money((input.sales * input.commissionPct) / 100);
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
  ]
    .map(csvCell)
    .join(",");
}

export async function appendPayrollEntry(
  input: PayrollInput,
): Promise<PayrollEntry> {
  const { commissionAmt, totalPayout } = computePayout(input);
  const entry: PayrollEntry = {
    ...input,
    timestamp: new Date().toISOString(),
    commissionAmt,
    totalPayout,
  };

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
  return entry;
}

/** Parse the CSV back for display. Returns newest first. */
export async function readPayrollEntries(): Promise<PayrollEntry[]> {
  const file = payrollCsvPath();
  let text: string;
  try {
    text = await fs.readFile(file, "utf8");
  } catch {
    return [];
  }
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];

  const rows = lines.slice(1).map(parseCsvLine);
  const entries = rows
    .filter((c) => c.length >= COLUMNS.length)
    .map((c) => ({
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
    }));
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
