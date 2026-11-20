"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
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
          message: "[Newsletter] Subscribe (source: popup, KAVA15 shown)",
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

  // White fields with an icon inset, on the root pattern — the look of
  // the original Shopify popup, rebuilt here.
  const field =
    "w-full rounded-md border border-black/10 bg-white py-3 pl-11 pr-4 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-gold";
  const icon =
    "pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500";

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
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto bg-black bg-cover bg-center px-6 pb-8 pt-10 shadow-2xl sm:px-12 sm:pb-12 sm:pt-12"
        style={{ backgroundImage: "url(/images/root-pattern.jpg)" }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md hover:bg-neutral-200"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lumanai-wordmark.svg"
          alt="LUMANAI"
          className="mx-auto h-auto w-56 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:w-64"
        />

        {state === "done" ? (
          <div className="mt-8 text-center">
            <p
              id="signup-popup-title"
              className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
            >
              You&apos;re in.
            </p>
            <p className="mt-3 text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              Here&apos;s 15% off your first order:
            </p>
            <p className="mx-auto mt-4 w-fit select-all rounded-md bg-white px-6 py-3 font-mono text-2xl font-bold tracking-[0.15em] text-neutral-900">
              KAVA15
            </p>
            <p className="mt-2 text-xs text-white/70 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              Enter it at checkout.
            </p>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="mt-6 block w-full rounded-md bg-black py-3.5 text-center font-bold text-white hover:bg-neutral-800"
            >
              Shop now
            </Link>
          </div>
        ) : (
          <>
            <h2
              id="signup-popup-title"
              className="mt-6 text-center text-3xl font-bold leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] sm:text-[2.6rem]"
            >
              Get 15% OFF your first order
            </h2>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <div className="relative">
                <svg viewBox="0 0 24 24" className={icon} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" strokeLinecap="round" />
                </svg>
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Your Name"
                  aria-label="Your name"
                  className={field}
                />
              </div>
              <div className="relative">
                <span className={`${icon} flex w-auto items-center text-sm`} aria-hidden>
                  🇺🇸
                </span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (702) 555-0123"
                  aria-label="Mobile number"
                  aria-invalid={phoneError}
                  className={field}
                />
              </div>
              <div className="relative">
                <svg viewBox="0 0 24 24" className={icon} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3.5 6.5l8.5 6.5 8.5-6.5" strokeLinejoin="round" />
                </svg>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="youremail@email.com"
                  aria-label="Email address"
                  className={field}
                />
              </div>
              <div className="[&>label]:border-0 [&>label]:bg-black/75 [&_span]:text-white/85">
                <SmsConsent
                  checked={smsConsent}
                  onChange={setSmsConsent}
                  note="Consent is not a condition of purchase."
                />
              </div>
              {phoneError && (
                <p className="rounded bg-black/75 px-3 py-2 text-xs text-red-300">
                  Add your mobile number to get texts, or uncheck the box.
                </p>
              )}
              <button
                type="submit"
                disabled={state === "sending"}
                className="!mt-5 w-full rounded-md bg-black py-3.5 text-lg font-bold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
              >
                {state === "sending" ? "Sending..." : "Submit"}
              </button>
              {state === "error" && (
                <p className="rounded bg-black/75 px-3 py-2 text-center text-xs text-red-300">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
