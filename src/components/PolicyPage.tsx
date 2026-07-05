export default function PolicyPage({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-jade">
        Policy
      </p>
      <h1 className="mt-4 font-display text-4xl italic">{title}</h1>
      <p className="mt-6 text-ink/70">
        This policy is being migrated over from our previous site. For the
        current, binding version, or any questions in the meantime, reach
        out through our{" "}
        <a href="/contact" className="text-jade underline underline-offset-2">
          contact page
        </a>
        .
      </p>
    </section>
  );
}
