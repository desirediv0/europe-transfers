import type { Metadata } from "next";
import PackagesClient from "./PackagesClient";

export const metadata: Metadata = {
  title: "Europe Tour Packages — Curated Luxury Itineraries",
  description:
    "Explore handpicked luxury chauffeured tour packages across Europe. Multi-day itineraries covering Switzerland, Italy, France, Spain & more. All-inclusive pricing with private transfers, hotels, and guided sightseeing.",
  keywords: [
    "Europe tour packages",
    "luxury Europe itinerary",
    "Europe holiday packages",
    "Switzerland tour package",
    "Italy tour package",
    "France tour package",
    "Europe multi-city tour",
    "Europe DMC packages",
    "B2B Europe tour packages",
  ],
  alternates: {
    canonical: "https://theeuropetransfers.com/packages",
  },
  openGraph: {
    title: "Europe Tour Packages — Curated Luxury Itineraries | The Europe Transfers",
    description:
      "Explore handpicked luxury chauffeured tour packages across Europe. Multi-day itineraries with all-inclusive pricing.",
    url: "https://theeuropetransfers.com/packages",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Europe Tour Packages — Curated Luxury Itineraries",
    description:
      "Explore handpicked luxury chauffeured tour packages across Europe with all-inclusive pricing.",
  },
};

export default function PackagesPage() {
  return <PackagesClient />;
}
