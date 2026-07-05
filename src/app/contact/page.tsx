import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact — Lumanai Kava" };

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-jade">
        Contact
      </p>
      <h1 className="mt-4 font-display text-4xl italic sm:text-5xl">
        Reach out any time.
      </h1>

      <div className="mt-14 grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-8">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/40">
              Phone
            </h2>
            <a href="tel:+17026260858" className="mt-1 block text-lg text-ink hover:text-jade">
              (702) 626-0858
            </a>
          </div>
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/40">
              Mailing Address
            </h2>
            <p className="mt-1 text-lg text-ink">
              1370 W Cheyenne Ave
              <br />
              North Las Vegas, NV 89030
            </p>
          </div>
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/40">
              Social
            </h2>
            <a
              href="https://www.instagram.com/lumanaikava"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-lg text-ink hover:text-jade"
            >
              Instagram — @lumanaikava
            </a>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
