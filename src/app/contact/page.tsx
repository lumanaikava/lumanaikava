import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Ripple from "@/components/Ripple";

export const metadata: Metadata = { title: "Contact — Lumanai Kava" };

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <Ripple
          className="pointer-events-none absolute -right-20 top-24 h-96 w-96 text-coconut/20"
          rings={5}
          animated={false}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            Contact
          </p>
          <h1 className="h-sign mt-4 text-5xl text-shell sm:text-7xl">
            Reach out any time.
          </h1>
          <p className="mt-4 max-w-lg text-shell/70">
            Booking questions land fastest through the{" "}
            <a
              href="/events#book"
              className="prose-link text-shell hover:text-gold"
            >
              events page
            </a>
            . Anything else, this form works great.
          </p>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-8">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
                  Email
                </p>
                <a
                  href="mailto:lumanai.events@gmail.com"
                  className="mt-1 block text-2xl text-shell hover:text-gold"
                >
                  lumanai.events@gmail.com
                </a>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
                  Phone / Text
                </p>
                <a
                  href="tel:+17026260858"
                  className="mt-1 block text-2xl text-shell hover:text-gold"
                >
                  (702) 626-0858
                </a>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
                  Mailing address
                </p>
                <p className="mt-1 text-shell/80">
                  1370 W Cheyenne Ave
                  <br />
                  North Las Vegas, NV 89030
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-shell/50">
                  Social
                </p>
                <a
                  href="https://www.instagram.com/lumanaikava"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-shell hover:text-gold"
                >
                  @lumanaikava
                </a>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
