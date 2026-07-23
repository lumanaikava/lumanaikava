import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  buildEntry,
  computePayout,
  appendCsvEntry,
  updateCsvEntry,
  deleteCsvEntry,
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

type Store = { label: string; run: Promise<void> };

/**
 * Run the writes and report exactly what happened per store. The Google
 * Sheet is the shared online source of truth; the local CSV is an
 * automatic backup. We succeed as long as at least one store took the
 * write (so nothing is ever lost), but we NEVER pretend a store
 * succeeded when it didn't — a failed store comes back as a warning the
 * user can see, and is logged, so it can't vanish silently like before.
 */
async function commitToStores(
  stores: Store[],
  action: string,
): Promise<{ savedTo: string[]; failed: { label: string; message: string }[] }> {
  const results = await Promise.allSettled(stores.map((s) => s.run));
  const savedTo: string[] = [];
  const failed: { label: string; message: string }[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      savedTo.push(stores[i].label);
    } else {
      const message =
        r.reason instanceof Error ? r.reason.message : String(r.reason);
      failed.push({ label: stores[i].label, message });
      console.error(`[payroll] ${action}: ${stores[i].label} failed —`, message);
    }
  });
  return { savedTo, failed };
}

/** Turn a commit result into an HTTP response payload. */
function commitResponse(
  action: string,
  { savedTo, failed }: { savedTo: string[]; failed: { label: string; message: string }[] },
  extra: Record<string, unknown> = {},
) {
  if (savedTo.length === 0) {
    return NextResponse.json(
      { error: failed.map((f) => f.message).join(" · ") || `Couldn't ${action}.` },
      { status: 500 },
    );
  }
  const warning = failed.length
    ? `Saved, but couldn't reach the ${failed.map((f) => f.label).join(" + ")}. It'll be out of sync until that's fixed. (${failed.map((f) => f.message).join(" · ")})`
    : undefined;
  return NextResponse.json({ ok: true, warning, ...extra });
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
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      throw { status: 400, error: "Commission % must be between 0 and 100." };
    }
    // Round to two decimals so 12.5, 17.25, etc. are all valid.
    commissionPct = Math.round(pct * 100) / 100;
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

  // Google Sheet = shared online source of truth; local CSV = auto-backup.
  const stores: Store[] = [{ label: "local backup file", run: appendCsvEntry(entry) }];
  if (payrollSheetConfigured())
    stores.push({ label: "Google Sheet", run: appendEntryToSheet(entry) });

  const result = await commitToStores(stores, "save the entry");
  return commitResponse("save the entry", result, { entry });
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

  const stores: Store[] = [
    { label: "local backup file", run: updateCsvEntry(timestamp, input).then(() => {}) },
  ];
  if (payrollSheetConfigured())
    stores.push({ label: "Google Sheet", run: updateEntryInSheet(timestamp, entry) });

  const result = await commitToStores(stores, "update the entry");
  return commitResponse("update the entry", result, { entry });
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

  const stores: Store[] = [
    { label: "local backup file", run: deleteCsvEntry(timestamp) },
  ];
  if (payrollSheetConfigured())
    stores.push({ label: "Google Sheet", run: deleteEntryFromSheet(timestamp) });

  const result = await commitToStores(stores, "delete the entry");
  return commitResponse("delete the entry", result);
}
