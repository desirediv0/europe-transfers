import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Europe Private Transfers & Luxury Chauffeured Tours | The Europe Transfers",
  description:
    "Book premium private airport transfers, luxury chauffeured tours, van & coach hire, and curated sightseeing packages across Europe. Trusted by 15,000+ travelers. Fixed pricing, flight tracking, 24/7 concierge.",
  keywords: [
    "Europe private transfers",
    "luxury airport transfer Europe",
    "Europe DMC",
    "Europe tour packages",
    "private chauffeur Europe",
    "airport pickup Europe",
    "Europe sightseeing tours",
    "van coach hire Europe",
    "B2B Europe DMC India",
    "The Europe Transfers",
  ],
  alternates: {
    canonical: "https://theeuropetransfers.com",
  },
  openGraph: {
    title: "Europe Private Transfers & Luxury Chauffeured Tours | The Europe Transfers",
    description:
      "Book premium private airport transfers, luxury chauffeured tours, and curated sightseeing packages across Europe.",
    url: "https://theeuropetransfers.com",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "The Europe Transfers — Premium Travel & Tours",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Europe Private Transfers & Luxury Chauffeured Tours",
    description:
      "Book premium private airport transfers, luxury chauffeured tours, and curated sightseeing packages across Europe.",
    images: ["/logo.png"],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
