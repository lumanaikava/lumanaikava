"use client";

import { useEffect, useState } from "react";

const MODEL_URL = "/models/lumanai-bottle.glb";
const VIEWER_SRC =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
      interface IntrinsicElements {
        "model-viewer": React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            src?: string;
            alt?: string;
            "auto-rotate"?: boolean;
            "camera-controls"?: boolean;
            "shadow-intensity"?: string;
            exposure?: string;
            "rotation-per-second"?: string;
          },
          HTMLElement
        >;
      }
    }
  }
}

/**
 * Interactive 3D product viewer — dormant until a GLB lands at
 * public/models/lumanai-bottle.glb (see the README in that folder).
 * When the file exists this renders over its parent, replacing the
 * static product photo with an auto-rotating model.
 */
export default function ProductModel3D({ alt }: { alt: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(MODEL_URL, { method: "HEAD" })
      .then((res) => {
        if (cancelled || !res.ok) return;
        // Model exists — load the viewer runtime once, then render.
        if (!document.querySelector(`script[src="${VIEWER_SRC}"]`)) {
          const s = document.createElement("script");
          s.type = "module";
          s.src = VIEWER_SRC;
          document.head.appendChild(s);
        }
        setReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  return (
    <div className="absolute inset-0 z-10 bg-shell">
      <model-viewer
        src={MODEL_URL}
        alt={alt}
        auto-rotate
        camera-controls
        shadow-intensity="0.8"
        exposure="1.05"
        rotation-per-second="24deg"
        style={{ width: "100%", height: "100%" }}
      />
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-abyss/70 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-shell/80">
        Drag to spin
      </p>
    </div>
  );
}
