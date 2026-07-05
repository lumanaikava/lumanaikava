"use client";

import Link from "next/link";
import { useState } from "react";
import { navLinks } from "@/lib/nav";
import Ripple from "./Ripple";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-shell/10 bg-abyss/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.22em] text-shell"
        >
          <Ripple className="h-6 w-6 text-orchid" rings={3} animated={false} />
          LUMANAI
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-shell/70 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/contact"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-shell/70 transition-colors hover:text-gold"
          >
            Contact
          </Link>
          <Link
            href="/events#book"
            className="rounded-full bg-gold px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-abyss transition-colors hover:bg-shell"
          >
            Book the Bar
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={`h-px w-6 bg-shell transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-6 bg-shell transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-shell/10 px-6 pb-6 pt-2 lg:hidden">
          {[...navLinks, { label: "Contact", href: "/contact" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-shell/10 py-3 font-mono text-xs uppercase tracking-[0.16em] text-shell/80 hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/events#book"
            onClick={() => setOpen(false)}
            className="mt-4 rounded-full bg-gold px-5 py-3 text-center font-mono text-xs font-bold uppercase tracking-[0.16em] text-abyss"
          >
            Book the Bar
          </Link>
        </nav>
      )}
    </header>
  );
}
