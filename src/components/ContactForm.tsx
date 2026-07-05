"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${name || "the website"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:hello@lumanai.com?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50"
        >
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-lg border border-ink/20 bg-white/50 px-4 py-3 text-ink outline-none focus:border-jade"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-lg border border-ink/20 bg-white/50 px-4 py-3 text-ink outline-none focus:border-jade"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50"
        >
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full rounded-lg border border-ink/20 bg-white/50 px-4 py-3 text-ink outline-none focus:border-jade"
        />
      </div>
      <button
        type="submit"
        className="rounded-full bg-ink px-7 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:bg-jade"
      >
        Send Message
      </button>
    </form>
  );
}
