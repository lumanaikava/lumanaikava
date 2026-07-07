import Link from "next/link";
import Ripple from "@/components/Ripple";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <Ripple
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 text-amethyst/20"
        rings={6}
        animated={false}
      />
      <div className="relative mx-auto max-w-3xl px-6 py-40 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold">
          404
        </p>
        <h1 className="h-sign mt-6 text-6xl text-shell sm:text-8xl">
          Empty shell.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-shell/70">
          This page doesn&apos;t exist — but the bar&apos;s still open.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-gold px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-abyss hover:bg-shell"
          >
            Back Home
          </Link>
          <Link
            href="/menu"
            className="rounded-full border border-shell/30 px-8 py-4 font-mono text-xs uppercase tracking-[0.18em] text-shell hover:border-gold hover:text-gold"
          >
            See the Menu
          </Link>
        </div>
      </div>
    </section>
  );
}
