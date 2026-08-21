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
/** Tag filters — ANDed together with the status filter. Toggle to add. */
type TagFilter = "staff" | "free" | "discount20" | "invited" | "notInvited";

const STATUS_LABEL: Record<GuestStatus, string> = {
  lead: "Lead",
  confirmed: "Secured",
  "checked-in": "Here",
};

const TAG_LABEL: Record<TagFilter, string> = {
  staff: "Staff",
  free: "Free",
  discount20: "$20",
  invited: "Invited",
  notInvited: "Not invited",
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
  /** Which row is open for edit. Only one at a time — the panel is a
      Guest-shaped form, and two open panels racing is a hazard. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tags, setTags] = useState<Set<TagFilter>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  /** Row currently under the cursor during a drag — for the drop preview. */
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const toggleTag = (t: TagFilter) => {
    setTags((cur) => {
      const next = new Set(cur);
      if (next.has(t)) next.delete(t);
      else {
        // "Invited" and "Not invited" are opposites — turning one on
        // clears the other so the filter never contradicts itself.
        if (t === "invited") next.delete("notInvited");
        if (t === "notInvited") next.delete("invited");
        next.add(t);
      }
      return next;
    });
  };

  const totals = useMemo(() => guestTotals(guests), [guests]);
  const listIsEmpty = guests.length === 0;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests
      .filter((g) => {
        if (filter !== "all" && g.status !== filter) return false;
        if (tags.has("staff") && !g.isStaff) return false;
        if (tags.has("free") && !g.isFree) return false;
        if (tags.has("discount20") && !g.isDiscount20) return false;
        if (tags.has("invited") && !g.invited) return false;
        if (tags.has("notInvited") && g.invited) return false;
        if (!q) return true;
        return [g.name, g.email, g.phone, g.instagram, g.staffTitle, g.notes]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => {
        const sa = a.sort || Date.parse(a.addedAt || "") || 0;
        const sb = b.sort || Date.parse(b.addedAt || "") || 0;
        return sb - sa;
      });
  }, [guests, filter, query, tags]);

  /**
   * Compute a new `sort` value that places `movedId` just above
   * `targetId`, using the current on-screen order.
   *
   * Fractional indexing: the new sort is the midpoint between the
   * target and whatever sat above it, so a reorder writes exactly one
   * row rather than reshuffling the whole list.
   */
  async function reorder(movedId: string, targetId: string) {
    if (movedId === targetId) return;
    const list = guests
      .slice()
      .sort((a, b) => b.sort - a.sort || (b.addedAt || "").localeCompare(a.addedAt || ""));
    const moved = list.find((g) => g.id === movedId);
    const targetIdx = list.findIndex((g) => g.id === targetId);
    if (!moved || targetIdx === -1) return;

    // Skip the moved row when picking the "above" reference — otherwise
    // dropping onto the row directly below yourself picks yourself as
    // the neighbour and the sort value doesn't change.
    let aboveIdx = targetIdx - 1;
    if (list[aboveIdx]?.id === movedId) aboveIdx -= 1;

    const targetSort = list[targetIdx].sort || Date.parse(list[targetIdx].addedAt) || 0;
    const above = list[aboveIdx];
    const aboveSort = above
      ? above.sort || Date.parse(above.addedAt) || 0
      : targetSort + 2000;
    const newSort = (aboveSort + targetSort) / 2;
    await mutate(moved, { sort: newSort }, { sort: newSort });
  }

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

      {/* Filters — status on the left, tag filters on the right */}
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
        <span className="mx-1 h-4 w-px bg-shell/15" aria-hidden />
        {(["staff", "free", "discount20", "invited", "notInvited"] as TagFilter[]).map(
          (t) => {
            const active = tags.has(t);
            const palette =
              t === "staff"
                ? "border-violet-400 bg-violet-400/20 text-violet-200"
                : t === "free"
                  ? "border-emerald-400 bg-emerald-400/20 text-emerald-200"
                  : t === "discount20"
                    ? "border-amber-400 bg-amber-400/20 text-amber-200"
                    : "border-gold bg-gold/20 text-gold";
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? palette
                    : "border border-shell/20 text-shell/60 hover:border-gold hover:text-gold"
                }`}
              >
                {TAG_LABEL[t]}
              </button>
            );
          },
        )}
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
              editing={editingId === g.id}
              isDragging={dragId === g.id}
              isDropTarget={dropTarget === g.id && dragId !== null && dragId !== g.id}
              onDragStart={() => setDragId(g.id)}
              onDragEnter={() => {
                if (dragId && dragId !== g.id) setDropTarget(g.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setDropTarget(null);
              }}
              onDropHere={async () => {
                if (dragId && dragId !== g.id) await reorder(dragId, g.id);
                setDragId(null);
                setDropTarget(null);
              }}
              onEditToggle={() =>
                setEditingId((cur) => (cur === g.id ? null : g.id))
              }
              onSaveEdit={async (patch) => {
                await mutate(g, patch, patch);
                setEditingId(null);
              }}
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
                const key =
                  label === "staff"
                    ? "isStaff"
                    : label === "free"
                      ? "isFree"
                      : "isDiscount20";
                mutate(g, { [key]: next } as Partial<Guest>, { [key]: next });
              }}
              onToggleInvited={(next) =>
                mutate(g, { invited: next }, { invited: next })
              }
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
  color: "violet" | "emerald" | "amber" | "gold";
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
    amber: {
      on: "border-amber-400 bg-amber-400/20 text-amber-200",
      off: "border-shell/20 text-shell/55 hover:border-amber-400 hover:text-amber-300",
    },
    gold: {
      on: "border-gold bg-gold/20 text-gold",
      off: "border-shell/20 text-shell/55 hover:border-gold hover:text-gold",
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
  editing,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDropHere,
  onEditToggle,
  onSaveEdit,
  onSecure,
  onCheckIn,
  onUndo,
  onToggleChannel,
  onToggleLabel,
  onToggleInvited,
  onRemove,
}: {
  guest: Guest;
  busy: boolean;
  canWrite: boolean;
  editing: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDropHere: () => void;
  onEditToggle: () => void;
  onSaveEdit: (patch: Partial<Guest>) => Promise<void>;
  onSecure: () => void;
  onCheckIn: () => void;
  onUndo: () => void;
  onToggleChannel: (ch: Channel, next: boolean) => void;
  onToggleLabel: (label: "staff" | "free" | "discount20", next: boolean) => void;
  onToggleInvited: (next: boolean) => void;
  onRemove: () => void;
}) {
  const lit = guest.status === "confirmed" || guest.status === "checked-in";
  const here = guest.status === "checked-in";

  /**
   * Shell: border colour tracks labels, background tracks status. Zach
   * asked for a purple ring around staff and a green ring around free —
   * when a row is both (the eight house names), the outer BORDER is
   * violet and an inner emerald box-shadow layer sits behind it, so
   * both colours land at once.
   *
   * The lit-gold state for Secured/Here keeps its own background; the
   * label rings sit on top of it rather than fighting.
   */
  const bg = lit ? "bg-gold/[0.08]" : "bg-lagoon/15";
  // Border colour: staff (violet) beats free (emerald) beats $20 (amber)
  // beats lit-gold, so the outermost ring reads at a glance.
  const border = guest.isStaff
    ? "border-violet-400/70"
    : guest.isFree
      ? "border-emerald-400/70"
      : guest.isDiscount20
        ? "border-amber-400/70"
        : lit
          ? "border-gold/50"
          : "border-shell/10";
  /**
   * Combine multiple labels via inset box-shadows so a row that's Staff
   * AND Free (the eight house names) shows both — outer border violet,
   * inner shadow emerald. Inline style (rather than a Tailwind class)
   * because the shadow list is computed and Tailwind won't tree-shake
   * dynamic arbitrary values.
   */
  const shadow = (() => {
    const inner: string[] = [];
    if (guest.isStaff && guest.isFree) {
      inner.push("inset 0 0 0 2px rgba(52,211,153,0.55)");
    }
    if (guest.isStaff && guest.isDiscount20) {
      inner.push("inset 0 0 0 2px rgba(251,191,36,0.55)");
    }
    if (guest.isFree && guest.isDiscount20 && !guest.isStaff) {
      inner.push("inset 0 0 0 2px rgba(251,191,36,0.55)");
    }
    if (isDropTarget) {
      inner.push("0 -3px 0 rgba(212,175,106,0.9)");
    } else if (lit && inner.length === 0) {
      inner.push("0 0 0 1px rgba(212,175,106,0.2)");
    }
    return inner.join(", ");
  })();

  const shell = `${bg} ${border}`;
  const dragOpacity = isDragging ? "opacity-50" : "";
  const busyOpacity = busy && !isDragging ? "opacity-50" : "";

  return (
    <li
      draggable={canWrite}
      onDragStart={(e) => {
        onDragStart();
        e.dataTransfer.effectAllowed = "move";
        try {
          e.dataTransfer.setData("text/plain", guest.id);
        } catch {
          /* some browsers throw on programmatic drags; the move still works */
        }
      }}
      onDragEnter={onDragEnter}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDropHere();
      }}
      onDragEnd={onDragEnd}
      style={{ boxShadow: shadow || undefined }}
      className={`rounded-xl border px-3 py-2 transition-colors ${shell} ${dragOpacity} ${busyOpacity} ${canWrite ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {/* Drag handle — a decoration inside the row, but the whole row is
          draggable, so this is really a visual affordance. */}
      {canWrite && (
        <span
          aria-hidden
          className="hidden text-shell/30 sm:inline-block"
          title="Drag to reorder"
        >
          ⋮⋮
        </span>
      )}
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
          {guest.isStaff && guest.staffTitle && (
            <span className="rounded-full bg-violet-400/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-violet-200">
              {guest.staffTitle}
            </span>
          )}
          {guest.isDiscount20 && (
            <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-amber-200">
              $20
            </span>
          )}
          {guest.invited && (
            <span className="rounded-full bg-gold/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-gold">
              Invited
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
          <LabelPill
            label="$20"
            active={guest.isDiscount20}
            color="amber"
            disabled={busy}
            onClick={() => onToggleLabel("discount20", !guest.isDiscount20)}
          />
          <LabelPill
            label="Invited"
            active={guest.invited}
            color="gold"
            disabled={busy}
            onClick={() => onToggleInvited(!guest.invited)}
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
          <button
            onClick={onEditToggle}
            disabled={busy}
            title={editing ? "Close editor" : "Edit fields"}
            className={`rounded-full border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors disabled:opacity-60 ${
              editing
                ? "border-gold bg-gold/15 text-gold"
                : "border-shell/20 text-shell/55 hover:border-gold hover:text-gold"
            }`}
          >
            Edit
          </button>
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
    </div>
    {editing && canWrite && (
      <EditPanel guest={guest} busy={busy} onSave={onSaveEdit} onCancel={onEditToggle} />
    )}
    </li>
  );
}

/** The inline edit form. Only fields the row exposes elsewhere show up. */
function EditPanel({
  guest,
  busy,
  onSave,
  onCancel,
}: {
  guest: Guest;
  busy: boolean;
  onSave: (patch: Partial<Guest>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(guest.name);
  const [phone, setPhone] = useState(guest.phone);
  const [email, setEmail] = useState(guest.email);
  const [instagram, setInstagram] = useState(guest.instagram);
  const [staffTitle, setStaffTitle] = useState(guest.staffTitle);
  const [notes, setNotes] = useState(guest.notes);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    // Only send what actually changed — the API tolerates a full patch,
    // but a smaller one means the sheet update touches fewer rows.
    const patch: Partial<Guest> = {};
    if (name.trim() !== guest.name) patch.name = name.trim();
    if (phone.trim() !== guest.phone) patch.phone = phone.trim();
    if (email.trim() !== guest.email) patch.email = email.trim();
    if (instagram.trim() !== guest.instagram) patch.instagram = instagram.trim();
    if (staffTitle.trim() !== guest.staffTitle) patch.staffTitle = staffTitle.trim();
    if (notes.trim() !== guest.notes) patch.notes = notes.trim();
    if (Object.keys(patch).length === 0) {
      onCancel();
      return;
    }
    await onSave(patch);
  }

  return (
    <form
      onSubmit={submit}
      className="mt-2 grid gap-2 rounded-lg border border-shell/10 bg-abyss/50 p-2.5 sm:grid-cols-[1.2fr_1fr_1.3fr_1fr_1.2fr_auto_auto]"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
        className="rounded-full border border-shell/20 bg-abyss/60 px-3 py-1 text-xs text-shell outline-none focus:border-gold"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
        className="rounded-full border border-shell/20 bg-abyss/60 px-3 py-1 text-xs text-shell outline-none focus:border-gold"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Email"
        className="rounded-full border border-shell/20 bg-abyss/60 px-3 py-1 text-xs text-shell outline-none focus:border-gold"
      />
      <input
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        placeholder="@instagram"
        className="rounded-full border border-shell/20 bg-abyss/60 px-3 py-1 text-xs text-shell outline-none focus:border-gold"
      />
      <input
        value={staffTitle}
        onChange={(e) => setStaffTitle(e.target.value)}
        placeholder={guest.isStaff ? "Job title (Bartender…)" : "Job title (staff only)"}
        disabled={!guest.isStaff}
        title={
          guest.isStaff
            ? "Staff job title — Bartender, DJ, Kitchen, etc."
            : "Toggle the Staff pill first to set a title."
        }
        className="rounded-full border border-shell/20 bg-abyss/60 px-3 py-1 text-xs text-shell outline-none placeholder:text-shell/35 focus:border-gold disabled:cursor-not-allowed disabled:opacity-45"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-gold px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-abyss hover:bg-shell disabled:opacity-60"
      >
        {busy ? "…" : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="rounded-full border border-shell/20 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-shell/60 hover:border-gold hover:text-gold disabled:opacity-60"
      >
        Cancel
      </button>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="rounded-lg border border-shell/20 bg-abyss/60 px-3 py-1 text-xs text-shell outline-none placeholder:text-shell/35 focus:border-gold sm:col-span-7"
      />
    </form>
  );
}
