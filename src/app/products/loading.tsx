export default function ProductsLoading() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="h-3 w-16 animate-pulse rounded bg-shell/20" />
      <div className="mt-6 h-14 w-3/4 animate-pulse rounded bg-shell/15" />
      <div className="mt-6 h-4 w-1/2 animate-pulse rounded bg-shell/10" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-3xl border border-shell/10 bg-lagoon/40"
          >
            <div className="aspect-[4/5] animate-pulse bg-shell/10" />
            <div className="space-y-3 p-7">
              <div className="h-6 w-2/3 animate-pulse rounded bg-shell/15" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-shell/10" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
