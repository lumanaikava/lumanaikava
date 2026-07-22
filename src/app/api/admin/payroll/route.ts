import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  appendPayrollEntry,
  COMMISSION_TIERS,
  type CommissionTier,
} from "@/lib/payroll";

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

  try {
    const entry = await appendPayrollEntry({
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
    return NextResponse.json({ ok: true, entry });
  } catch (err) {
    console.error("[payroll] append failed:", err);
    return NextResponse.json(
      {
        error:
          "Couldn't write the payroll file — check PAYROLL_CSV_PATH points at a writable location.",
      },
      { status: 500 },
    );
  }
}
