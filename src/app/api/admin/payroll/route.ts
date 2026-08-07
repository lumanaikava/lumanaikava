import { NextResponse } from "next/server";
import {
  buildEntry,
  computePayout,
  appendCsvEntry,
  updateCsvEntry,
  deleteCsvEntry,
  csvBackupEnabled,
  readPayrollEntries,
  DEFAULT_HOURLY_RATE,
  type CommissionTier,
  type PayrollInput,
} from "@/lib/payroll";
import {
  appendEntryToSheet,
  updateEntryInSheet,
  deleteEntryFromSheet,
  readSheetEntriesStrict,
  payrollSheetConfigured,
} from "@/lib/integrations/payroll-sheet";
import { CREW, OWNER_CREDIT_NAME } from "@/lib/crew";
import { getSession, type Session } from "@/lib/admin-session";

export const runtime = "nodejs";

async function requireAuth() {
  const session = await getSession();
  if (!session.authed) return { ok: false as const, session };
  return { ok: true as const, session, loggedBy: session.name };
}

const notSignedIn = () =>
  NextResponse.json({ error: "Not signed in." }, { status: 401 });

/**
 * Staff may only touch their OWN shifts. Enforced here rather than in the
 * form, because hiding a dropdown stops nobody with a terminal.
 */
function mayActOn(session: Session, employee: string): boolean {
  return session.isOwner || session.name === employee;
}

const forbidden = () =>
  NextResponse.json(
    { error: "You can only log your own hours." },
    { status: 403 },
  );

/**
 * Who does the entry at this timestamp currently belong to?
 *
 * Edits and deletes must be checked against the entry ALREADY on record,
 * not the employee name in the request body — otherwise a staff member
 * could pass their own name with someone else's timestamp and quietly
 * take over (or delete) that person's shift.
 */
async function ownerOfEntry(timestamp: string): Promise<string | null> {
  let entries;
  try {
    entries = payrollSheetConfigured()
      ? await readSheetEntriesStrict()
      : await readPayrollEntries();
  } catch {
    entries = await readPayrollEntries();
  }
  return entries.find((e) => e.timestamp === timestamp)?.employee ?? null;
}

/** Owners may touch anything; staff only their own existing entry. */
async function mayModify(
  session: Session,
  timestamp: string,
): Promise<boolean> {
  if (session.isOwner) return true;
  const owner = await ownerOfEntry(timestamp);
  // Unknown entry → refuse. Failing closed is right when the check itself
  // couldn't be completed.
  return owner !== null && owner === session.name;
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

/** Write one entry to every configured store. */
async function saveEntry(entry: ReturnType<typeof buildEntry>, action: string) {
  const stores: Store[] = [];
  if (csvBackupEnabled())
    stores.push({ label: "local backup file", run: appendCsvEntry(entry) });
  if (payrollSheetConfigured())
    stores.push({ label: "Google Sheet", run: appendEntryToSheet(entry) });
  return commitToStores(stores, action);
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return notSignedIn();

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Authorization before validation: refuse on the raw name so "not
  // allowed" never hides behind an unrelated "fix this field" message.
  if (!mayActOn(auth.session, String(b.employee ?? ""))) return forbidden();

  let input: PayrollInput;
  try {
    input = parseInput(b, auth.loggedBy);
  } catch (err) {
    const e = err as { status: number; error: string };
    return NextResponse.json({ error: e.error }, { status: e.status });
  }

  const entry = buildEntry(input);
  const result = await saveEntry(entry, "save the entry");
  const entries = [entry];
  const warnings = result.failed.length
    ? [
        `Saved, but couldn't reach the ${result.failed.map((f) => f.label).join(" + ")}.`,
      ]
    : [];

  if (result.savedTo.length === 0) {
    return commitResponse("save the entry", result);
  }

  /**
   * Ash's remainder credit, created HERE rather than by a second request
   * from the browser. Staff aren't allowed to write entries for other
   * people, so the old client-side version would now be rejected — and
   * this is safer anyway: the percentages can't be tampered with, and
   * one request can't half-succeed across two round trips.
   */
  const wantsCredit =
    b.creditOwnerRemainder === true &&
    input.kind === "event" &&
    input.employee !== OWNER_CREDIT_NAME;

  if (wantsCredit) {
    const remainderPct = Math.round((100 - input.commissionPct) * 100) / 100;
    if (remainderPct > 0) {
      const creditEntry = buildEntry({
        ...input,
        employee: OWNER_CREDIT_NAME,
        commissionPct: remainderPct,
        hours: 0,
        tips: 0,
        bonus: 0,
        expenses: 0,
        expenseNote: "",
        loggedBy: auth.loggedBy,
      });
      const creditResult = await saveEntry(creditEntry, "credit the remainder");
      if (creditResult.savedTo.length === 0) {
        warnings.push(
          `Your shift saved, but ${OWNER_CREDIT_NAME}'s ${remainderPct}% credit did NOT — add it by hand.`,
        );
      } else {
        entries.push(creditEntry);
        if (creditResult.failed.length) {
          warnings.push(
            `${OWNER_CREDIT_NAME}'s credit didn't reach the ${creditResult.failed.map((f) => f.label).join(" + ")}.`,
          );
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    entry,
    entries,
    warning: warnings.length ? warnings.join(" · ") : undefined,
  });
}

export async function PUT(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return notSignedIn();

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

  // Both ends: the entry as it stands, and who they're trying to make it.
  if (!(await mayModify(auth.session, timestamp))) return forbidden();

  let input: PayrollInput;
  try {
    // Keep whoever originally logged it — editing doesn't reassign credit.
    input = parseInput(b, String(b.loggedBy ?? auth.loggedBy));
  } catch (err) {
    const e = err as { status: number; error: string };
    return NextResponse.json({ error: e.error }, { status: e.status });
  }
  // …and they can't hand it to somebody else on the way out.
  if (!mayActOn(auth.session, input.employee)) return forbidden();

  const { commissionAmt, totalPayout } = computePayout(input);
  const entry = { ...input, timestamp, commissionAmt, totalPayout };

  const stores: Store[] = [];
  if (csvBackupEnabled())
    stores.push({
      label: "local backup file",
      run: updateCsvEntry(timestamp, input).then(() => {}),
    });
  if (payrollSheetConfigured())
    stores.push({ label: "Google Sheet", run: updateEntryInSheet(timestamp, entry) });

  const result = await commitToStores(stores, "update the entry");
  return commitResponse("update the entry", result, { entry });
}

export async function DELETE(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return notSignedIn();

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

  if (!(await mayModify(auth.session, timestamp))) return forbidden();

  const stores: Store[] = [];
  if (csvBackupEnabled())
    stores.push({ label: "local backup file", run: deleteCsvEntry(timestamp) });
  if (payrollSheetConfigured())
    stores.push({ label: "Google Sheet", run: deleteEntryFromSheet(timestamp) });

  const result = await commitToStores(stores, "delete the entry");
  return commitResponse("delete the entry", result);
}
