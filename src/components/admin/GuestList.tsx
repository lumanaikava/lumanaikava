"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  guestTotals,
  type Guest,
  type GuestStatus,
} from "@/lib/guests";

/**
 * The guest board — compact.
 *
 * One row per guest, single line by default, wraps on a phone. The
 * middle column is where display and action collapse into the same
 * pill: a phone chip that isn't ticked reads "have the number, haven't
 * texted"; ticked, it reads "texted"; absent means we don't have one.
 *
 * Same optimistic write pattern as before — every click writes through
 * to the sheet, rolls back on failure, and rolls the row's opacity to
 * signal in-flight.
 */

type Filter = "all" | GuestStatus;
type Channel = "phone" | "email" | "instagram";

const STATUS_LABEL: Record<GuestStatus, string> = {
  lead: "Lead",
  confirmed: "Secured",
  "checked-in": "Here",
};

export default function GuestList({
  initialGuests,
  canWrite,
  canSeed = false,
  canClear = false,
}: {
  initialGuests: Guest[];
  canWrite: boolean;
  canSeed?: boolean;
  canClear?: boolean;
}) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const totals = useMemo(() => guestTotals(guests), [guests]);
  const listIsEmpty = guests.length === 0;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (filter !== "all" && g.status !== filter) return false;
      if (!q) return true;
      return [g.name, g.email, g.phone, g.instagram, g.notes]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [guests, filter, query]);

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
          instagram: data.get("instagram"),
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
    if (!confirm(`Remove ${guest.name}?`)) return;
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

  async function seedStarterList() {
    if (
      !confirm(
        "Add the 35-name LUNA EKLIPTIKA starter list to the sheet? This can only be run once.",
      )
    )
      return;
    setSeeding(true);
    setError(null);
    setFlash(null);
    try {
      const res = await fetch("/api/admin/guests/seed", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't seed the list.");
      setFlash(`Added ${body.added} of ${body.total}. Reload to see them.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't seed the list.");
    } finally {
      setSeeding(false);
    }
  }

  async function clearAll() {
    const first = prompt(
      `Clear ALL ${guests.length} guests from the sheet? Type YES to confirm.`,
    );
    if (first !== "YES") return;
    setClearing(true);
    setError(null);
    setFlash(null);
    const before = guests;
    setGuests([]);
    try {
      const res = await fetch("/api/admin/guests/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "YES" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't clear the list.");
      setFlash(`Cleared ${before.length} guest${before.length === 1 ? "" : "s"}.`);
    } catch (err) {
      setGuests(before);
      setError(err instanceof Error ? err.message : "Couldn't clear the list.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Tallies + tools */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-shell/10 bg-abyss/40 px-4 py-2.5">
        <Tally label="Secured" value={totals.confirmed} accent="text-gold" />
        <span className="h-4 w-px bg-shell/15" aria-hidden />
        <Tally label="Leads" value={totals.leads} accent="text-shell/70" />
        <span className="h-4 w-px bg-shell/15" aria-hidden />
        <Tally label="Here" value={totals.checkedIn} accent="text-shell" />
        <span className="h-4 w-px bg-shell/15" aria-hidden />
        <Tally label="Head" value={totals.headcount} accent="text-gold" />

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-40 rounded-full border border-shell/20 bg-abyss/60 px-3 py-1 text-xs text-shell outline-none placeholder:text-shell/35 focus:border-gold"
          />
          {canClear && guests.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              disabled={clearing}
              title="Wipe every row from the sheet"
              className="rounded-full border border-coconut/50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-coconut hover:bg-coconut/10 disabled:opacity-60"
            >
              {clearing ? "Clearing…" : "Clear all"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-coconut/40 bg-coconut/10 px-4 py-2 text-xs text-coconut">
          {error}
        </p>
      )}
      {flash && (
        <p className="rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2 text-xs text-gold">
          {flash}
        </p>
      )}

      {/* One-click seed on an empty list */}
      {canSeed && listIsEmpty && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-gold/40 bg-gold/[0.06] px-4 py-3">
          <p className="text-sm text-shell/75">
            Nothing on the list yet. Drop the LUNA EKLIPTIKA starter list —
            nine leads, the house crew tagged <b>Staff · Free</b>, and the
            friends bucket.
          </p>
          <button
            type="button"
            onClick={seedStarterList}
            disabled={seeding}
            className="rounded-full bg-gold px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell disabled:opacity-60"
          >
            {seeding ? "Seeding…" : "Seed starter list (35)"}
          </button>
        </div>
      )}

      {/* Add one, inline and single-row */}
      {canWrite && (
        <form
          onSubmit={addLead}
          className="grid gap-2 rounded-2xl border border-shell/10 bg-lagoon/30 p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]"
        >
          <input
            name="name"
            required
            placeholder="Name (required)"
            className="rounded-full border border-shell/20 bg-abyss/60 px-3 py-1.5 text-xs text-shell outline-none placeholder:text-shell/35 focus:border-gold"
          />
          <input
            name="phone"
            placeholder="Phone"
            className="rounded-full border border-shell/20 bg-abyss/60 px-3 py-1.5 text-xs text-shell outline-none placeholder:text-shell/35 focus:border-gold"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="rounded-full border border-shell/20 bg-abyss/60 px-3 py-1.5 text-xs text-shell outline-none placeholder:text-shell/35 focus:border-gold"
          />
          <input
            name="instagram"
            placeholder="@instagram"
            className="rounded-full border border-shell/20 bg-abyss/60 px-3 py-1.5 text-xs text-shell outline-none placeholder:text-shell/35 focus:border-gold"
          />
          <button
            type="submit"
            disabled={adding}
            className="shrink-0 rounded-full bg-gold px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-abyss hover:bg-shell disabled:opacity-60"
          >
            {adding ? "…" : "Add"}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(["all", "lead", "confirmed", "checked-in"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
              filter === f
                ? "bg-gold text-abyss"
                : "border border-shell/20 text-shell/70 hover:border-gold hover:text-gold"
            }`}
          >
            {f === "all" ? `All ${guests.length}` : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {/* Rows */}
      {shown.length === 0 ? (
        <p className="rounded-2xl border border-shell/10 bg-lagoon/20 px-4 py-4 text-sm text-shell/60">
          {guests.length === 0
            ? "Nobody on the list yet."
            : "Nobody matches that."}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {shown.map((g) => (
            <GuestRow
              key={g.id}
              guest={g}
              busy={busyId === g.id}
              canWrite={canWrite}
              onSecure={() =>
                mutate(g, { status: "confirmed" }, { status: "confirmed" })
              }
              onCheckIn={() =>
                mutate(g, { status: "checked-in" }, { status: "checked-in" })
              }
              onUndo={() =>
                mutate(g, { status: "confirmed" }, { status: "confirmed" })
              }
              onToggleChannel={(ch, next) => {
                const key = channelFlagKey(ch);
                mutate(g, { [key]: next } as Partial<Guest>, { [key]: next });
              }}
              onToggleLabel={(label, next) => {
                const key = label === "staff" ? "isStaff" : "isFree";
                mutate(g, { [key]: next } as Partial<Guest>, { [key]: next });
              }}
              onRemove={() => remove(g)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Tally({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`h-sign text-xl leading-none ${accent}`}>{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-shell/45">
        {label}
      </span>
    </div>
  );
}

function channelFlagKey(
  ch: Channel,
): "invitedPhone" | "invitedEmail" | "invitedInstagram" {
  return ch === "phone"
    ? "invitedPhone"
    : ch === "email"
      ? "invitedEmail"
      : "invitedInstagram";
}

/** Combined display + invited-toggle pill for one contact channel. */
function ChannelChip({
  icon,
  value,
  href,
  invited,
  disabled,
  onToggle,
  channel,
}: {
  icon: string;
  value: string;
  href?: string;
  invited: boolean;
  disabled: boolean;
  onToggle: (next: boolean) => void;
  channel: Channel;
}) {
  if (!value) return null;
  const cls = invited
    ? "border-gold bg-gold/15 text-gold"
    : "border-shell/20 text-shell/65 hover:border-gold hover:text-gold";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(!invited)}
      aria-pressed={invited}
      title={
        invited
          ? `Invited via ${channel} — click to undo`
          : `Mark as invited via ${channel}`
      }
      className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-tight transition-colors disabled:cursor-not-allowed ${cls}`}
    >
      <span aria-hidden>{invited ? "✓" : icon}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="truncate underline-offset-2 hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="truncate">{value}</span>
      )}
    </button>
  );
}

function LabelPill({
  label,
  active,
  color,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  color: "violet" | "emerald";
  onClick: () => void;
  disabled: boolean;
}) {
  const palette = {
    violet: {
      on: "border-violet-400 bg-violet-400/20 text-violet-200",
      off: "border-shell/20 text-shell/55 hover:border-violet-400 hover:text-violet-300",
    },
    emerald: {
      on: "border-emerald-400 bg-emerald-400/20 text-emerald-200",
      off: "border-shell/20 text-shell/55 hover:border-emerald-400 hover:text-emerald-300",
    },
  }[color];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed ${active ? palette.on : palette.off}`}
    >
      {label}
    </button>
  );
}

function GuestRow({
  guest,
  busy,
  canWrite,
  onSecure,
  onCheckIn,
  onUndo,
  onToggleChannel,
  onToggleLabel,
  onRemove,
}: {
  guest: Guest;
  busy: boolean;
  canWrite: boolean;
  onSecure: () => void;
  onCheckIn: () => void;
  onUndo: () => void;
  onToggleChannel: (ch: Channel, next: boolean) => void;
  onToggleLabel: (label: "staff" | "free", next: boolean) => void;
  onRemove: () => void;
}) {
  const lit = guest.status === "confirmed" || guest.status === "checked-in";
  const here = guest.status === "checked-in";

  const shell = lit
    ? "border-gold/50 bg-gold/[0.08] shadow-[0_0_0_1px_rgba(212,175,106,0.2)]"
    : "border-shell/10 bg-lagoon/15";

  return (
    <li
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border px-3 py-2 transition-colors ${shell} ${busy ? "opacity-50" : ""}`}
    >
      {/* Name + inline badges */}
      <div className="min-w-0 flex-1 basis-40">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-shell">
          <span className="truncate">{guest.name}</span>
          {here && (
            <span className="rounded-full bg-teal/40 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-shell">
              Here
            </span>
          )}
          {lit && !here && (
            <span className="rounded-full bg-gold/25 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-gold">
              {guest.source === "ticket" ? "Paid" : "Secured"}
            </span>
          )}
          {guest.tickets > 1 && (
            <span className="font-mono text-[10px] text-shell/50">
              ×{guest.tickets}
            </span>
          )}
        </p>
        {guest.notes && (
          <p className="truncate text-[11px] text-shell/45">{guest.notes}</p>
        )}
      </div>

      {/* Contact chips (each combines display + invited-toggle) */}
      <div className="flex flex-wrap items-center gap-1">
        <ChannelChip
          icon="📞"
          value={guest.phone}
          invited={guest.invitedPhone}
          disabled={!canWrite || busy}
          onToggle={(next) => onToggleChannel("phone", next)}
          channel="phone"
        />
        <ChannelChip
          icon="✉"
          value={guest.email}
          invited={guest.invitedEmail}
          disabled={!canWrite || busy}
          onToggle={(next) => onToggleChannel("email", next)}
          channel="email"
        />
        <ChannelChip
          icon="@"
          value={guest.instagram}
          href={`https://instagram.com/${guest.instagram}`}
          invited={guest.invitedInstagram}
          disabled={!canWrite || busy}
          onToggle={(next) => onToggleChannel("instagram", next)}
          channel="instagram"
        />
        {!guest.phone && !guest.email && !guest.instagram && (
          <span className="text-[11px] text-shell/30">no contact</span>
        )}
      </div>

      {/* Labels + primary action */}
      {canWrite && (
        <div className="ml-auto flex flex-wrap items-center gap-1">
          <LabelPill
            label="Staff"
            active={guest.isStaff}
            color="violet"
            disabled={busy}
            onClick={() => onToggleLabel("staff", !guest.isStaff)}
          />
          <LabelPill
            label="Free"
            active={guest.isFree}
            color="emerald"
            disabled={busy}
            onClick={() => onToggleLabel("free", !guest.isFree)}
          />
          {guest.status === "lead" && (
            <button
              onClick={onSecure}
              disabled={busy}
              className="rounded-full bg-gold px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-abyss hover:bg-shell disabled:opacity-60"
            >
              Secure
            </button>
          )}
          {guest.status === "confirmed" && (
            <button
              onClick={onCheckIn}
              disabled={busy}
              className="rounded-full border border-gold/60 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-gold hover:bg-gold hover:text-abyss disabled:opacity-60"
            >
              Check in
            </button>
          )}
          {guest.status === "checked-in" && (
            <button
              onClick={onUndo}
              disabled={busy}
              className="rounded-full border border-shell/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-shell/60 hover:border-gold hover:text-gold disabled:opacity-60"
            >
              Undo
            </button>
          )}
          {guest.source === "manual" && (
            <button
              onClick={onRemove}
              disabled={busy}
              title="Remove"
              className="rounded-full border border-shell/20 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-shell/45 hover:border-coconut hover:text-coconut disabled:opacity-60"
            >
              ×
            </button>
          )}
        </div>
      )}
    </li>
  );
}
