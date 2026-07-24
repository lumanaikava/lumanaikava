"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { PayrollEntry, PayrollKind } from "@/lib/payroll";

const CREW = ["Ash", "Zach", "Karina"];
const TIERS = [10, 15, 20, 25];
const DEFAULT_HOURLY_RATE = 15;

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

type FormValues = {
  employee: string;
  kind: PayrollKind;
  event: string;
  eventDate: string;
  hours: string;
  sales: string;
  pct: number;
  hourlyRate: string;
  tips: string;
  bonus: string;
  expenses: string;
  expenseNote: string;
};

function emptyForm(employee: string): FormValues {
  return {
    employee,
    kind: "event",
    event: "",
    eventDate: "",
    hours: "",
    sales: "",
    pct: 15,
    hourlyRate: String(DEFAULT_HOURLY_RATE),
    tips: "",
    bonus: "",
    expenses: "",
    expenseNote: "",
  };
}

function entryToForm(e: PayrollEntry): FormValues {
  return {
    employee: e.employee,
    kind: e.kind,
    event: e.event,
    eventDate: e.eventDate,
    hours: e.hours ? String(e.hours) : "",
    sales: e.sales ? String(e.sales) : "",
    pct: e.commissionPct || 15,
    hourlyRate: String(e.hourlyRate || DEFAULT_HOURLY_RATE),
    tips: e.tips ? String(e.tips) : "",
    bonus: e.bonus ? String(e.bonus) : "",
    expenses: e.expenses ? String(e.expenses) : "",
    expenseNote: e.expenseNote,
  };
}

