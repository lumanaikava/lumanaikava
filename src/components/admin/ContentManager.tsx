"use client";

import { useState, type FormEvent } from "react";
import { EVENT_KINDS, type SiteEvent, type SiteFaq } from "@/lib/site-content";

/**
 * Edit the calendar and the FAQ without a deploy.
 *
 * Every change is a full round trip that returns the new list, so what
 * you see is what the sheet actually holds — no optimistic state that
 * could drift from the truth after a failed write.
 */

const KIND_LABEL: Record<string, string> = {
  market: "Market",
  event: "Event",
  bar: "Private bar",
};
const KIND_COLOR: Record<string, string> = {
  market: "#c9a7ee",
  event: "#9ec5ea",
  bar: "#e8d5a6",
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ContentManager({
  initialEvents,
  initialFaq,
  ready,
}: {
  initialEvents: SiteEvent[];
  initialFaq: SiteFaq[];
  ready: boolean;
}) {
  const [tab, setTab] = useState<"events" | "faq">("events");
  const [events, setEvents] = useState(initialEvents);
  const [faq, setFaq] = useState(initialFaq);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  async function send(
    kind: "events" | "faq",
    op: "add" | "update" | "delete",
    item: Record<string, unknown>,
  ) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, op, item }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't save.");
      if (body.events) setEvents(body.events);
      if (body.faq) setFaq(body.faq);
      setEditing(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {(["events", "faq"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setEditing(null);
            }}
            className={`rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
              tab === t
                ? "bg-gold text-abyss"
                : "border border-shell/20 text-shell/70 hover:border-gold hover:text-gold"
            }`}
          >
            {t === "events" ? `Appearances ${events.length}` : `FAQ ${faq.length}`}
          </button>
        ))}
      </div>

      {!ready && (
        <p className="rounded-2xl border border-coconut/40 bg-coconut/10 px-4 py-3 text-sm text-coconut">
          <b>Read-only.</b> The Site Content sheet isn&apos;t connected, so
          edits can&apos;t save yet. See <b>Site Content Setup.md</b> in the
          Lumanai Business folder.
        </p>
      )}
      {error && (
        <p className="rounded-2xl border border-coconut/40 bg-coconut/10 px-4 py-3 text-sm text-coconut">
          {error}
        </p>
      )}

      {tab === "events" ? (
        <>
          <EventForm
            key={editing ?? "new"}
            disabled={!ready || busy}
            existing={sortedEvents.find((e) => e.id === editing)}
            onCancel={() => setEditing(null)}
            onSubmit={(item) =>
              send("events", editing ? "update" : "add", item)
            }
          />

          <ul className="divide-y divide-shell/10 rounded-3xl border border-shell/10 bg-lagoon/20">
            {sortedEvents.length === 0 && (
              <li className="px-5 py-6 text-sm text-shell/55">
                Nothing added yet. Anything you add here shows on Find Us and
                the home page ticker alongside the weekly markets.
              </li>
            )}
            {sortedEvents.map((e) => {
              const past = e.date < todayISO();
              return (
                <li
                  key={e.id}
                  className={`grid gap-2 px-5 py-3.5 sm:grid-cols-[110px_1fr_auto] sm:items-center sm:gap-4 ${
                    past || e.hidden ? "opacity-45" : ""
                  }`}
                >
                  <span
                    className="font-mono text-xs font-bold uppercase tracking-wide"
                    style={{ color: KIND_COLOR[e.kind] }}
                  >
                    {e.date}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-shell">
                      {e.title}
                      {e.hidden && (
                        <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.15em] text-shell/40">
                          hidden
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-shell/50">
                      {[KIND_LABEL[e.kind], e.time, e.location]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditing(e.id)}
                      disabled={!ready || busy}
                      className="text-[10px] font-bold uppercase tracking-[0.16em] text-shell/60 hover:text-gold disabled:opacity-40"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${e.title}"?`))
                          send("events", "delete", { id: e.id });
                      }}
                      disabled={!ready || busy}
                      className="text-[10px] font-bold uppercase tracking-[0.16em] text-shell/35 hover:text-coconut disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <>
          <FaqForm
            key={editing ?? "new-faq"}
            disabled={!ready || busy}
            existing={faq.find((f) => f.id === editing)}
            onCancel={() => setEditing(null)}
            onSubmit={(item) => send("faq", editing ? "update" : "add", item)}
          />

          <ul className="divide-y divide-shell/10 rounded-3xl border border-shell/10 bg-lagoon/20">
            {faq.length === 0 && (
              <li className="px-5 py-6 text-sm text-shell/55">
                Nothing added yet. The FAQ page shows the built-in questions
                until you add your own here.
              </li>
            )}
            {faq.map((f) => (
              <li
                key={f.id}
                className={`flex items-center gap-4 px-5 py-3.5 ${f.hidden ? "opacity-45" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-shell">
                    {f.q}
                  </p>
                  <p className="truncate text-xs text-shell/50">
                    {f.a[0] ?? "(no answer yet)"}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(f.id)}
                  disabled={!ready || busy}
                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-shell/60 hover:text-gold disabled:opacity-40"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${f.q}"?`))
                      send("faq", "delete", { id: f.id });
                  }}
                  disabled={!ready || busy}
                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-shell/35 hover:text-coconut disabled:opacity-40"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* ── Forms ─────────────────────────────────────────────────── */

const input =
  "mt-1.5 w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-2.5 text-sm text-shell outline-none placeholder:text-shell/30 focus:border-gold";
const label =
  "font-mono text-[10px] uppercase tracking-[0.2em] text-shell/45";

function EventForm({
  existing,
  disabled,
  onSubmit,
  onCancel,
}: {
  existing?: SiteEvent;
  disabled: boolean;
  onSubmit: (item: Record<string, unknown>) => Promise<boolean>;
  onCancel: () => void;
}) {
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ok = await onSubmit({
      id: existing?.id,
      date: f.get("date"),
      title: f.get("title"),
      time: f.get("time"),
      location: f.get("location"),
      kind: f.get("kind"),
      hidden: f.get("hidden") === "on",
      note: f.get("note"),
    });
    if (ok && !existing) e.currentTarget.reset();
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-shell/10 bg-lagoon/30 p-5"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
        {existing ? "Edit appearance" : "Add an appearance"}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <label className="block">
          <span className={label}>Date</span>
          <input
            name="date"
            type="date"
            required
            defaultValue={existing?.date}
            className={input}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={label}>What is it</span>
          <input
            name="title"
            required
            placeholder="Downtown Summerlin Farmers Market"
            defaultValue={existing?.title}
            className={input}
          />
        </label>
        <label className="block">
          <span className={label}>Type</span>
          <select name="kind" defaultValue={existing?.kind ?? "event"} className={input}>
            {EVENT_KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>Time</span>
          <input
            name="time"
            placeholder="9am–2pm"
            defaultValue={existing?.time}
            className={input}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={label}>Where</span>
          <input
            name="location"
            placeholder="Las Vegas, NV"
            defaultValue={existing?.location}
            className={input}
          />
        </label>
        <label className="block">
          <span className={label}>Note (optional)</span>
          <input name="note" defaultValue={existing?.note} className={input} />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-shell/70">
          <input
            type="checkbox"
            name="hidden"
            defaultChecked={existing?.hidden}
            className="h-4 w-4 accent-gold"
          />
          Hide from the public site
        </label>
        <button
          type="submit"
          disabled={disabled}
          className="ml-auto rounded-full bg-gold px-6 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell disabled:opacity-50"
        >
          {existing ? "Save changes" : "Add"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-shell/50 hover:text-shell"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function FaqForm({
  existing,
  disabled,
  onSubmit,
  onCancel,
}: {
  existing?: SiteFaq;
  disabled: boolean;
  onSubmit: (item: Record<string, unknown>) => Promise<boolean>;
  onCancel: () => void;
}) {
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ok = await onSubmit({
      id: existing?.id,
      q: f.get("q"),
      a: f.get("a"),
      hidden: f.get("hidden") === "on",
    });
    if (ok && !existing) e.currentTarget.reset();
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-shell/10 bg-lagoon/30 p-5"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
        {existing ? "Edit question" : "Add a question"}
      </p>
      <label className="mt-3 block">
        <span className={label}>Question</span>
        <input name="q" required defaultValue={existing?.q} className={input} />
      </label>
      <label className="mt-3 block">
        <span className={label}>Answer — blank line starts a new paragraph</span>
        <textarea
          name="a"
          rows={5}
          required
          defaultValue={existing?.a.join("\n\n")}
          className={`${input} resize-y`}
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-shell/70">
          <input
            type="checkbox"
            name="hidden"
            defaultChecked={existing?.hidden}
            className="h-4 w-4 accent-gold"
          />
          Hide from the public site
        </label>
        <button
          type="submit"
          disabled={disabled}
          className="ml-auto rounded-full bg-gold px-6 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell disabled:opacity-50"
        >
          {existing ? "Save changes" : "Add"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-shell/50 hover:text-shell"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
