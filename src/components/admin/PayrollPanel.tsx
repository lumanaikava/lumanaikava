"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { PayrollEntry } from "@/lib/payroll";

const CREW = ["Ash", "Zach", "Karina"];
const TIERS = [10, 15, 20, 25];

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function PayrollPanel({
  initialEntries,
  defaultEmployee,
}: {
  initialEntries: PayrollEntry[];
  defaultEmployee: string;
}) {
  const [entries, setEntries] = useState<PayrollEntry[]>(initialEntries);
  const [employee, setEmployee] = useState(
    CREW.includes(defaultEmployee) ? defaultEmployee : CREW[0],
  );
  const [pct, setPct] = useState(15);
  const [sales, setSales] = useState("");
  const [tips, setTips] = useState("");
  const [bonus, setBonus] = useState("");
  const [expenses, setExpenses] = useState("");
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "busy" } | { kind: "error"; msg: string } | { kind: "saved" }
  >({ kind: "idle" });

  const n = (s: string) => {
    const v = Number(s);
    return Number.isFinite(v) && v > 0 ? v : 0;
  };

  const commission = useMemo(() => (n(sales) * pct) / 100, [sales, pct]);
  const payout = useMemo(
    () => commission + n(tips) + n(bonus) + n(expenses),
    [commission, tips, bonus, expenses],
  );

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "busy" });
    const res = await fetch("/api/admin/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, employee, commissionPct: pct }),
    });
    if (res.ok) {
      const { entry } = await res.json();
      setEntries((prev) => [entry, ...prev]);
      setSales("");
      setTips("");
      setBonus("");
      setExpenses("");
      form.reset();
      setStatus({ kind: "saved" });
      setTimeout(() => setStatus({ kind: "idle" }), 3500);
    } else {
      const body = await res.json().catch(() => ({}));
      setStatus({ kind: "error", msg: body.error ?? "Couldn't save." });
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
          <h3 className="h-sign-med text-xl text-shell">Log a shift</h3>
          <div className="flex gap-1.5">
            {CREW.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setEmployee(c)}
                className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  employee === c
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-shell/25 text-shell/60 hover:border-shell/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Event</span>
            <input name="event" required placeholder="Sweat Equity Heat Wave" className={field} />
          </label>
          <label className="block">
            <span className={label}>Event date</span>
            <input name="eventDate" type="date" className={field} />
          </label>
          <label className="block">
            <span className={label}>Hours worked</span>
            <input name="hours" type="number" min="0" step="0.25" placeholder="5" className={field} />
          </label>
          <label className="block">
            <span className={label}>Event total sales ($)</span>
            <input
              name="sales"
              type="number"
              min="0"
              step="0.01"
              value={sales}
              onChange={(e) => setSales(e.target.value)}
              placeholder="1800"
              className={field}
            />
          </label>
        </div>

        <div className="mt-4">
          <span className={label}>Commission tier</span>
          <div className="mt-1 flex gap-2">
            {TIERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPct(t)}
                className={`flex-1 rounded-xl border py-2 text-sm font-bold transition-colors ${
                  pct === t
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-shell/20 text-shell/60 hover:border-shell/40"
                }`}
              >
                {t}%
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={label}>Tips ($)</span>
            <input
              name="tips"
              type="number"
              min="0"
              step="0.01"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="120"
              className={field}
            />
          </label>
          <label className="block">
            <span className={label}>Bonus ($)</span>
            <input
              name="bonus"
              type="number"
              min="0"
              step="0.01"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              placeholder="0"
              className={field}
            />
          </label>
          <label className="block">
            <span className={label}>Expenses ($)</span>
            <input
              name="expenses"
              type="number"
              min="0"
              step="0.01"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              placeholder="0"
              className={field}
            />
          </label>
        </div>
        <label className="mt-4 block">
          <span className={label}>Expense note</span>
          <input name="expenseNote" placeholder="Ice, garnishes, parking…" className={field} />
        </label>

        {/* Live breakdown */}
        <div className="mt-6 rounded-2xl border border-gold/25 bg-abyss/50 p-4">
          <div className="flex justify-between text-sm text-shell/70">
            <span>Commission ({pct}% of {usd(n(sales))})</span>
            <span className="text-shell">{usd(commission)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-shell/70">
            <span>Tips + bonus + expenses</span>
            <span className="text-shell">
              {usd(n(tips) + n(bonus) + n(expenses))}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-shell/10 pt-3">
            <span className="h-sign-med text-lg text-shell">Total payout</span>
            <span className="h-sign text-3xl text-gold">{usd(payout)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            type="submit"
            disabled={status.kind === "busy"}
            className="btn-brush text-xs font-bold uppercase tracking-[0.2em] text-shell"
          >
            {status.kind === "busy" ? "Saving…" : `Log for ${employee}`}
          </button>
          {status.kind === "saved" && (
            <span className="text-xs font-semibold text-gold">Saved ✓</span>
          )}
          {status.kind === "error" && (
            <span className="text-xs text-coconut">{status.msg}</span>
          )}
        </div>
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
            <ul className="mt-4 max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
              {entries.slice(0, 40).map((e, i) => (
                <li
                  key={e.timestamp + i}
                  className="flex items-center gap-3 rounded-xl border border-shell/10 bg-abyss/40 px-4 py-2.5 text-sm"
                >
                  <span className="w-14 shrink-0 text-[11px] font-bold uppercase tracking-wide text-coconut">
                    {e.employee}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-shell/85">
                      {e.event || "—"}
                    </span>
                    <span className="text-[11px] text-shell/45">
                      {e.eventDate || e.timestamp.slice(0, 10)} · {e.commissionPct}% ·{" "}
                      {e.hours}h
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-gold">
                    {usd(e.totalPayout)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
