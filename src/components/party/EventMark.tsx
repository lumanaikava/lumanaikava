/**
 * The LUNA EKLIPTIKA mark — a diamond frame holding a crescent laid over
 * a full moon, matching the printed flyer.
 *
 * Inline SVG rather than the PNG in public/images/party/, because this
 * renders at everything from 28px in a footer to 130px in the hero and
 * needs to stay crisp at each. The PNGs exist for Shopify and for
 * anywhere that can only take a raster.
 *
 * Kept in step with scripts/build-party-images.mjs, which draws the same
 * mark for the ticket artwork. If one changes, change both.
 */
export default function EventMark({
  className = "",
  glow = true,
  id = "mark",
}: {
  className?: string;
  glow?: boolean;
  /** Unique per instance — a page may hold more than one mark. */
  id?: string;
}) {
  const S = 200;
  const c = S / 2;
  const size = S * 0.94;
  const half = size / 2;
  const mr = size * 0.2;
  const cr = size * 0.255;
  const mx = c + size * 0.085;
  const bite = size * 0.105;

  // Blurred and clipped to the disc — as hard circles these read as a
  // golf ball rather than lunar maria.
  const mare: [number, number, number, number][] = [
    [-0.36, -0.28, 0.34, 0.5],
    [0.14, -0.42, 0.22, 0.42],
    [0.38, 0.12, 0.3, 0.46],
    [-0.14, 0.36, 0.36, 0.38],
    [-0.5, 0.1, 0.16, 0.34],
    [0.02, -0.06, 0.26, 0.3],
  ];

  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      className={className}
      role="img"
      aria-label="Luna Ekliptika"
    >
      <defs>
        <radialGradient id={`face-${id}`} cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#e6e4de" />
          <stop offset="100%" stopColor="#bfbdb6" />
        </radialGradient>
        <radialGradient id={`halo-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4af6a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d4af6a" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`disc-${id}`}>
          <circle cx={mx} cy={c} r={mr} />
        </clipPath>
        <filter id={`soft-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={mr * 0.11} />
        </filter>
        <mask id={`crescent-${id}`}>
          <rect x="0" y="0" width={S} height={S} fill="black" />
          <circle cx={c - size * 0.075} cy={c} r={cr} fill="white" />
          <circle cx={c - size * 0.075 + bite} cy={c} r={cr * 0.84} fill="black" />
        </mask>
      </defs>

      {glow && <circle cx={c} cy={c} r={S * 0.5} fill={`url(#halo-${id})`} />}

      <rect
        x={c - half * 0.72}
        y={c - half * 0.72}
        width={half * 1.44}
        height={half * 1.44}
        transform={`rotate(45 ${c} ${c})`}
        fill="none"
        stroke="currentColor"
        strokeWidth={size * 0.011}
      />
      <circle cx={mx} cy={c} r={mr} fill={`url(#face-${id})`} />
      <g clipPath={`url(#disc-${id})`} filter={`url(#soft-${id})`} opacity="0.55">
        {mare.map(([dx, dy, rr, o], i) => (
          <circle
            key={i}
            cx={mx + dx * mr}
            cy={c + dy * mr}
            r={rr * mr}
            fill="#8c8e97"
            opacity={o}
          />
        ))}
      </g>
      <circle
        cx={c - size * 0.075}
        cy={c}
        r={cr}
        fill="currentColor"
        mask={`url(#crescent-${id})`}
      />
    </svg>
  );
}
