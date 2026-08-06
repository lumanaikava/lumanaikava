"use client";

import { useEffect, useState } from "react";

/**
 * Ticks down to doors. Renders nothing until after mount — the server has
 * no idea what "now" is on the guest's machine, and rendering a guess
 * would flash the wrong numbers before hydration corrects them.
 */
export default function Countdown({ target }: { target: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  // Reserve the vertical space so the hero doesn't jump when it appears.
  if (left === null) return <div className="h-[76px]" aria-hidden />;

  if (left === 0) {
    return (
      <p className="h-sign text-3xl text-gold">Tonight. You know where.</p>
    );
  }

  const sec = Math.floor(left / 1000);
  const parts = [
    { label: "Days", value: Math.floor(sec / 86400) },
    { label: "Hrs", value: Math.floor(sec / 3600) % 24 },
    { label: "Min", value: Math.floor(sec / 60) % 60 },
    { label: "Sec", value: sec % 60 },
  ];

  return (
    <div className="flex items-start justify-center gap-5 sm:gap-8">
      {parts.map((p) => (
        <div key={p.label} className="w-14 text-center sm:w-16">
          <div className="h-sign text-4xl tabular-nums text-shell sm:text-5xl">
            {String(p.value).padStart(2, "0")}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-shell/45">
            {p.label}
          </div>
        </div>
      ))}
    </div>
  );
}
