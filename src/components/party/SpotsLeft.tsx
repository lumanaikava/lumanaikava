import type { PartyCapacity } from "@/lib/party-capacity";

/**
 * "N of 50 spots left" with a bar.
 *
 * Scarcity only works if it's true, so this reads live stock and the
 * page renders nothing at all when the number can't be trusted (see
 * partySpotsLeft). A counter that says 31 all week is worse than no
 * counter — people notice, and then they stop believing the sold-out
 * notice too.
 */
export default function SpotsLeft({ data }: { data: PartyCapacity }) {
  const { left, capacity, claimed } = data;
  const pct = Math.min(100, Math.max(0, (claimed / capacity) * 100));
  const nearlyGone = left > 0 && left <= 10;

  return (
    <div className="mx-auto max-w-sm">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-shell/45">
          {left === 0 ? "The room is full" : "Spots remaining"}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/35">
          {claimed} / {capacity} claimed
        </p>
      </div>

      {left > 0 && (
        <p
          className={`h-sign mt-2 text-5xl leading-none ${
            nearlyGone ? "text-coconut" : "text-gold"
          }`}
        >
          {left}
          <span className="ml-2 align-middle font-mono text-xs uppercase tracking-[0.2em] text-shell/40">
            of {capacity} left
          </span>
        </p>
      )}

      {/* The bar fills as spots go, so the shape reads before the number. */}
      <div
        className="mt-3 h-1 w-full overflow-hidden rounded-full bg-shell/12"
        role="img"
        aria-label={`${left} of ${capacity} spots remaining`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-700 ${
            nearlyGone || left === 0 ? "bg-coconut" : "bg-gold"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {nearlyGone && (
        <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-coconut">
          Final spots
        </p>
      )}
    </div>
  );
}