export default function PayrollPanel({
  initialEntries,
  defaultEmployee,
}: {
  initialEntries: PayrollEntry[];
  defaultEmployee: string;
}) {
  const [entries, setEntries] = useState<PayrollEntry[]>(initialEntries);
  const [editingTimestamp, setEditingTimestamp] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>(
    emptyForm(CREW.includes(defaultEmployee) ? defaultEmployee : CREW[0]),
  );
  // Ash doesn't work shifts himself — he takes whatever's left of an
  // event's sales after the bartender's commission. On by default for
  // anyone logging an event; turn it off if someone else already logged
  // the same event (so Ash isn't credited twice for one night).
  const [creditAsh, setCreditAsh] = useState(true);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "busy" }
    | { kind: "error"; msg: string }
    | { kind: "warn"; msg: string }
    | { kind: "saved" }
  >({ kind: "idle" });

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const n = (s: string) => {
    const v = Number(s);
    return Number.isFinite(v) && v > 0 ? v : 0;
  };

  const basePay = useMemo(() => {
    if (form.kind === "hourly") {
      return n(form.hours) * (n(form.hourlyRate) || DEFAULT_HOURLY_RATE);
    }
    return (n(form.sales) * form.pct) / 100;
  }, [form.kind, form.hours, form.hourlyRate, form.sales, form.pct]);

  const payout = useMemo(
    () => basePay + n(form.tips) + n(form.bonus) + n(form.expenses),
    [basePay, form.tips, form.bonus, form.expenses],
  );

  function startEdit(entry: PayrollEntry) {
    setEditingTimestamp(entry.timestamp);
    setForm(entryToForm(entry));
    setStatus({ kind: "idle" });
  }

  function cancelEdit() {
    setEditingTimestamp(null);
    setForm(emptyForm(form.employee));
    setStatus({ kind: "idle" });
  }

  const showCreditAsh =
    !editingTimestamp && form.kind === "event" && form.employee !== "Ash";
  const ashRemainderPct = Math.round((100 - form.pct) * 100) / 100;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ kind: "busy" });
    const payload = {
      employee: form.employee,
      kind: form.kind,
      event: form.event,
      eventDate: form.eventDate,
      hours: form.hours,
      sales: form.sales,
      commissionPct: form.pct,
      hourlyRate: form.hourlyRate,
      tips: form.tips,
      bonus: form.bonus,
      expenses: form.expenses,
      expenseNote: form.expenseNote,
    };
    const res = await fetch("/api/admin/payroll", {
      method: editingTimestamp ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editingTimestamp ? { ...payload, timestamp: editingTimestamp } : payload,
      ),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus({ kind: "error", msg: body.error ?? "Couldn't save." });
      return;
    }
    const { entry, warning } = await res.json();
    const newEntries = [entry];
    const warnings = warning ? [warning] : [];

    // Auto-credit Ash the remaining % of the same event's sales.
    if (showCreditAsh && creditAsh) {
      const ashRes = await fetch("/api/admin/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee: "Ash",
          kind: "event",
          event: form.event,
          eventDate: form.eventDate,
          hours: 0,
          sales: form.sales,
          commissionPct: ashRemainderPct,
          tips: 0,
          bonus: 0,
          expenses: 0,
          expenseNote: `Owner's remainder — auto-credited from ${form.employee}'s ${form.pct}% commission`,
        }),
      });
      if (ashRes.ok) {
        const ashBody = await ashRes.json();
        newEntries.push(ashBody.entry);
        if (ashBody.warning) warnings.push(`Ash's credit: ${ashBody.warning}`);
      } else {
        const ashBody = await ashRes.json().catch(() => ({}));
        warnings.push(
          `Couldn't auto-credit Ash: ${ashBody.error ?? "unknown error"}`,
        );
      }
    }

    setEntries((prev) =>
      editingTimestamp
        ? prev.map((x) => (x.timestamp === editingTimestamp ? entry : x))
        : [...newEntries, ...prev],
    );
    setEditingTimestamp(null);
    setForm(emptyForm(form.employee));
    setCreditAsh(true);
    if (warnings.length) {
      setStatus({ kind: "warn", msg: warnings.join(" · ") });
    } else {
      setStatus({ kind: "saved" });
      setTimeout(() => setStatus({ kind: "idle" }), 3500);
    }
  }

  async function remove(entry: PayrollEntry) {
    const label = `${entry.employee} — ${entry.event || "shift"} (${usd(entry.totalPayout)})`;
    if (!window.confirm(`Delete this log?\n\n${label}`)) return;
    const res = await fetch("/api/admin/payroll", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp: entry.timestamp }),
    });
    if (res.ok) {
      const body = await res.json().catch(() => ({}));
      setEntries((prev) => prev.filter((x) => x.timestamp !== entry.timestamp));
      if (editingTimestamp === entry.timestamp) cancelEdit();
      if (body.warning) window.alert(body.warning);
    } else {
      const body = await res.json().catch(() => ({}));
      window.alert(body.error ?? "Couldn't delete that entry.");
    }
  }

  const paidTotal = entries.reduce((s, e) => s + e.totalPayout, 0);

  const field =
    "mt-1 w-full rounded-xl border border-shell/20 bg-abyss/60 px-3 py-2 text-sm text-shell outline-none placeholder:text-shell/30 focus:border-gold";
  const label =
    "text-[10px] font-semibold uppercase tracking-[0.16em] text-shell/50";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* The calculator */}
      <form
        onSubmit={submit}
        className="rounded-3xl border border-shell/10 bg-lagoon/30 p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="h-sign-med text-xl text-shell">
            {editingTimestamp ? "Edit log" : "Log a shift"}
          </h3>
          <div className="flex gap-1.5">
            {CREW.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("employee", c)}
                className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  form.employee === c
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-shell/25 text-shell/60 hover:border-shell/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Event vs hourly kitchen work */}
        <div className="mt-4 flex gap-2">
          {(["event", "hourly"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => set("kind", k)}
              className={`flex-1 rounded-xl border py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                form.kind === k
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-shell/20 text-shell/60 hover:border-shell/40"
              }`}
            >
              {k === "event" ? "Event · commission" : "Kitchen · hourly"}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>{form.kind === "hourly" ? "Task" : "Event"}</span>
            <input
              value={form.event}
              onChange={(e) => set("event", e.target.value)}
              required
              placeholder={
                form.kind === "hourly" ? "Batch cook — naktail syrups" : "Sweat Equity Heat Wave"
              }
              className={field}
            />
          </label>
          <label className="block">
            <span className={label}>Date</span>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => set("eventDate", e.target.value)}
              className={field}
            />
          </label>
          <label className="block">
            <span className={label}>Hours{form.kind === "hourly" ? " worked" : ""}</span>
            <input
              type="number"
              min="0"
              step="0.25"
              value={form.hours}
              onChange={(e) => set("hours", e.target.value)}
              placeholder="5"
              className={field}
            />
          </label>
          {form.kind === "hourly" ? (
            <label className="block">
              <span className={label}>Hourly rate ($)</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.hourlyRate}
                onChange={(e) => set("hourlyRate", e.target.value)}
                placeholder={String(DEFAULT_HOURLY_RATE)}
                className={field}
              />
            </label>
          ) : (
            <label className="block">
              <span className={label}>Event total sales ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.sales}
                onChange={(e) => set("sales", e.target.value)}
                placeholder="1800"
                className={field}
              />
            </label>
          )}
        </div>

        {form.kind === "event" && (
          <div className="mt-4">
            <span className={label}>Commission % — pick one or type a custom rate</span>
            <div className="mt-1 flex gap-2">
              {TIERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("pct", t)}
                  className={`flex-1 rounded-xl border py-2 text-sm font-bold transition-colors ${
                    form.pct === t
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-shell/20 text-shell/60 hover:border-shell/40"
                  }`}
                >
                  {t}%
                </button>
              ))}
              <div
                className={`flex items-center rounded-xl border px-2 transition-colors ${
                  TIERS.includes(form.pct)
                    ? "border-shell/20"
                    : "border-gold bg-gold/15"
                }`}
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.pct}
                  onChange={(e) => set("pct", Number(e.target.value))}
                  aria-label="Custom commission percent"
                  className="w-14 bg-transparent py-2 text-right text-sm font-bold text-shell outline-none"
                />
                <span className="pl-0.5 text-sm font-bold text-shell/60">%</span>
              </div>
            </div>
          </div>
        )}

        {showCreditAsh && (
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-shell/15 bg-abyss/40 p-3">
            <input
              type="checkbox"
              checked={creditAsh}
              onChange={(e) => setCreditAsh(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
            />
            <span className="text-xs leading-relaxed text-shell/75">
              <span className="font-semibold text-shell">
                Also credit Ash the remaining {ashRemainderPct}%
              </span>{" "}
              of this event&apos;s sales ({usd((n(form.sales) * ashRemainderPct) / 100)}
              ) — he doesn&apos;t log shifts, so this is his cut automatically.
              <br />
              <span className="text-coconut/80">
                Uncheck this if someone else already logged this same event —
                Ash only gets credited once per event.
              </span>
            </span>
          </label>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={label}>Tips ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.tips}
              onChange={(e) => set("tips", e.target.value)}
              placeholder="120"
              className={field}
            />
          </label>
          <label className="block">
            <span className={label}>Bonus ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.bonus}
              onChange={(e) => set("bonus", e.target.value)}
              placeholder="0"
              className={field}
            />
          </label>
          <label className="block">
            <span className={label}>Expenses ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.expenses}
              onChange={(e) => set("expenses", e.target.value)}
              placeholder="0"
              className={field}
            />
          </label>
        </div>
        <label className="mt-4 block">
          <span className={label}>Expense note</span>
          <input
            value={form.expenseNote}
            onChange={(e) => set("expenseNote", e.target.value)}
            placeholder="Ice, garnishes, parking…"
            className={field}
          />
        </label>

        {/* Live breakdown */}
        <div className="mt-6 rounded-2xl border border-gold/25 bg-abyss/50 p-4">
          <div className="flex justify-between text-sm text-shell/70">
            <span>
              {form.kind === "hourly"
                ? `${n(form.hours)}h × ${usd(n(form.hourlyRate) || DEFAULT_HOURLY_RATE)}/hr`
                : `Commission (${form.pct}% of ${usd(n(form.sales))})`}
            </span>
            <span className="text-shell">{usd(basePay)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-shell/70">
            <span>Tips + bonus + expenses</span>
            <span className="text-shell">
              {usd(n(form.tips) + n(form.bonus) + n(form.expenses))}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-shell/10 pt-3">
            <span className="h-sign-med text-lg text-shell">
              {form.employee}&apos;s payout
            </span>
            <span className="h-sign text-3xl text-gold">{usd(payout)}</span>
          </div>
          {showCreditAsh && creditAsh && (
            <p className="mt-2 border-t border-shell/10 pt-2 text-xs text-shell/60">
              + Ash gets{" "}
              <span className="font-semibold text-coconut">
                {usd((n(form.sales) * ashRemainderPct) / 100)}
              </span>{" "}
              logged separately (the remaining {ashRemainderPct}%)
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            type="submit"
            disabled={status.kind === "busy"}
            className="btn-brush text-xs font-bold uppercase tracking-[0.2em] text-shell"
          >
            {status.kind === "busy"
              ? "Saving…"
              : editingTimestamp
                ? "Save changes"
                : `Log for ${form.employee}`}
          </button>
          {editingTimestamp && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-shell/60 hover:text-shell"
            >
              Cancel edit
            </button>
          )}
          {status.kind === "saved" && (
            <span className="text-xs font-semibold text-gold">Saved ✓</span>
          )}
          {status.kind === "warn" && (
            <span className="text-xs font-semibold text-coconut">
              Saved to backup ⚠
            </span>
          )}
          {status.kind === "error" && (
            <span className="text-xs text-coconut">{status.msg}</span>
          )}
        </div>
        {status.kind === "warn" && (
          <p className="mt-3 rounded-xl border border-coconut/40 bg-coconut/10 p-3 text-xs leading-relaxed text-coconut">
            {status.msg}
          </p>
        )}
      </form>

      {/* The ledger */}
      <div className="rounded-3xl border border-shell/10 bg-lagoon/20 p-6">
        <div className="flex items-center justify-between">
          <h3 className="h-sign-med text-xl text-shell">Recent payouts</h3>
          {entries.length > 0 && (
            <a
              href="/api/admin/payroll/export"
              className="rounded-full border border-shell/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-shell hover:border-gold hover:text-gold"
            >
              Download CSV
            </a>
          )}
        </div>
        {entries.length === 0 ? (
          <p className="mt-4 text-sm text-shell/60">
            Nothing logged yet — every shift you log lands here and in your
            Payroll Log spreadsheet.
          </p>
        ) : (
          <>
            <p className="mt-2 text-xs text-shell/50">
              Total paid across {entries.length} shift
              {entries.length === 1 ? "" : "s"}:{" "}
              <span className="font-semibold text-gold">{usd(paidTotal)}</span>
            </p>
            <ul className="mt-4 max-h-[480px] space-y-2.5 overflow-y-auto pr-1">
              {entries.slice(0, 60).map((e) => (
                <li
                  key={e.timestamp}
                  className={`rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                    editingTimestamp === e.timestamp
                      ? "border-gold bg-gold/10"
                      : "border-shell/10 bg-abyss/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-[11px] font-bold uppercase tracking-wide text-coconut">
                      {e.employee}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-shell/85">
                        {e.event || "—"}
                      </span>
                      <span className="text-[11px] text-shell/45">
                        {e.eventDate || e.timestamp.slice(0, 10)} ·{" "}
                        {e.kind === "hourly"
                          ? `${usd(e.hourlyRate)}/hr`
                          : `${e.commissionPct}%`}{" "}
                        · {e.hours}h
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold text-gold">
                      {usd(e.totalPayout)}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-3 pl-[68px]">
                    <button
                      type="button"
                      onClick={() => startEdit(e)}
                      className="text-[10px] font-bold uppercase tracking-[0.16em] text-shell/50 hover:text-gold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(e)}
                      className="text-[10px] font-bold uppercase tracking-[0.16em] text-shell/50 hover:text-coconut"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
