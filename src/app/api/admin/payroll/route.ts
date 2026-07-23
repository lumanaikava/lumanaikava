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

const storeLabel = (i: number) => (i === 0 ? "local CSV" : "Google Sheet");

/**
 * Run the CSV + (optional) Sheet write in parallel and report what
 * actually happened. Never mask a real failure as success: if only one
 * store took the write, that's logged loudly even though the request
 * still succeeds, so a locked file or a broken Apps Script shows up in
 * the server console instead of vanishing silently.
 */
async function commitToStores(
  stores: Promise<void>[],
  action: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const results = await Promise.allSettled(stores);
  const failures = results
    .map((r, i) => (r.status === "rejected" ? { i, reason: r.reason } : null))
    .filter((x): x is { i: number; reason: unknown } => x !== null);
  const anyOk = results.some((r) => r.status === "fulfilled");

  if (failures.length > 0) {
    for (const f of failures) {
      console.error(
        `[payroll] ${action}: ${storeLabel(f.i)} failed —`,
        f.reason instanceof Error ? f.reason.message : f.reason,
      );
    }
  }
  if (!anyOk) {
    const detail = failures
      .map((f) => (f.reason instanceof Error ? f.reason.message : String(f.reason)))
      .join(" · ");
    return { ok: false, error: detail || `Couldn't ${action} anywhere it's stored.` };
  }
  return { ok: true };
}

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

  // Write to the local CSV (backup, works when running on your machine)
  // and the Google Sheet (canonical, works when deployed). Succeed as
  // long as at least one store took the row — but always report which
  // store(s) actually failed, so a locked file or broken script never
  // disappears silently.
  const stores: Promise<void>[] = [appendCsvEntry(entry)];
  if (payrollSheetConfigured()) stores.push(appendEntryToSheet(entry));

  const result = await commitToStores(stores, "save the entry");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
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

  const result = await commitToStores(stores, "update the entry");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
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

  const result = await commitToStores(stores, "delete the entry");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
