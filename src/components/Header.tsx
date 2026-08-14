"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { navLinks } from "@/lib/nav";
import CartButton from "@/components/CartButton";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-shell/10 bg-abyss/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo and the booking CTA travel together — Book is the one
            action worth putting beside the brand, not stranded at the
            far edge where it reads as an afterthought. */}
        <div className="flex items-center gap-4">
          <Link href="/" onClick={() => setOpen(false)} aria-label="Lumanai home">
            <Image
              src="/lumanai-wordmark.svg"
              alt="LUMANAI"
              width={132}
              height={53}
              priority
              className="h-auto w-[120px] sm:w-[132px]"
            />
          </Link>
          {/* Book rides beside the wordmark on every size. On a phone it
              shortens rather than disappearing — booking is the whole
              business, and it shouldn't be hidden behind a hamburger. */}
          <Link
            href="/events"
            onClick={() => setOpen(false)}
            className="rounded-full bg-gold px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-abyss transition-colors hover:bg-shell sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.2em]"
          >
            Book<span className="hidden sm:inline"> the Bar</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/70 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/contact"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/70 transition-colors hover:text-gold"
          >
            Contact
          </Link>
          <CartButton />
        </div>

        {/* The cart sits outside the mobile menu — it has to be one tap
            away, not behind the hamburger. */}
        <div className="flex items-center gap-1 lg:hidden">
          <CartButton />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
          >
            <span
              className={`h-px w-6 bg-shell transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-shell transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-shell/10 px-6 pb-6 pt-2 lg:hidden">
          {[...navLinks, { label: "Contact", href: "/contact" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-shell/10 py-3 font-mono text-xs uppercase tracking-[0.2em] text-shell/80 hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/events#book"
            onClick={() => setOpen(false)}
            className="mt-4 rounded-full bg-gold px-5 py-3 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-abyss"
          >
            Book the Bar
          </Link>
        </nav>
      )}
    </header>
  );
}
