export default function PolicyPage({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
        Policy
      </p>
      <h1 className="mt-4 font-display text-5xl italic text-shell">{title}</h1>
      <p className="mt-6 text-shell/70">
        This policy is being migrated from our previous site. For the
        current, binding version — or any questions in the meantime — reach
        us at{" "}
        <a
          href="mailto:lumanai.events@gmail.com"
          className="prose-link text-shell hover:text-gold"
        >
          lumanai.events@gmail.com
        </a>
        .
      </p>
    </section>
  );
}
