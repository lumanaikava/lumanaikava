"use client";

import { useState, type FormEvent } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong.");
      }
      setState("success");
      form.reset();
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-3xl border border-gold/40 bg-lagoon/40 p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
          Message received
        </p>
        <h3 className="mt-3 text-2xl text-shell">
          Thanks — we&apos;ll write back soon.
        </h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
          Name
        </span>
        <input
          name="name"
          required
          className="mt-2 w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-3 text-shell outline-none focus:border-gold"
        />
      </label>
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-3 text-shell outline-none focus:border-gold"
        />
      </label>
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={5}
          className="mt-2 w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-3 text-shell outline-none focus:border-gold"
        />
      </label>
      <button
        type="submit"
        disabled={state === "submitting"}
        className="rounded-full bg-gold px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell disabled:opacity-60"
      >
        {state === "submitting" ? "Sending..." : "Send Message"}
      </button>

      {state === "error" && (
        <p className="font-mono text-xs text-coconut">
          {errorMsg} — or email us at{" "}
          <a
            href="mailto:lumanai.events@gmail.com"
            className="underline underline-offset-2"
          >
            lumanai.events@gmail.com
          </a>
          .
        </p>
      )}
    </form>
  );
}
