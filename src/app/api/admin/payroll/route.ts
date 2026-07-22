import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  buildEntry,
  appendCsvEntry,
  COMMISSION_TIERS,
  type CommissionTier,
} from "@/lib/payroll";
import {
  appendEntryToSheet,
  payrollSheetConfigured,
} from "@/lib/integrations/payroll-sheet";

export const runtime = "nodejs";

const CREW = ["Ash", "Zach", "Karina"];

export async function POST(req: Request) {
  const jar = await cookies();
  const auth = jar.get("lumanai_admin")?.value;
  if (!auth || auth !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const employee = String(b.employee ?? "");
  if (!CREW.includes(employee)) {
    return NextResponse.json(
      { error: "Pick an employee." },
      { status: 400 },
    );
  }
  const pct = Number(b.commissionPct);
  if (!COMMISSION_TIERS.includes(pct as CommissionTier)) {
    return NextResponse.json(
      { error: "Commission must be 10, 15, 20, or 25%." },
      { status: 400 },
    );
  }

  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const entry = buildEntry({
    employee,
    event: String(b.event ?? "").slice(0, 120),
    eventDate: String(b.eventDate ?? ""),
    hours: num(b.hours),
    sales: num(b.sales),
    commissionPct: pct as CommissionTier,
    tips: num(b.tips),
    bonus: num(b.bonus),
    expenses: num(b.expenses),
    expenseNote: String(b.expenseNote ?? "").slice(0, 200),
    loggedBy: jar.get("lumanai_crew")?.value ?? "Crew",
  });

  // Write to the Google Sheet (canonical, works when deployed) and the
  // local CSV (backup, works when running on your machine). Succeed as
  // long as at least one store took the row.
  const stores: Promise<void>[] = [appendCsvEntry(entry)];
  if (payrollSheetConfigured()) stores.push(appendEntryToSheet(entry));

  const results = await Promise.allSettled(stores);
  const anyOk = results.some((r) => r.status === "fulfilled");
  if (!anyOk) {
    console.error("[payroll] all stores failed:", results);
    return NextResponse.json(
      {
        error:
          "Couldn't save the entry — check the Payroll Sheet webhook or the local file path.",
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, entry });
}
