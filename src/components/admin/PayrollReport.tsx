"use client";

import { useMemo, useState } from "react";
import type { PayrollEntry, PayrollKind } from "@/lib/payroll";

const CREW = ["Ash", "Zach", "Karina"];

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function rateLabel(e: PayrollEntry) {
  return e.kind === "hourly" ? `${usd(e.hourlyRate)}/hr` : `${e.commissionPct}%`;
}

/**
 * Normalize a date string to YYYY-MM-DD for sorting/comparison. Google
 * Sheets silently converts date-looking text typed straight into a cell
 * into its own Date value, which can come back as M/D/YYYY depending on
 * the sheet's locale — so entries may arrive in either format.
 */
function normalizeDate(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, mo, d, y] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return raw;
}

type SortKey =
  | "date"
  | "employee"
  | "kind"
  | "event"
  | "hours"
  | "sales"
  | "basePay"
  | "tips"
  | "bonus"
  | "expenses"
  | "total"
  | "loggedBy";

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "date", label: "Date" },
  { key: "employee", label: "Employee" },
  { key: "kind", label: "Type" },
  { key: "event", label: "Event / task" },
  { key: "hours", label: "Hours", numeric: true },
  { key: "sales", label: "Sales", numeric: true },
  { key: "basePay", label: "Base pay", numeric: true },
  { key: "tips", label: "Tips", numeric: true },
  { key: "bonus", label: "Bonus", numeric: true },
  { key: "expenses", label: "Expenses", numeric: true },
  { key: "total", label: "Total", numeric: true },
  { key: "loggedBy", label: "Logged by" },
];

function sortValue(e: PayrollEntry, key: SortKey): string | number {
  switch (key) {
    case "date":
      return normalizeDate(e.eventDate || e.timestamp);
    case "employee":
      return e.employee;
    case "kind":
      return e.kind;
    case "event":
      return e.event;
    case "hours":
      return e.hours;
    case "sales":
      return e.sales;
    case "basePay":
      return e.commissionAmt;
    case "tips":
      return e.tips;
    case "bonus":
      return e.bonus;
    case "expenses":
      return e.expenses;
    case "total":
      return e.totalPayout;
    case "loggedBy":
      return e.loggedBy;
  }
}

type Totals = {
  shifts: number;
  hours: number;
  sales: number;
  commission: number;
  hourly: number;
  tips: number;
  bonus: number;
  expenses: number;
  total: number;
};

function totalsOf(rows: PayrollEntry[]): Totals {
  const t: Totals = {
    shifts: rows.length,
    hours: 0,
    sales: 0,
    commission: 0,
    hourly: 0,
    tips: 0,
    bonus: 0,
    expenses: 0,
    total: 0,
  };
  for (const r of rows) {
    t.hours += r.hours;
    t.sales += r.sales;
    if (r.kind === "hourly") t.hourly += r.commissionAmt;
    else t.commission += r.commissionAmt;
    t.tips += r.tips;
    t.bonus += r.bonus;
    t.expenses += r.expenses;
    t.total += r.totalPayout;
  }
  return t;
}

