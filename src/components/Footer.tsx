import Image from "next/image";
import Link from "next/link";
import CoconutSecret from "./CoconutSecret";
import NewsletterForm from "./NewsletterForm";
import Ripple from "./Ripple";
import { navLinks, footerLinks } from "@/lib/nav";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";

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
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3.5 px-6 py-7 text-center lg:flex-row lg:justify-between lg:py-8 lg:text-left">
          <div>
            <p className="h-sign-med text-xl text-shell lg:text-2xl">
              The Lounge is coming to Las Vegas.
            </p>
            <p className="mt-1 text-sm text-shell/60">
              First pours, first invites, secret menu drops — get on the list.
            </p>
          </div>
          <NewsletterForm source="footer-waitlist" />
        </div>
      </div>

      {/* Two columns on a phone, not four stacked ones. Stacked, this
          block alone ran to two full screens on every page of the site —
          more scrolling than most of the pages it sat under. */}
      <div className="relative mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <Image
              src="/lumanai-wordmark.svg"
              alt="LUMANAI"
              width={150}
              height={61}
              className="h-auto w-[132px] lg:w-[150px]"
            />
            <p className="mt-3 max-w-xs leading-snug text-shell/80 lg:mt-4 lg:text-lg">
              Drink Different. All the buzz — none of the booze.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-shell/40">
              Booking · Las Vegas, NV
            </p>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
              Explore
            </h3>
            <ul className="mt-2 space-y-0.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-1.5 text-sm text-shell/80 transition-colors hover:text-gold"
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
            <ul className="mt-2 space-y-0.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-1.5 text-sm text-shell/80 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
              Reach us
            </h3>
            <ul className="mt-2 space-y-0.5 text-sm text-shell/80">
              <li>
                <a
                  href={CONTACT_MAILTO}
                  className="block py-1.5 transition-colors hover:text-gold"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href="tel:+17026260858"
                  className="block py-1.5 transition-colors hover:text-gold"
                >
                  (702) 626-0858
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/lumanaikava"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-1.5 transition-colors hover:text-gold"
                >
                  @lumanaikava
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Partnerships — logo slots swap in when the files arrive. */}
        <div className="mt-9 border-t border-shell/10 pt-6">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-shell/40">
            In partnership with
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 lg:flex-nowrap lg:gap-x-6">
            {[
              "Etho Wellness Club",
              "Discoflow",
              "Sweat Equity",
              "Ritual Collective",
              "Reshape Body Bar",
              "My Health Matrix",
              "Grizzly Health",
            ].map((name) => (
              <span
                key={name}
                className="h-sign-med whitespace-nowrap text-[13px] tracking-wide text-shell/60 transition-colors hover:text-gold sm:text-sm lg:text-base"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-shell/10 pt-5 text-xs text-shell/50 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2.5">
            © {new Date().getFullYear()} Lumanai Kava · Terra Incognita LLC
            <CoconutSecret />
          </p>
          <p className="flex items-center gap-4">
            1% of every order supports the South Pacific Islander Organization.
            <Link
              href="/admin"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-shell/35 transition-colors hover:text-gold"
            >
              Crew
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
