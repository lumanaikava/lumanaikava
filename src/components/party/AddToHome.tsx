"use client";

import { useEffect, useState } from "react";

/**
 * A nudge to save the ticket to the home screen.
 *
 * Shown only on iOS Safari, and only when the page isn't already
 * running standalone — the two conditions under which the advice is
 * both possible and not yet taken. Android gets a real install prompt
 * from the browser, so it doesn't need us.
 *
 * Rendered after mount because it depends on the user agent, and
 * server-rendering it would flash the wrong thing for everyone else.
 */
export default function AddToHome() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS reports this on navigator, not matchMedia.
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setShow(iOS && !standalone);
  }, []);

  if (!show) return null;

  return (
    <p className="relative mt-5 max-w-xs text-center text-[11px] leading-relaxed text-shell/45">
      Tap{" "}
      <span aria-hidden className="mx-0.5 inline-block align-[-2px]">
        <svg width="11" height="13" viewBox="0 0 12 14" fill="none" aria-hidden>
          <path
            d="M6 1v8M6 1 3.2 3.8M6 1l2.8 2.8"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.5 6.5v5.2c0 .4.3.8.8.8h7.4c.5 0 .8-.4.8-.8V6.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      </span>{" "}
      then <span className="text-shell/70">Add to Home Screen</span> to keep
      this ticket one tap away.
    </p>
  );
}
