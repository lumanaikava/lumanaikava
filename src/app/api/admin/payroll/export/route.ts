import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import {
  payrollCsvPath,
  csvBackupEnabled,
  entryToValues,
  PAYROLL_COLUMNS,
  readPayrollEntries,
} from "@/lib/payroll";
import {
  readSheetEntriesStrict,
  payrollSheetConfigured,
} from "@/lib/integrations/payroll-sheet";

export const runtime = "nodejs";

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Download the payroll ledger as CSV.
 *
 * Deployed, there's no local file to hand back, so the CSV is generated
 * from the Google Sheet — the download works the same either way.
 */
export async function GET() {
  const jar = await cookies();
  const auth = jar.get("lumanai_admin")?.value;
  if (!auth || auth !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let csv: string | null = null;

  // Prefer the local file when it exists — it's the byte-for-byte ledger.
  if (csvBackupEnabled()) {
    try {
      csv = await fs.readFile(payrollCsvPath(), "utf8");
    } catch {
      /* fall through to building it from a data source */
    }
  }

  if (csv === null) {
    let entries = [];
    try {
      entries = payrollSheetConfigured()
        ? await readSheetEntriesStrict()
        : await readPayrollEntries();
    } catch {
      entries = await readPayrollEntries();
    }
    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No payroll entries yet." },
        { status: 404 },
      );
    }
    // Sheet reads come back newest-first; write the file oldest-first so
    // it matches the ledger's natural order.
    const rows = [...entries]
      .reverse()
      .map((e) => entryToValues(e).map(csvCell).join(","));
    csv = [PAYROLL_COLUMNS.join(","), ...rows].join("\r\n") + "\r\n";
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payroll-${stamp}.csv"`,
    },
  });
}
