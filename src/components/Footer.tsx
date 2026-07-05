import Link from "next/link";
import Ripple from "./Ripple";
import { navLinks, footerLinks } from "@/lib/nav";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-bilo text-bone">
      <Ripple
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 text-bone/10"
        rings={4}
        animated={false}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.2em]">
              <Ripple className="h-6 w-6 text-gold" rings={3} animated={false} />
              LUMANAI
            </div>
            <p className="mt-4 max-w-xs font-display text-lg leading-snug text-bone/80">
              The future of alcohol replacement, 3,000 years in the making.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/50">
              Explore
            </h3>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-bone/80 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/50">
              Policies
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-bone/80 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/50">
              Follow
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="https://www.instagram.com/lumanaikava"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-bone/80 transition-colors hover:text-gold"
                >
                  Instagram — @lumanaikava
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-bone/10 pt-6 text-xs text-bone/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Lumanai. All rights reserved.</p>
          <p>1% of every online order supports the South Pacific Islander Organization.</p>
        </div>
      </div>
    </footer>
  );
}