export default function PayrollReport({ entries }: { entries: PayrollEntry[] }) {
  const [employeeFilter, setEmployeeFilter] = useState<string>("All");
  const [kindFilter, setKindFilter] = useState<"All" | PayrollKind>("All");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Always show the full roster, even an employee with zero shifts yet.
  const roster = useMemo(() => {
    const names = new Set(CREW);
    for (const e of entries) names.add(e.employee);
    return [...names];
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter(
      (e) =>
        (employeeFilter === "All" || e.employee === employeeFilter) &&
        (kindFilter === "All" || e.kind === kindFilter),
    );
  }, [entries, employeeFilter, kindFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const filteredTotals = useMemo(() => totalsOf(filtered), [filtered]);
  const companyTotals = useMemo(() => totalsOf(entries), [entries]);
  const perEmployee = useMemo(
    () =>
      roster.map((employee) => ({
        employee,
        ...totalsOf(entries.filter((e) => e.employee === employee)),
      })),
    [roster, entries],
  );

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "date" ? "desc" : "asc");
    }
  }

  const cell = "px-3 py-2 whitespace-nowrap";
  const num = `${cell} text-right tabular-nums`;
  const label = "text-[10px] font-semibold uppercase tracking-[0.16em] text-shell/50";

  if (entries.length === 0) {
    return (
      <p className="rounded-3xl border border-shell/10 bg-lagoon/20 p-8 text-sm text-shell/70">
        No shifts logged yet — once someone logs one in the Command Center,
        it shows up here with running totals.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Roster totals — always the full company, unfiltered */}
      <div className="overflow-x-auto rounded-3xl border border-shell/10 bg-lagoon/20">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-shell/15 bg-abyss/50">
              <th className={`${cell} text-left ${label}`}>Employee</th>
              <th className={`${num} ${label}`}>Shifts</th>
              <th className={`${num} ${label}`}>Hours</th>
              <th className={`${num} ${label}`}>Sales</th>
              <th className={`${num} ${label}`}>Commission</th>
              <th className={`${num} ${label}`}>Hourly pay</th>
              <th className={`${num} ${label}`}>Tips</th>
              <th className={`${num} ${label}`}>Bonus</th>
              <th className={`${num} ${label}`}>Expenses</th>
              <th className={`${num} ${label}`}>Total payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-shell/10">
            {perEmployee.map((r) => (
              <tr key={r.employee} className="hover:bg-abyss/30">
                <td className={`${cell} font-semibold text-shell`}>{r.employee}</td>
                <td className={`${num} text-shell/80`}>{r.shifts}</td>
                <td className={`${num} text-shell/80`}>{r.hours}</td>
                <td className={`${num} text-shell/80`}>{usd(r.sales)}</td>
                <td className={`${num} text-shell/80`}>{usd(r.commission)}</td>
                <td className={`${num} text-shell/80`}>{usd(r.hourly)}</td>
                <td className={`${num} text-shell/80`}>{usd(r.tips)}</td>
                <td className={`${num} text-shell/80`}>{usd(r.bonus)}</td>
                <td className={`${num} text-shell/80`}>{usd(r.expenses)}</td>
                <td className={`${num} font-semibold text-gold`}>{usd(r.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gold/25 bg-abyss/60">
              <td className={`${cell} h-sign-med text-shell`}>Company total</td>
              <td className={`${num} font-semibold text-shell`}>{companyTotals.shifts}</td>
              <td className={`${num} font-semibold text-shell`}>{companyTotals.hours}</td>
              <td className={`${num} font-semibold text-shell`}>{usd(companyTotals.sales)}</td>
              <td className={`${num} font-semibold text-shell`}>{usd(companyTotals.commission)}</td>
              <td className={`${num} font-semibold text-shell`}>{usd(companyTotals.hourly)}</td>
              <td className={`${num} font-semibold text-shell`}>{usd(companyTotals.tips)}</td>
              <td className={`${num} font-semibold text-shell`}>{usd(companyTotals.bonus)}</td>
              <td className={`${num} font-semibold text-shell`}>{usd(companyTotals.expenses)}</td>
              <td className={`${num} h-sign-med text-gold`}>{usd(companyTotals.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-1.5">
          <span className={`${label} mr-1 self-center`}>Employee</span>
          {["All", ...CREW].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setEmployeeFilter(name)}
              className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                employeeFilter === name
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-shell/25 text-shell/60 hover:border-shell/50"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className={`${label} mr-1 self-center`}>Type</span>
          {(["All", "event", "hourly"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKindFilter(k)}
              className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                kindFilter === k
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-shell/25 text-shell/60 hover:border-shell/50"
              }`}
            >
              {k === "All" ? "All" : k === "event" ? "Event" : "Hourly"}
            </button>
          ))}
        </div>
        <a
          href="/api/admin/payroll/export"
          className="ml-auto rounded-full border border-shell/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-shell hover:border-gold hover:text-gold"
        >
          Download raw CSV
        </a>
      </div>

      {/* The ledger — every shift, sortable, with a live total for whatever's filtered */}
      <div className="overflow-x-auto rounded-3xl border border-shell/10 bg-lagoon/20">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-shell/15 bg-abyss/50">
              {COLUMNS.map((c) => (
                <th key={c.key} className={c.numeric ? `${num} ${label}` : `${cell} text-left ${label}`}>
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className="inline-flex items-center gap-1 uppercase tracking-[0.16em] text-shell/50 transition-colors hover:text-gold"
                  >
                    {c.label}
                    {sortKey === c.key && (
                      <span className="text-gold">{sortDir === "asc" ? "▲" : "▼"}</span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-shell/10">
            {sorted.map((e) => (
              <tr key={e.timestamp} className="hover:bg-abyss/30">
                <td className={`${cell} text-shell/80`}>
                  {normalizeDate(e.eventDate || e.timestamp.slice(0, 10))}
                </td>
                <td className={`${cell} font-semibold text-shell`}>{e.employee}</td>
                <td className={`${cell} text-shell/60`}>{e.kind === "hourly" ? "Kitchen" : "Event"}</td>
                <td className={`${cell} text-shell/80`}>{e.event || "—"}</td>
                <td className={`${num} text-shell/80`}>{e.hours}</td>
                <td className={`${num} text-shell/80`}>{e.kind === "hourly" ? "—" : usd(e.sales)}</td>
                <td className={`${num} text-shell/80`}>
                  {usd(e.commissionAmt)}
                  <span className="ml-1 text-[10px] text-shell/40">{rateLabel(e)}</span>
                </td>
                <td className={`${num} text-shell/80`}>{usd(e.tips)}</td>
                <td className={`${num} text-shell/80`}>{usd(e.bonus)}</td>
                <td className={`${num} text-shell/80`}>{usd(e.expenses)}</td>
                <td className={`${num} font-semibold text-gold`}>{usd(e.totalPayout)}</td>
                <td className={`${cell} text-shell/50`}>{e.loggedBy}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gold/25 bg-abyss/60">
              <td className={`${cell} h-sign-med text-shell`} colSpan={4}>
                {employeeFilter === "All" && kindFilter === "All"
                  ? "All shifts"
                  : `Filtered (${filteredTotals.shifts} shift${filteredTotals.shifts === 1 ? "" : "s"})`}
              </td>
              <td className={`${num} font-semibold text-shell`}>{filteredTotals.hours}</td>
              <td className={`${num} font-semibold text-shell`}>{usd(filteredTotals.sales)}</td>
              <td className={`${num} font-semibold text-shell`}>
                {usd(filteredTotals.commission + filteredTotals.hourly)}
              </td>
              <td className={`${num} font-semibold text-shell`}>{usd(filteredTotals.tips)}</td>
              <td className={`${num} font-semibold text-shell`}>{usd(filteredTotals.bonus)}</td>
              <td className={`${num} font-semibold text-shell`}>{usd(filteredTotals.expenses)}</td>
              <td className={`${num} h-sign-med text-gold`}>{usd(filteredTotals.total)}</td>
              <td className={cell}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
