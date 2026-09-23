import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const SITE_URL = "https://theeuropetransfers.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Europe Transfers — Premium Private Transfers & Luxury Tours in Europe",
    template: "%s | The Europe Transfers",
  },
  description:
    "Book premium private airport transfers, luxury chauffeured tours, van & coach hire, and curated sightseeing packages across Europe. Safe, reliable, and comfortable travel with The Europe Transfers.",
  keywords: [
    "Europe transfers",
    "private transfers Europe",
    "Europe DMC",
    "Europe tour packages",
    "airport transfer Europe",
    "luxury chauffeur Europe",
    "Europe sightseeing tours",
    "van hire Europe",
    "coach hire Europe",
    "Europe travel agency",
    "B2B Europe DMC India",
  ],
  authors: [{ name: "The Europe Transfers" }],
  creator: "The Europe Transfers",
  publisher: "The Europe Transfers",
  formatDetection: { telephone: true, email: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "The Europe Transfers",
    title: "The Europe Transfers — Premium Private Transfers & Luxury Tours",
    description:
      "Book premium private airport transfers, luxury chauffeured tours, and curated sightseeing packages across Europe.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "The Europe Transfers — Premium Travel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Europe Transfers — Premium Private Transfers & Luxury Tours",
    description:
      "Book premium private airport transfers, luxury chauffeured tours, and curated sightseeing packages across Europe.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "The Europe Transfers",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Premium private airport transfers, luxury chauffeured tours, van & coach hire, and curated sightseeing packages across Europe.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: [],
  areaServed: {
    "@type": "Continent",
    name: "Europe",
  },
  serviceType: [
    "Private Airport Transfers",
    "Luxury Chauffeured Tours",
    "Van & Coach Hire",
    "Sightseeing Tours",
    "Europe DMC Services",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S1CWM82B0Q"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S1CWM82B0Q');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
