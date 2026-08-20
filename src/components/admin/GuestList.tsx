"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  guestTotals,
  type Guest,
  type GuestStatus,
} from "@/lib/guests";

/**
 * The guest board.
 *
 * Two flows onto it:
 *
 *   1. A ticket buyer arrives from Shopify already confirmed — nobody
 *      types them in, and their row is lit gold on arrival.
 *   2. A lead is added by hand. As Ash or Zach reaches out on each
 *      channel — phone, email, Instagram — a pill lights up. When the
 *      lead actually pays, one click on "Secure spot" flips the whole
 *      row to the lit-gold "secured" state.
 *
 * Every change writes through to the Guest List sheet. Updates apply
 * optimistically so the board feels instant, but a failed write is
 * rolled back and shown — never silently dropped.
 */

const STATUS_LABEL: Record<GuestStatus, string> = {
  lead: "Lead",
  confirmed: "Secured",
  "checked-in": "Here",
};

type Filter = "all" | GuestStatus;

/** Non-empty channel and, for that channel, an "invited" flag. */
type Channel = "phone" | "email" | "instagram";
const CHANNEL_LABEL: Record<Channel, string> = {
  phone: "Phone",
  email: "Email",
  instagram: "Instagram",
};

export default function GuestList({
  initialGuests,
  canWrite,
  canSeed = false,
}: {
  initialGuests: Guest[];
  canWrite: boolean;
  /**
   * Owner-only, only shown when the list is empty and the sheet is
   * connected. Zach's one-click starter seed for the LUNA night.
   */
  canSeed?: boolean;
}) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const listIsEmpty = guests.length === 0;

  async function seedStarterList() {
    if (
      !confirm(
        "Add the 35-name LUNA EKLIPTIKA starter list to the sheet? This can only be run once.",
      )
    )
      return;
    setSeeding(true);
    setError(null);
    setSeedResult(null);
    try {
      const res = await fetch("/api/admin/guests/seed", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't seed the list.");
      const failed = (body.failed as { name: string; error: string }[]) ?? [];
      if (failed.length === 0) {
        setSeedResult(
          `Added ${body.added} of ${body.total}. Reload to see them.`,
        );
      } else {
        setError(
          `Added ${body.added} of ${body.total}. Failed: ${failed
            .map((f) => f.name)
            .join(", ")}`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't seed the list.");
    } finally {
      setSeeding(false);
    }
  }

  const totals = useMemo(() => guestTotals(guests), [guests]);

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
          instagram: data.get("instagram"),
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
    { label: "Secured", value: totals.confirmed, accent: "text-gold" },
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

      {seedResult && (
        <p className="rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
          {seedResult}
        </p>
      )}

      {canSeed && listIsEmpty && (
        <div className="rounded-3xl border border-dashed border-gold/40 bg-gold/[0.06] p-5 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold">
            Nothing on the list yet
          </p>
          <p className="mt-2 max-w-md text-sm text-shell/70 mx-auto">
            Drop the LUNA EKLIPTIKA starter list into the sheet in one
            click — nine leads with contact info, the eight-name house
            crew (pre-tagged Staff + Free), and the friends bucket.
            Everyone lands as a lead with no channels ticked.
          </p>
          <button
            type="button"
            onClick={seedStarterList}
            disabled={seeding}
            className="mt-4 rounded-full bg-gold px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell disabled:opacity-60"
          >
            {seeding ? "Seeding…" : "Seed starter list (35)"}
          </button>
        </div>
      )}

      {/* Add a lead */}
      {canWrite && (
        <form
          onSubmit={addLead}
          className="rounded-3xl border border-shell/10 bg-lagoon/30 p-5"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
            Add someone you&rsquo;re working on
          </p>
          <p className="mt-1 text-xs text-shell/50">
            Name is enough. Fill what you have — phone, email, Instagram —
            and check them off as you invite them on each channel.
          </p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <input
              name="name"
              required
              placeholder="Name"
              className="rounded-full border border-shell/20 bg-abyss/60 px-4 py-2 text-sm text-shell outline-none placeholder:text-shell/35 focus:border-gold"
            />
            <input
              name="phone"
              placeholder="Phone (optional)"
              className="rounded-full border border-shell/20 bg-abyss/60 px-4 py-2 text-sm text-shell outline-none placeholder:text-shell/35 focus:border-gold"
            />
            <input
              name="email"
              type="email"
              placeholder="Email (optional)"
              className="rounded-full border border-shell/20 bg-abyss/60 px-4 py-2 text-sm text-shell outline-none placeholder:text-shell/35 focus:border-gold"
            />
            <input
              name="instagram"
              placeholder="Instagram handle (optional)"
              className="rounded-full border border-shell/20 bg-abyss/60 px-4 py-2 text-sm text-shell outline-none placeholder:text-shell/35 focus:border-gold"
            />
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              name="notes"
              placeholder="Notes — who they are, who invited them…"
              className="flex-1 rounded-full border border-shell/20 bg-abyss/60 px-4 py-2 text-sm text-shell outline-none placeholder:text-shell/35 focus:border-gold"
            />
            <label className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-shell/45">
                Party of
              </span>
              <input
                name="tickets"
                type="number"
                min={1}
                max={20}
                defaultValue={1}
                className="w-16 rounded-full border border-shell/20 bg-abyss/60 px-3 py-2 text-sm text-shell outline-none focus:border-gold"
              />
            </label>
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
        <ul className="space-y-2">
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

/** Which boolean on Guest matches a channel. */
function channelFlagKey(
  ch: Channel,
): "invitedPhone" | "invitedEmail" | "invitedInstagram" {
  return ch === "phone"
    ? "invitedPhone"
    : ch === "email"
      ? "invitedEmail"
      : "invitedInstagram";
}

/** The one channel row for a guest — three pill toggles, dim if unpopulated. */
function ChannelPills({
  guest,
  disabled,
  onToggle,
}: {
  guest: Guest;
  disabled: boolean;
  onToggle: (ch: Channel, next: boolean) => void;
}) {
  const rows: { ch: Channel; has: string; flag: boolean }[] = [
    { ch: "phone", has: guest.phone, flag: guest.invitedPhone },
    { ch: "email", has: guest.email, flag: guest.invitedEmail },
    { ch: "instagram", has: guest.instagram, flag: guest.invitedInstagram },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {rows.map(({ ch, has, flag }) => {
        const can = Boolean(has) && !disabled;
        const cls = flag
          ? "border-gold bg-gold/20 text-gold"
          : has
            ? "border-shell/25 text-shell/60 hover:border-gold hover:text-gold"
            : "border-shell/10 text-shell/25";
        return (
          <button
            key={ch}
            type="button"
            disabled={!can}
            onClick={() => onToggle(ch, !flag)}
            aria-pressed={flag}
            title={
              has
                ? flag
                  ? `Invited via ${CHANNEL_LABEL[ch].toLowerCase()} — click to undo`
                  : `Mark as invited via ${CHANNEL_LABEL[ch].toLowerCase()}`
                : `No ${CHANNEL_LABEL[ch].toLowerCase()} on file`
            }
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed ${cls}`}
          >
            <span aria-hidden>{flag ? "✓" : "○"}</span>
            {CHANNEL_LABEL[ch]}
          </button>
        );
      })}
    </div>
  );
}

/** One guest — normal by default, LIT gold when secured. */
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
  // A row is "lit" when they've paid OR someone flipped the Secure switch.
  const lit = guest.status === "confirmed" || guest.status === "checked-in";
  const here = guest.status === "checked-in";

  const shell = lit
    ? "border-gold/60 bg-gradient-to-r from-gold/[0.14] via-gold/[0.06] to-gold/[0.14] shadow-[0_0_0_1px_rgba(212,175,106,0.25),0_12px_36px_-18px_rgba(212,175,106,0.55)]"
    : "border-shell/10 bg-lagoon/20";

  return (
    <li
      className={`grid gap-3 rounded-2xl border px-5 py-3.5 transition-colors sm:grid-cols-[1.4fr_1.4fr_auto] sm:items-center sm:gap-5 ${shell} ${busy ? "opacity-50" : ""}`}
    >
      {/* Identity */}
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-shell">
          <span className="truncate">{guest.name}</span>
          {here && (
            <span className="shrink-0 rounded-full bg-teal/40 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-shell">
              Here
            </span>
          )}
          {lit && !here && (
            <span className="shrink-0 rounded-full bg-gold/25 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-gold">
              {guest.source === "ticket" ? "Paid" : "Secured"}
            </span>
          )}
          {guest.isStaff && (
            <span className="shrink-0 rounded-full bg-violet-400/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-violet-300">
              Staff
            </span>
          )}
          {guest.isFree && (
            <span className="shrink-0 rounded-full bg-emerald-400/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-300">
              Free
            </span>
          )}
          {guest.tickets > 1 && (
            <span className="shrink-0 font-mono text-[10px] text-shell/50">
              ×{guest.tickets}
            </span>
          )}
        </p>
        {guest.notes && (
          <p className="mt-0.5 truncate text-xs text-shell/50">{guest.notes}</p>
        )}
      </div>

      {/* Contact + outreach pills */}
      <div className="min-w-0 space-y-1.5">
        <div className="space-y-0.5 text-[11px] leading-tight text-shell/60">
          {guest.phone && <p className="truncate">📞 {guest.phone}</p>}
          {guest.email && <p className="truncate">✉ {guest.email}</p>}
          {guest.instagram && (
            <p className="truncate">
              <a
                href={`https://instagram.com/${guest.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
              >
                @{guest.instagram}
              </a>
            </p>
          )}
          {!guest.phone && !guest.email && !guest.instagram && (
            <p className="text-shell/30">No contact yet</p>
          )}
        </div>
        <ChannelPills
          guest={guest}
          disabled={!canWrite || busy}
          onToggle={onToggleChannel}
        />
      </div>

      {/* Actions */}
      {canWrite && (
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggleLabel("staff", !guest.isStaff)}
              aria-pressed={guest.isStaff}
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed ${
                guest.isStaff
                  ? "border-violet-400 bg-violet-400/20 text-violet-200"
                  : "border-shell/25 text-shell/60 hover:border-violet-400 hover:text-violet-300"
              }`}
            >
              Staff
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggleLabel("free", !guest.isFree)}
              aria-pressed={guest.isFree}
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed ${
                guest.isFree
                  ? "border-emerald-400 bg-emerald-400/20 text-emerald-200"
                  : "border-shell/25 text-shell/60 hover:border-emerald-400 hover:text-emerald-300"
              }`}
            >
              Free
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          {guest.status === "lead" && (
            <button
              onClick={onSecure}
              disabled={busy}
              className="rounded-full bg-gold px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-abyss hover:bg-shell disabled:opacity-60"
            >
              Secure spot
            </button>
          )}
          {guest.status === "confirmed" && (
            <button
              onClick={onCheckIn}
              disabled={busy}
              className="rounded-full border border-gold/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold hover:bg-gold hover:text-abyss disabled:opacity-60"
            >
              Check in
            </button>
          )}
          {guest.status === "checked-in" && (
            <button
              onClick={onUndo}
              disabled={busy}
              className="rounded-full border border-shell/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-shell/60 hover:border-gold hover:text-gold disabled:opacity-60"
            >
              Undo
            </button>
          )}
          {guest.source === "manual" && (
            <button
              onClick={onRemove}
              disabled={busy}
              className="text-[10px] font-bold uppercase tracking-[0.16em] text-shell/35 hover:text-coconut disabled:opacity-60"
            >
              Remove
            </button>
          )}
          </div>
        </div>
      )}
    </li>
  );
}
