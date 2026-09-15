import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us — Get a Free Quote for Europe Transfers",
  description:
    "Get in touch with The Europe Transfers for a free quote on private airport transfers, luxury tours, van & coach hire, and custom itineraries across Europe. Available 24/7 via phone, email, and WhatsApp.",
  keywords: [
    "contact Europe Transfers",
    "Europe transfer quote",
    "book private transfer Europe",
    "Europe travel inquiry",
    "Europe DMC contact",
    "custom Europe itinerary",
    "Europe tour booking",
  ],
  alternates: {
    canonical: "https://theeuropetransfers.com/contact",
  },
  openGraph: {
    title: "Contact Us — Get a Free Quote | The Europe Transfers",
    description:
      "Get in touch for a free quote on private airport transfers, luxury tours, and custom itineraries across Europe.",
    url: "https://theeuropetransfers.com/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — Get a Free Quote for Europe Transfers",
    description:
      "Get in touch for a free quote on private airport transfers, luxury tours, and custom itineraries across Europe.",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
