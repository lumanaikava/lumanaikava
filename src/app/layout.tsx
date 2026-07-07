import type { Metadata } from "next";
import { Barlow_Condensed, Spectral, Work_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Bold condensed sans — matches the CRAFT KAVA bar sign.
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

// Italic serif for lyrical accents.
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lumanai.com"),
  title: {
    default: "Lumanai Kava — Craft Kava + Functional Mocktail Bar",
    template: "%s — Lumanai Kava",
  },
  description:
    "All the buzz — without the booze. Lumanai bartends craft kava naktails and functional mocktails at events across LA and Vegas.",
  keywords: [
    "kava",
    "kava bar",
    "functional mocktails",
    "alcohol-free bar",
    "sober bar catering",
    "Las Vegas mobile bar",
    "Los Angeles mobile bar",
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
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "The Lumanai craft kava bar at an event" }],
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
    "Craft kava + functional mocktail bar. Alcohol-free social beverages bartended at events across Las Vegas and Los Angeles.",
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
  areaServed: ["Las Vegas", "Los Angeles"],
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
      className={`${barlowCondensed.variable} ${spectral.variable} ${workSans.variable} ${spaceMono.variable} h-full antialiased`}
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
      </body>
    </html>
  );
}
