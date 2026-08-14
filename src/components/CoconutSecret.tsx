"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * The secret door. A quiet little coconut at the bottom of the footer —
 * click it and it rolls you to /invited.
 *
 * It used to need a double-click. On a phone that's a zoom gesture, not
 * a door, so the easter egg was effectively desktop-only. One tap now,
 * with a wobble on the way out so it still feels like a find.
 */
export default function CoconutSecret() {
  const router = useRouter();
  const [wobble, setWobble] = useState(false);

  return (
    <button
      type="button"
      aria-label="A coconut"
      onClick={() => {
        setWobble(true);
        window.setTimeout(() => router.push("/invited"), 260);
      }}
      className={`inline-block cursor-default select-none opacity-40 transition-all duration-300 hover:opacity-80 ${
        wobble ? "rotate-12 scale-110 opacity-90" : ""
      }`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        {/* husk */}
        <circle cx="12" cy="13" r="9" fill="#7a5a38" />
        <circle cx="12" cy="13" r="9" fill="none" stroke="#5b3f24" strokeWidth="1.5" />
        {/* fibrous shading */}
        <path
          d="M5.5 9.5 Q12 6.5 18.5 9.5"
          stroke="#8f6c45"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        {/* the three eyes */}
        <circle cx="9.4" cy="12" r="1.15" fill="#3c2a16" />
        <circle cx="14.6" cy="12" r="1.15" fill="#3c2a16" />
        <circle cx="12" cy="16" r="1.15" fill="#3c2a16" />
      </svg>
    </button>
  );
}
