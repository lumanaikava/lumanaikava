import type { Metadata } from "next";
import { Barlow, Barlow_Semi_Condensed } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import FlashOverlay from "@/components/FlashOverlay";
import { CONTACT_EMAIL } from "@/lib/contact";
import { SITE_ORIGIN } from "@/lib/site-origin";

// Bar-sign headlines: Barlow Semi Condensed, heavy weights.
const barlow = Barlow_Semi_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// Body copy + labels: standard-width Barlow — the readable sibling of
// the condensed sign face, so small text stays legible without going
// off-brand.
const barlowBody = Barlow({
  variable: "--font-barlow-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Lumanai Kava — Craft Kava + Functional Mocktail Bar",
    template: "%s — Lumanai Kava",
  },
  description:
    "All the buzz — without the booze. Lumanai bartends craft kava naktails and functional mocktails at events across Las Vegas.",
  keywords: [
    "kava",
    "kava bar",
    "functional mocktails",
    "alcohol-free bar",
    "sober bar catering",
    "Las Vegas mobile bar",
    "naktails",
  ],
  openGraph: {
    title: "Lumanai Kava — Craft Kava + Functional Mocktail Bar",
    description:
      "All the buzz — without the booze. Craft kava naktails and functional mocktails, bartended at your event.",
    url: SITE_ORIGIN,
    siteName: "Lumanai Kava",
    locale: "en_US",
    type: "website",
    // Images come from src/app/opengraph-image.png, which Next picks up
    // by filename. Listing one here as well would override it — and the
    // old /og.jpg was a dim photo that read as nothing at thumbnail size
    // in an iMessage bubble. Regenerate with scripts/build-brand-images.mjs.
  },
  twitter: {
    card: "summary_large_image",
    site: "@lumanaikava",
  },
};

// LocalBusiness schema so Google understands the event-bar business.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "Lumanai Kava",
  description:
    "Craft kava + functional mocktail bar. Alcohol-free social beverages bartended at events across Las Vegas.",
  url: SITE_ORIGIN,
  telephone: "+17026260858",
  email: CONTACT_EMAIL,
  servesCuisine: "Kava, non-alcoholic cocktails",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1370 W Cheyenne Ave",
    addressLocality: "North Las Vegas",
    addressRegion: "NV",
    postalCode: "89030",
    addressCountry: "US",
  },
  areaServed: ["Las Vegas"],
  sameAs: ["https://www.instagram.com/lumanaikava"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowBody.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ocean text-shell">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {/* Wraps the header too — the cart badge lives up there, so the
            provider can't sit any deeper than this. */}
        <CartProvider>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <FlashOverlay />
        </CartProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        {/* Analytics — activates when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set. */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </body>
    </html>
  );
}
