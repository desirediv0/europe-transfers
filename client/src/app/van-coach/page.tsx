import type { Metadata } from "next";
import VanCoachClient from "./VanCoachClient";

export const metadata: Metadata = {
  title: "Van & Coach Hire Across Europe — Hourly Disposal",
  description:
    "Hire luxury vans, minibuses, and coaches across Europe by the hour. Mercedes V-Class, Sprinter & full-size coaches with professional English-speaking chauffeurs. Ideal for group transfers, corporate events, and sightseeing tours.",
  keywords: [
    "van hire Europe",
    "coach hire Europe",
    "minibus rental Europe",
    "Mercedes V-Class hire",
    "hourly chauffeur Europe",
    "group transfer Europe",
    "corporate coach hire",
    "Europe vehicle disposal",
  ],
  alternates: {
    canonical: "https://theeuropetransfers.com/van-coach",
  },
  openGraph: {
    title: "Van & Coach Hire Across Europe | The Europe Transfers",
    description:
      "Hire luxury vans, minibuses, and coaches across Europe by the hour. Mercedes fleet with professional chauffeurs.",
    url: "https://theeuropetransfers.com/van-coach",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Van & Coach Hire Across Europe",
    description:
      "Hire luxury vans, minibuses, and coaches across Europe by the hour with professional chauffeurs.",
  },
};

export default function VanCoachPage() {
  return <VanCoachClient />;
}
