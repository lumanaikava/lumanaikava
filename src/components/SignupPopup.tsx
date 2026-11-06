"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import SmsConsent from "@/components/SmsConsent";

/**
 * Email + SMS signup popup → GoHighLevel (via /api/contact).
 *
 * Why the ?join link exists: carriers reviewing an A2P 10DLC campaign
 * must be able to SEE the opt-in. An earlier filing failed (error 30896)
 * because reviewers couldn't make a timed popup appear. Any URL with
 * ?join (e.g. https://lumanaikava.com/?join) opens this popup instantly,
 * every time, regardless of whether it was dismissed before. Give that
 * link to reviewers as the opt-in URL.
 *
 * Normal visitors: opens once after a short delay, never again after
 * they close it or sign up (remembered in localStorage).
 */

const STORAGE_KEY = "lumanai-signup-popup";
const DELAY_MS = 8000;

export default function SignupPopup() {
  const [open, setOpen] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;

    const params = new URLSearchParams(window.location.search);
    if (params.has("join")) {
      setOpen(true);
      return;
    }

    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      // Storage blocked (private mode etc.) — just show it once this visit.
    }
    if (seen) return;

    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function remember(value: string) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
  }

  function close() {
    setOpen(false);
    remember("dismissed");
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const phone = String(f.get("phone") ?? "").trim();

    // A ticked box needs a real number to mean anything.
    if (smsConsent && phone.replace(/\D/g, "").length < 10) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);
    setState("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Popup signup",
          email,
          phone: phone || undefined,
          smsConsent: smsConsent ? "yes" : "",
          message: "[Newsletter] Subscribe (source: popup)",
        }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      remember("subscribed");
    } catch {
      setState("error");
    }
  }

  if (!open) return null;

  const field =
    "w-full rounded-lg border border-shell/20 bg-abyss/70 px-4 py-3 text-sm text-shell outline-none placeholder:text-shell/40 focus:border-gold";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-abyss/80 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-popup-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gold/30 bg-ocean p-6 shadow-2xl sm:p-8"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-xl text-shell/60 hover:bg-shell/10 hover:text-shell"
        >
          ×
        </button>

        {state === "done" ? (
          <div className="py-6 text-center">
            <p className="h-sign text-3xl text-gold">You&apos;re in.</p>
            <p className="mt-3 text-sm text-shell/75">
              Welcome to the Lumanai list. Bula. 🥥
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-full bg-gold px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-abyss hover:bg-shell"
            >
              Keep browsing
            </button>
          </div>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
              Lumanai Kava
            </p>
            <h2
              id="signup-popup-title"
              className="h-sign mt-2 text-3xl text-shell sm:text-4xl"
            >
              Join the list
            </h2>
            <p className="mt-2 text-sm text-shell/70">
              First word on new drinks, pop-ups, and events.
            </p>

            <form onSubmit={submit} className="mt-5 space-y-3">
              <input
                name="name"
                autoComplete="name"
                placeholder="Your name"
                aria-label="Your name"
                className={field}
              />
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Mobile number"
                aria-label="Mobile number"
                aria-invalid={phoneError}
                className={field}
              />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="your@email.com"
                aria-label="Email address"
                className={field}
              />
              <SmsConsent
                checked={smsConsent}
                onChange={setSmsConsent}
                note="Optional — consent is not a condition of purchase."
              />
              {phoneError && (
                <p className="text-xs text-red-300">
                  Add your mobile number to get texts, or uncheck the box.
                </p>
              )}
              <button
                type="submit"
                disabled={state === "sending"}
                className="w-full rounded-full bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-shell disabled:opacity-60"
              >
                {state === "sending" ? "Sending..." : "Sign me up"}
              </button>
              {state === "error" && (
                <p className="text-center text-xs text-red-300">
                  Something went wrong. Please try again.
                </p>
              )}
              <p className="text-center text-[11px] text-shell/45">
                <a
                  href="/policies/privacy-policy"
                  className="underline underline-offset-2 hover:text-gold"
                >
                  Privacy Policy
                </a>{" "}
                ·{" "}
                <a
                  href="/policies/terms-of-service"
                  className="underline underline-offset-2 hover:text-gold"
                >
                  Terms
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
