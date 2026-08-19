"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The door scanner.
 *
 * Uses the browser's built-in BarcodeDetector where it exists (Chrome
 * on Android, which is what a door phone usually is). Where it doesn't
 * — notably iOS Safari — there's a paste box, because the fallback has
 * to be something a human can actually do at 8PM in a driveway rather
 * than an apology.
 *
 * Seen tickets are remembered in this device's session so a forwarded
 * screenshot gets flagged the second time it's presented. That's local,
 * not authoritative: two phones on the door won't know about each
 * other. Good enough for fifty people, and honest about its limits.
 */

type Ticket = { order: string; name: string; tier: string; seats: number };
type Result =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok"; ticket: Ticket; repeat: boolean }
  | { state: "bad"; reason: string };

const TIER_COLOR: Record<string, string> = {
  Obsidian: "#8f96a8",
  Meridian: "#d4af6a",
  Perihelion: "#f0e6d2",
  Aphelion: "#9ec5ea",
};

export default function DoorScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const seen = useRef<Set<string>>(new Set());
  const [result, setResult] = useState<Result>({ state: "idle" });
  const [scanning, setScanning] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [manual, setManual] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    setSupported("BarcodeDetector" in window);
  }, []);

  const check = useCallback(async (token: string) => {
    if (!token) return;
    setResult({ state: "checking" });
    try {
      const res = await fetch("/api/ticket/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await res.json();
      if (!res.ok) {
        setResult({ state: "bad", reason: body.error ?? "Not authorised." });
        return;
      }
      if (!body.ok) {
        setResult({
          state: "bad",
          reason:
            body.reason === "invalid"
              ? "Not a valid ticket"
              : "Nothing scanned",
        });
        return;
      }
      const repeat = seen.current.has(body.ticket.order);
      if (!repeat) {
        seen.current.add(body.ticket.order);
        setCount(seen.current.size);
      }
      setResult({ state: "ok", ticket: body.ticket, repeat });
      // A short buzz so the doorman doesn't have to read the screen.
      navigator.vibrate?.(repeat ? [40, 60, 40] : 30);
    } catch {
      setResult({ state: "bad", reason: "Couldn't reach the server" });
    }
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setScanning(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Detector = (window as any).BarcodeDetector;
      const detector = new Detector({ formats: ["qr_code"] });
      let last = "";

      const tick = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          requestAnimationFrame(tick);
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          const value = codes?.[0]?.rawValue;
          // Same code in frame for many frames — only act once.
          if (value && value !== last) {
            last = value;
            await check(value);
            window.setTimeout(() => (last = ""), 2500);
          }
        } catch {
          /* a dropped frame is not an error worth surfacing */
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } catch {
      setResult({
        state: "bad",
        reason: "Camera blocked — allow access, or paste the code below.",
      });
    }
  }

  const tone =
    result.state === "ok"
      ? result.repeat
        ? "border-coconut/60 bg-coconut/10"
        : "border-emerald-400/50 bg-emerald-400/10"
      : result.state === "bad"
        ? "border-red-400/50 bg-red-400/10"
        : "border-shell/15 bg-abyss/40";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
          Checked in
        </p>
        <p className="h-sign text-3xl text-gold">{count}</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-shell/15 bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`aspect-[4/3] w-full object-cover ${scanning ? "" : "opacity-30"}`}
        />
        {!scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            {supported === false ? (
              <p className="px-6 text-center text-xs leading-relaxed text-shell/60">
                This browser can&rsquo;t scan. Use Chrome on Android, or
                paste the code below.
              </p>
            ) : (
              <button
                onClick={startCamera}
                className="rounded-full bg-gold px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss"
              >
                Start camera
              </button>
            )}
          </div>
        )}
      </div>

      {/* The result, big enough to read at arm's length in the dark. */}
      <div className={`rounded-2xl border p-5 transition-colors ${tone}`}>
        {result.state === "idle" && (
          <p className="text-sm text-shell/45">Point the camera at a ticket.</p>
        )}
        {result.state === "checking" && (
          <p className="text-sm text-shell/60">Checking…</p>
        )}
        {result.state === "bad" && (
          <>
            <p className="h-sign text-3xl text-red-300">Refuse</p>
            <p className="mt-1 text-sm text-shell/70">{result.reason}</p>
          </>
        )}
        {result.state === "ok" && (
          <>
            <p
              className="h-sign text-3xl"
              style={{ color: result.repeat ? "#e8d5a6" : "#6ee7a8" }}
            >
              {result.repeat ? "Already scanned" : "Let them in"}
            </p>
            <p className="h-sign mt-2 text-2xl text-shell">
              {result.ticket.name}
            </p>
            <p
              className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.24em]"
              style={{ color: TIER_COLOR[result.ticket.tier] ?? "#d4af6a" }}
            >
              {result.ticket.tier}
              {result.ticket.seats > 1 && ` · admits ${result.ticket.seats}`}
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-shell/35">
              {result.ticket.order}
            </p>
            {result.repeat && (
              <p className="mt-3 text-xs leading-relaxed text-coconut">
                This ticket already came through this phone. Could be a
                forwarded screenshot — check the name against the list.
              </p>
            )}
          </>
        )}
      </div>

      {/* Always available, not just as a fallback — sometimes a camera
          simply won't focus and the queue is still waiting. */}
      <div>
        <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/45">
          Or paste a ticket code
        </label>
        <div className="mt-2 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="eyJ…"
            className="min-w-0 flex-1 rounded-xl border border-shell/20 bg-abyss/60 px-3 py-2.5 font-mono text-xs text-shell outline-none focus:border-gold"
          />
          <button
            onClick={() => check(manual)}
            className="shrink-0 rounded-xl border border-shell/25 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-shell/80 hover:border-gold hover:text-gold"
          >
            Check
          </button>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-shell/30">
        Repeat detection is per phone. If two people are working the door,
        each device tracks its own — compare against the guest list before
        turning anyone away.
      </p>
    </div>
  );
}
