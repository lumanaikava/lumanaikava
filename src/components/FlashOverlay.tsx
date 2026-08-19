"use client";

import { useEffect, useState } from "react";

/**
 * The golden light-burst that fires when you click a drink on the home
 * page.
 *
 * It lives in the ROOT LAYOUT, not in the hero, and that placement is
 * the entire trick. The original version rendered inside Archipelago
 * and had to delay navigation by 480ms so you could see it — which is
 * exactly the lag Zach felt. Rendered in the layout, this component
 * survives the route change, so the click can navigate instantly while
 * the flash keeps playing over the incoming page.
 *
 * Fires on a window event so the hero doesn't need a provider or a
 * context to reach it — one line at the call site, no plumbing.
 */

export const FLASH_EVENT = "lumanai:flash";

export type FlashDetail = { x: number; y: number };

/** Fire the burst from anywhere. No-op under prefers-reduced-motion. */
export function flashFrom(x: number, y: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.dispatchEvent(
    new CustomEvent<FlashDetail>(FLASH_EVENT, { detail: { x, y } }),
  );
}

export default function FlashOverlay() {
  const [burst, setBurst] = useState<(FlashDetail & { id: number }) | null>(
    null,
  );

  useEffect(() => {
    function onFlash(e: Event) {
      const { x, y } = (e as CustomEvent<FlashDetail>).detail;
      // A new id restarts the CSS animation even if one is mid-flight.
      setBurst({ x, y, id: Date.now() });
    }
    window.addEventListener(FLASH_EVENT, onFlash);
    return () => window.removeEventListener(FLASH_EVENT, onFlash);
  }, []);

  if (!burst) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
      <span
        key={burst.id}
        // Cleans itself up so a stale overlay can never sit on top of
        // the page swallowing nothing but still costing a paint.
        onAnimationEnd={() => setBurst(null)}
        className="transport-ring absolute block h-[120vmax] w-[120vmax] rounded-full"
        style={{
          left: burst.x,
          top: burst.y,
          marginLeft: "-60vmax",
          marginTop: "-60vmax",
          background:
            "radial-gradient(circle, rgba(237,226,180,0.9) 0%, rgba(107,58,156,0.85) 35%, rgba(5,16,42,0) 70%)",
        }}
      />
    </div>
  );
}
