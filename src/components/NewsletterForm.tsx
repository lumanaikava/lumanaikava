"use client";

import { useState, type FormEvent } from "react";

/**
 * Email capture → GoHighLevel (rides the /api/contact pipe; GHL branches
 * on the "[Newsletter]" marker to tag + nurture the contact).
 */
export default function NewsletterForm({ source = "footer" }: { source?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter signup",
          email,
          message: `[Newsletter] Subscribe (source: ${source})`,
        }),
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="text-sm font-semibold text-gold">
        You&apos;re on the list. Bula. 🥥
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm gap-2">
      <label className="sr-only" htmlFor={`nl-${source}`}>
        Email address
      </label>
      <input
        id={`nl-${source}`}
        name="email"
        type="email"
        required
        placeholder="your@email.com"
        className="w-full rounded-full border border-shell/25 bg-abyss/60 px-5 py-2.5 text-sm text-shell outline-none placeholder:text-shell/35 focus:border-gold"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="shrink-0 rounded-full bg-gold px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-shell disabled:opacity-60"
      >
        {state === "sending" ? "..." : "Join"}
      </button>
      {state === "error" && (
        <span className="sr-only">Something went wrong — try again.</span>
      )}
    </form>
  );
}
