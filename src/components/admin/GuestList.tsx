"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  guestTotals,
  type Guest,
  type GuestStatus,
} from "@/lib/guests";

/**
 * The guest board. Ticket buyers arrive on their own; leads get typed in;
 * one button moves someone from "working on them" to "locked in".
 *
 * Every change writes through to the Guest List sheet. Updates apply
 * optimistically so the board feels instant at the door, but a failed
 * write is rolled back and shown — never silently dropped.
 */

const STATUS_LABEL: Record<GuestStatus, string> = {
  lead: "Lead",
  confirmed: "Locked in",
  "checked-in": "Here",
};

const STATUS_CHIP: Record<GuestStatus, string> = {
  lead: "bg-shell/10 text-shell/60",
  confirmed: "bg-gold/15 text-gold",
  "checked-in": "bg-teal/30 text-shell",
};

type Filter = "all" | GuestStatus;

export default function GuestList({
  initialGuests,
  canWrite,
}: {
  initialGuests: Guest[];
  canWrite: boolean;
}) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const totals = useMemo(() => guestTotals(guests), [guests]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (filter !== "all" && g.status !== filter) return false;
      if (!q) return true;
      return [g.name, g.email, g.phone, g.notes]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [guests, filter, query]);

  /** Apply a change locally, push it, roll back if the write fails. */
  async function mutate(
    guest: Guest,
    patch: Partial<Guest>,
    payload: Record<string, unknown>,
  ) {
    const before = guests;
    setBusyId(guest.id);
    setError(null);
    setGuests((gs) =>
      gs.map((g) => (g.id === guest.id ? { ...g, ...patch } : g)),
    );
    try {
      const res = await fetch("/api/admin/guests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guest.id, guest, ...payload }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't save that.");
    } catch (err) {
      setGuests(before);
      setError(err instanceof Error ? err.message : "Couldn't save that.");
    } finally {
      setBusyId(null);
    }
  }

  async function addLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;

    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: data.get("email"),
          phone: data.get("phone"),
          tickets: data.get("tickets"),
          notes: data.get("notes"),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.guest) {
        throw new Error(body.error ?? "Couldn't add them.");
      }
      setGuests((gs) => [body.guest as Guest, ...gs]);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add them.");
    } finally {
      setAdding(false);
    }
  }

  async function remove(guest: Guest) {
    if (
      !confirm(
        `Remove ${guest.name} from the guest list? This can't be undone.`,
      )
    )
      return;
    const before = guests;
    setBusyId(guest.id);
    setError(null);
    setGuests((gs) => gs.filter((g) => g.id !== guest.id));
    try {
      const res = await fetch("/api/admin/guests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guest.id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't remove them.");
    } catch (err) {
      setGuests(before);
      setError(err instanceof Error ? err.message : "Couldn't remove them.");
    } finally {
      setBusyId(null);
    }
  }

  const stats = [
    { label: "Locked in", value: totals.confirmed, accent: "text-gold" },
    { label: "Leads", value: totals.leads, accent: "text-shell/70" },
    { label: "Here", value: totals.checkedIn, accent: "text-shell" },
    { label: "Headcount", value: totals.headcount, accent: "text-gold" },
    { label: "Paid tickets", value: totals.paidTickets, accent: "text-shell/70" },
  ];

  return (
    <div className="space-y-5">
      {/* Counts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-shell/10 bg-abyss/40 px-4 py-3"
          >
            <p className={`h-sign text-3xl ${s.accent}`}>{s.value}</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-shell/45">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-2xl border border-coconut/40 bg-coconut/10 px-4 py-3 text-sm text-coconut">
          {error}
        </p>
      )}

      {/* Add a lead */}
      {canWrite && (
        <form
          onSubmit={addLead}
          className="rounded-3xl border border-shell/10 bg-lagoon/30 p-5"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
            Add someone you're working on
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1.3fr_1.3fr_1fr_auto]">
            <input
              name="name"
              required
              placeholder="Name"
              className="rounded-full border border-shell/20 bg-abyss/60 px-4 py-2 text-sm text-shell outline-none placeholder:text-shell/35 focus:border-gold"
            />
            <input
              name="email"
              type="email"
              placeholder="Email (optional)"
              className="rounded-full border border-shell/20 bg-abyss/60 px-4 py-2 text-sm text-shell outline-none placeholder:text-shell/35 focus:border-gold"
            />
            <input
              name="phone"
              placeholder="Phone (optional)"
              className="rounded-full border border-shell/20 bg-abyss/60 px-4 py-2 text-sm text-shell outline-none placeholder:text-shell/35 focus:border-gold"
            />
            <div className="flex items-center gap-2">
              <label
                htmlFor="guest-tickets"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-shell/45"
              >
                Party of
              </label>
              <input
                id="guest-tickets"
                name="tickets"
                type="number"
                min={1}
                max={20}
                defaultValue={1}
                className="w-16 rounded-full border border-shell/20 bg-abyss/60 px-3 py-2 text-sm text-shell outline-none focus:border-gold"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              name="notes"
              placeholder="Notes — who they are, who invited them…"
              className="flex-1 rounded-full border border-shell/20 bg-abyss/60 px-4 py-2 text-sm text-shell outline-none placeholder:text-shell/35 focus:border-gold"
            />
            <button
              type="submit"
              disabled={adding}
              className="shrink-0 rounded-full bg-gold px-6 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell disabled:opacity-60"
            >
              {adding ? "Adding…" : "Add to list"}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "lead", "confirmed", "checked-in"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
              filter === f
                ? "bg-gold text-abyss"
                : "border border-shell/20 text-shell/70 hover:border-gold hover:text-gold"
            }`}
          >
            {f === "all" ? `All ${guests.length}` : STATUS_LABEL[f]}
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="ml-auto w-44 rounded-full border border-shell/20 bg-abyss/60 px-4 py-1.5 text-sm text-shell outline-none placeholder:text-shell/35 focus:border-gold"
        />
      </div>

      {/* The list */}
      {shown.length === 0 ? (
        <p className="rounded-3xl border border-shell/10 bg-lagoon/20 p-6 text-sm text-shell/60">
          {guests.length === 0
            ? "Nobody on the list yet. Ticket buyers land here automatically — add your leads above in the meantime."
            : "Nobody matches that."}
        </p>
      ) : (
        <ul className="divide-y divide-shell/10 rounded-3xl border border-shell/10 bg-lagoon/20">
          {shown.map((g) => {
            const busy = busyId === g.id;
            return (
              <li
                key={g.id}
                className={`grid gap-2 px-5 py-3.5 sm:grid-cols-[1.6fr_1.4fr_auto_auto] sm:items-center sm:gap-4 ${
                  busy ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold text-shell">
                    {g.name}
                    {g.source === "ticket" && (
                      <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-gold">
                        Paid
                      </span>
                    )}
                    {g.tickets > 1 && (
                      <span className="shrink-0 font-mono text-[10px] text-shell/50">
                        ×{g.tickets}
                      </span>
                    )}
                  </p>
                  {g.notes && (
                    <p className="truncate text-xs text-shell/50">{g.notes}</p>
                  )}
                </div>

                <div className="min-w-0 text-xs text-shell/55">
                  {g.email && <p className="truncate">{g.email}</p>}
                  {g.phone && <p className="truncate">{g.phone}</p>}
                  {!g.email && !g.phone && <p className="text-shell/30">—</p>}
                </div>

                <span
                  className={`justify-self-start rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] sm:justify-self-auto ${STATUS_CHIP[g.status]}`}
                >
                  {STATUS_LABEL[g.status]}
                </span>

                {canWrite && (
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {g.status === "lead" && (
                      <button
                        onClick={() =>
                          mutate(g, { status: "confirmed" }, { status: "confirmed" })
                        }
                        disabled={busy}
                        className="rounded-full bg-gold px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-abyss hover:bg-shell disabled:opacity-60"
                      >
                        Lock in
                      </button>
                    )}
                    {g.status === "confirmed" && (
                      <button
                        onClick={() =>
                          mutate(g, { status: "checked-in" }, { status: "checked-in" })
                        }
                        disabled={busy}
                        className="rounded-full border border-shell/25 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-shell hover:border-gold hover:text-gold disabled:opacity-60"
                      >
                        Check in
                      </button>
                    )}
                    {g.status === "checked-in" && (
                      <button
                        onClick={() =>
                          mutate(g, { status: "confirmed" }, { status: "confirmed" })
                        }
                        disabled={busy}
                        className="rounded-full border border-shell/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-shell/60 hover:border-gold hover:text-gold disabled:opacity-60"
                      >
                        Undo
                      </button>
                    )}
                    {g.source === "manual" && (
                      <button
                        onClick={() => remove(g)}
                        disabled={busy}
                        className="text-[10px] font-bold uppercase tracking-[0.16em] text-shell/35 hover:text-coconut disabled:opacity-60"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
