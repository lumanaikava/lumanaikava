import type { Metadata } from "next";
import { Barlow, Barlow_Semi_Condensed } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  metadataBase: new URL("https://lumanai.com"),
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
    url: "https://lumanai.com",
    siteName: "Lumanai Kava",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "The Lumanai craft kava bar at an event",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@lumanaikava",
    images: ["/og.jpg"],
  },
};

// LocalBusiness schema so Google understands the event-bar business.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "Lumanai Kava",
  description:
    "Craft kava + functional mocktail bar. Alcohol-free social beverages bartended at events across Las Vegas.",
  url: "https://lumanai.com",
  telephone: "+17026260858",
  email: "lumanai.events@gmail.com",
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
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
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
