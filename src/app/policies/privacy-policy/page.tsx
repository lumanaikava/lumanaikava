import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";

export const metadata = { title: "Privacy Policy — Lumanai Kava" };

/**
 * Real privacy policy — not a stub.
 *
 * The SMS section exists for a specific reason: mobile carriers review
 * this page before approving A2P 10DLC campaign registration, and they
 * look for named things — how consent is collected, message frequency,
 * STOP/HELP, and an explicit statement that mobile data isn't shared or
 * sold for marketing. Missing any of those is a common rejection.
 * Keep the consent wording here in sync with src/components/SmsConsent.tsx.
 */

const UPDATED = "August 3, 2026";

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="h-sign-med text-xl text-shell">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-shell/75">
        {children}
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
        Policy
      </p>
      <h1 className="h-sign mt-4 text-5xl text-shell">Privacy Policy</h1>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-shell/45">
        Last updated {UPDATED}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-shell/75">
        Lumanai Kava (&ldquo;Lumanai,&rdquo; &ldquo;we,&rdquo; or
        &ldquo;us&rdquo;) runs a craft kava and functional mocktail bar serving
        events and markets across Las Vegas, Nevada. This policy explains what
        we collect through lumanai.com, why, and what you can do about it.
      </p>

      <Section heading="What we collect">
        <p>
          <strong className="text-shell">You give us:</strong> your name, email
          address, and — if you choose to provide it — your phone number, when
          you request an event quote, send us a message, or join our list. Event
          requests also include the details you type in: date, city, guest
          count, and what you&apos;re planning.
        </p>
        <p>
          <strong className="text-shell">Purchases:</strong> orders are handled
          by Shopify. Payment card details go directly to Shopify and its
          payment processors — we never see or store your card number.
        </p>
        <p>
          <strong className="text-shell">Automatically:</strong> basic,
          aggregate visit data (pages viewed, rough region, device type). We
          don&apos;t use advertising trackers or build profiles on you.
        </p>
      </Section>

      <Section heading="How we use it">
        <p>
          To answer your message, quote and run your event, fulfill orders, and
          — only if you asked for it — tell you where the bar is pouring and
          what&apos;s new. That&apos;s the whole list. We don&apos;t sell your
          information.
        </p>
      </Section>

      <Section heading="Text messages (SMS)">
        <p>
          <strong className="text-shell">
            No mobile information will be sold or shared with third parties or
            affiliates for marketing or promotional purposes.
          </strong>{" "}
          Phone numbers collected for SMS are never shared with anyone for
          those purposes. Information may be shared only with the service
          providers that help us deliver the messages themselves.
        </p>
        <p>
          <strong className="text-shell">How you opt in.</strong> We text you
          only if you ticked the SMS consent box on a form at lumanai.com, or
          gave us written permission in person. The box is never pre-ticked, and
          it&apos;s always optional — we&apos;ll answer your inquiry either way.
          Giving us a phone number by itself is not consent to marketing texts.
        </p>
        <p>
          <strong className="text-shell">What you&apos;ll get.</strong> Event
          announcements, where we&apos;re pouring, and occasional drink news —
          roughly a couple of messages a month. If you&apos;ve booked us or
          placed an order, you may also get messages about that specific
          booking or order.
        </p>
        <p>
          <strong className="text-shell">Costs.</strong> Message and data rates
          may apply, depending on your mobile plan.
        </p>
        <p>
          <strong className="text-shell">How to stop.</strong> Reply{" "}
          <strong className="text-shell">STOP</strong> to any message and
          we&apos;ll stop texting you. Reply{" "}
          <strong className="text-shell">HELP</strong> for help, or contact us
          at the address below.
        </p>
      </Section>

      <Section heading="Who we share it with">
        <p>
          Only the services that run the business: Shopify (orders and
          payments), our email and CRM provider, and our SMS provider. They may
          use your information only to provide their service to us. We
          don&apos;t sell personal information, and we don&apos;t share it for
          anyone else&apos;s marketing.
        </p>
      </Section>

      <Section heading="Your choices">
        <p>
          Unsubscribe from email using the link in any message; reply STOP to
          end texts. You can ask us what we hold about you, ask us to correct
          it, or ask us to delete it — just email and we&apos;ll take care of
          it. If you&apos;re a Nevada resident, you have the right to tell us
          not to sell your information; we don&apos;t sell it to begin with.
        </p>
      </Section>

      <Section heading="Keeping it safe">
        <p>
          We keep your information only as long as we need it to run the
          business and meet our legal and tax obligations, and we work with
          established providers who encrypt data in transit. No system is
          perfect, but we don&apos;t collect more than we need in the first
          place.
        </p>
      </Section>

      <Section heading="Children">
        <p>
          Our site and services aren&apos;t directed to anyone under 18, and we
          don&apos;t knowingly collect their information.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          If this policy changes, we&apos;ll update the date at the top of this
          page.
        </p>
      </Section>

      <Section heading="Contact us">
        <p>
          Lumanai Kava · Terra Incognita LLC — Las Vegas, Nevada
          <br />
          <a
            href={CONTACT_MAILTO}
            className="prose-link text-shell hover:text-gold"
          >
            {CONTACT_EMAIL}
          </a>
          <br />
          <a
            href="tel:+17026260858"
            className="prose-link text-shell hover:text-gold"
          >
            (702) 626-0858
          </a>
        </p>
      </Section>
    </section>
  );
}
