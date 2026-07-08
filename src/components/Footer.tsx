import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import Ripple from "./Ripple";
import { navLinks, footerLinks } from "@/lib/nav";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-shell/10 bg-abyss text-shell">
      <Ripple
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 text-shell/10"
        rings={4}
        animated={false}
      />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-amethyst/20 blur-3xl" />

      {/* Waitlist / list capture */}
      <div
        id="waitlist"
        className="relative border-b border-shell/10 bg-lagoon/30"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>
            <p className="h-sign-med text-2xl text-shell">
              The Lounge is coming to Las Vegas.
            </p>
            <p className="mt-1 text-sm text-shell/60">
              First pours, first invites, secret menu drops — get on the list.
            </p>
          </div>
          <NewsletterForm source="footer-waitlist" />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/lumanai-wordmark.svg"
              alt="LUMANAI"
              width={150}
              height={61}
              className="h-auto w-[150px]"
            />
            <p className="mt-4 max-w-xs text-lg leading-snug text-shell/80">
              Drink Different. All the buzz — none of the booze.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-shell/40">
              Booking · Las Vegas, NV
            </p>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
              Explore
            </h3>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-shell/80 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
              More
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-shell/80 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
              Reach us
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-shell/80">
              <li>
                <a
                  href="mailto:lumanai.events@gmail.com"
                  className="transition-colors hover:text-gold"
                >
                  lumanai.events@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+17026260858"
                  className="transition-colors hover:text-gold"
                >
                  (702) 626-0858
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/lumanaikava"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold"
                >
                  @lumanaikava
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Partnerships — logo slots swap in when the files arrive. */}
        <div className="mt-16 border-t border-shell/10 pt-8">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-shell/40">
            In partnership with
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {["Etho Wellness Club", "Discoflow", "Sweat Equity"].map((name) => (
              <span
                key={name}
                className="h-sign-med text-xl tracking-wide text-shell/60 transition-colors hover:text-gold"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-shell/10 pt-6 text-xs text-shell/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Lumanai Kava · Terra Incognita LLC</p>
          <p>
            1% of every order supports the South Pacific Islander Organization.
          </p>
        </div>
      </div>
    </footer>
  );
}
