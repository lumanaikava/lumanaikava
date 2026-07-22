"use client";

import { useState, type FormEvent } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function BookingForm({ prefill }: { prefill?: string }) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/booking", {
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
          Request received
        </p>
        <h3 className="mt-3 text-2xl text-shell">
          Thanks — we&apos;ll be in touch within 24 hours.
        </h3>
        <p className="mt-3 text-shell/70">
          If it&apos;s urgent, text (702) 626-0858 and we&apos;ll get right back
          to you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" name="phone" type="tel" />
        <Field label="Event date" name="date" type="date" />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="City"
          name="city"
          placeholder="Las Vegas, Summerlin, Henderson..."
        />
        <Field label="Guest count" name="guests" type="number" min="1" />
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
            Your bartender
          </span>
          <select
            name="bartender"
            defaultValue=""
            className="mt-2 w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-3 text-shell outline-none focus:border-gold"
          >
            <option value="">No preference</option>
            <option value="Ash">Ash</option>
            <option value="Zach">Zach</option>
            <option value="Karina">Karina</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
          Tell us about the event
        </span>
        <textarea
          name="message"
          required
          rows={prefill ? 8 : 5}
          defaultValue={prefill}
          className="mt-2 w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-3 text-shell outline-none placeholder:text-shell/30 focus:border-gold"
          placeholder="Venue, vibe, whether we're the only bar or one of a few..."
        />
      </label>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="btn-brush font-mono text-xs font-bold uppercase tracking-[0.2em] text-shell"
      >
        {state === "submitting" ? "Sending..." : "Request a Quote"}
      </button>

      {state === "error" && (
        <p className="font-mono text-xs text-coconut">
          {errorMsg} — or email us directly at{" "}
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

function Field({
  label,
  name,
  type = "text",
  ...props
}: {
  label: string;
  name: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
        {label}
      </span>
      <input
        type={type}
        name={name}
        {...props}
        className="mt-2 w-full rounded-xl border border-shell/20 bg-abyss/60 px-4 py-3 text-shell outline-none placeholder:text-shell/30 focus:border-gold"
      />
    </label>
  );
}
