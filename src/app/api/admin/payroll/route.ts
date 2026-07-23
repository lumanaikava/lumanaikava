import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  buildEntry,
  computePayout,
  appendCsvEntry,
  updateCsvEntry,
  deleteCsvEntry,
  COMMISSION_TIERS,
  DEFAULT_HOURLY_RATE,
  type CommissionTier,
  type PayrollInput,
} from "@/lib/payroll";
import {
  appendEntryToSheet,
  updateEntryInSheet,
  deleteEntryFromSheet,
  payrollSheetConfigured,
} from "@/lib/integrations/payroll-sheet";

export const runtime = "nodejs";

const CREW = ["Ash", "Zach", "Karina"];

async function requireAuth() {
  const jar = await cookies();
  const auth = jar.get("lumanai_admin")?.value;
  if (!auth || auth !== process.env.ADMIN_PASSCODE) {
    return { ok: false as const, loggedBy: "" };
  }
  return { ok: true as const, loggedBy: jar.get("lumanai_crew")?.value ?? "Crew" };
}

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/** Validate + normalize the shared shift fields. Throws a {status,error} on bad input. */
function parseInput(
  b: Record<string, unknown>,
  loggedBy: string,
): PayrollInput {
  const employee = String(b.employee ?? "");
  if (!CREW.includes(employee)) {
    throw { status: 400, error: "Pick an employee." };
  }
  const kind = b.kind === "hourly" ? "hourly" : "event";

  let commissionPct: CommissionTier = 10;
  let hourlyRate = 0;
  if (kind === "hourly") {
    hourlyRate = num(b.hourlyRate) || DEFAULT_HOURLY_RATE;
  } else {
    const pct = Number(b.commissionPct);
    if (!COMMISSION_TIERS.includes(pct as CommissionTier)) {
      throw { status: 400, error: "Commission must be 10, 15, 20, or 25%." };
    }
    commissionPct = pct as CommissionTier;
  }

  return {
    employee,
    kind,
    event: String(b.event ?? "").slice(0, 120),
    eventDate: String(b.eventDate ?? ""),
    hours: num(b.hours),
    sales: kind === "event" ? num(b.sales) : 0,
    commissionPct,
    hourlyRate,
    tips: num(b.tips),
    bonus: num(b.bonus),
    expenses: num(b.expenses),
    expenseNote: String(b.expenseNote ?? "").slice(0, 200),
    loggedBy,
  };
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let input: PayrollInput;
  try {
    input = parseInput(b, auth.loggedBy);
  } catch (err) {
    const e = err as { status: number; error: string };
    return NextResponse.json({ error: e.error }, { status: e.status });
  }

  const entry = buildEntry(input);

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

export async function PUT(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const timestamp = String(b.timestamp ?? "");
  if (!timestamp) {
    return NextResponse.json({ error: "Missing timestamp." }, { status: 400 });
  }

  let input: PayrollInput;
  try {
    // Keep whoever originally logged it — editing doesn't reassign credit.
    input = parseInput(b, String(b.loggedBy ?? auth.loggedBy));
  } catch (err) {
    const e = err as { status: number; error: string };
    return NextResponse.json({ error: e.error }, { status: e.status });
  }
  const { commissionAmt, totalPayout } = computePayout(input);
  const entry = { ...input, timestamp, commissionAmt, totalPayout };

  const stores: Promise<void>[] = [updateCsvEntry(timestamp, input).then(() => {})];
  if (payrollSheetConfigured()) stores.push(updateEntryInSheet(timestamp, entry));

  const results = await Promise.allSettled(stores);
  const anyOk = results.some((r) => r.status === "fulfilled");
  if (!anyOk) {
    console.error("[payroll] update failed everywhere:", results);
    return NextResponse.json(
      { error: "Couldn't update that entry anywhere it's stored." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, entry });
}

export async function DELETE(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const timestamp = String(b.timestamp ?? "");
  if (!timestamp) {
    return NextResponse.json({ error: "Missing timestamp." }, { status: 400 });
  }

  const stores: Promise<void>[] = [deleteCsvEntry(timestamp)];
  if (payrollSheetConfigured()) stores.push(deleteEntryFromSheet(timestamp));

  const results = await Promise.allSettled(stores);
  const anyOk = results.some((r) => r.status === "fulfilled");
  if (!anyOk) {
    console.error("[payroll] delete failed everywhere:", results);
    return NextResponse.json(
      { error: "Couldn't delete that entry anywhere it's stored." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
