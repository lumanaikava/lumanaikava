type RippleProps = {
  className?: string;
  rings?: number;
  color?: string;
  animated?: boolean;
};

/**
 * The concentric rings left in a bowl of kava when it's strained and mixed.
 * Used as the brand's signature mark: hero backdrop, section divider, button hover state.
 */
export default function Ripple({
  className = "",
  rings = 5,
  color = "currentColor",
  animated = true,
}: RippleProps) {
  const items = Array.from({ length: rings });
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke={color}>
        {items.map((_, i) => {
          const r = 30 + i * (170 / rings);
          return (
            <circle
              key={i}
              cx="200"
              cy="200"
              r={r}
              strokeWidth={i === 0 ? 2 : 1}
              opacity={1 - i * (0.85 / rings)}
              className={animated ? "ripple-enter" : undefined}
              style={animated ? { animationDelay: `${i * 90}ms` } : undefined}
            />
          );
        })}
      </g>
    </svg>
  );
}
