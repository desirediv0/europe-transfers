import type { Metadata } from "next";
import SightseeingClient from "./SightseeingClient";

export const metadata: Metadata = {
  title: "European Sightseeing Tours & Cruises",
  description:
    "Book curated sightseeing tours, river cruises, and guided excursions across Europe. Eiffel Tower, Seine dinner cruises, Tuscan wine tours, Swiss Alps excursions & more. Skip-the-line tickets and VIP experiences.",
  keywords: [
    "Europe sightseeing tours",
    "Europe guided tours",
    "Seine cruise Paris",
    "Eiffel Tower tour",
    "Europe river cruise",
    "Tuscany wine tour",
    "Swiss Alps excursion",
    "Europe activities booking",
    "skip the line Europe",
  ],
  alternates: {
    canonical: "https://theeuropetransfers.com/sightseeing",
  },
  openGraph: {
    title: "European Sightseeing Tours & Cruises | The Europe Transfers",
    description:
      "Book curated sightseeing tours, river cruises, and guided excursions across Europe. VIP experiences available.",
    url: "https://theeuropetransfers.com/sightseeing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "European Sightseeing Tours & Cruises",
    description:
      "Book curated sightseeing tours, river cruises, and guided excursions across Europe.",
  },
};

export default function SightseeingPage() {
  return <SightseeingClient />;
}
