"use client";

import { useState, type FormEvent } from "react";

export default function SmsComposer() {
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "busy" } | { kind: "sent" } | { kind: "error"; msg: string }
  >({ kind: "idle" });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "busy" });
    const res = await fetch("/api/admin/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setStatus({ kind: "sent" });
      form.reset();
      setTimeout(() => setStatus({ kind: "idle" }), 4000);
    } else {
      const body = await res.json().catch(() => ({}));
      setStatus({ kind: "error", msg: body.error ?? "Failed to send." });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        name="to"
        type="tel"
        required
        placeholder="+1 (702) 555-0134"
        className="w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-2.5 text-sm text-shell outline-none placeholder:text-shell/30 focus:border-gold"
      />
      <textarea
        name="message"
        required
        rows={3}
        maxLength={480}
        placeholder="Your order is ready for pickup at the Summerlin market — come say bula! 🥥"
        className="w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-2.5 text-sm text-shell outline-none placeholder:text-shell/30 focus:border-gold"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status.kind === "busy"}
          className="rounded-full bg-gold px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-shell disabled:opacity-60"
        >
          {status.kind === "busy" ? "Sending..." : "Send SMS"}
        </button>
        {status.kind === "sent" && (
          <span className="text-xs font-semibold text-gold">Sent ✓</span>
        )}
        {status.kind === "error" && (
          <span className="text-xs text-coconut">{status.msg}</span>
        )}
      </div>
    </form>
  );
}
