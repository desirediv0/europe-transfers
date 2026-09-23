import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About The Europe Transfers | B2B Europe DMC & Transfer Partner",
  description:
    "Learn about The Europe Transfers — 25 years of B2B Europe DMC experience in private transfers, airport transfers, coaches, sightseeing and tour packages across Europe, UK & Scandinavia.",
  alternates: {
    canonical: "https://theeuropetransfers.com/about",
  },
  openGraph: {
    title: "About The Europe Transfers | B2B Europe DMC & Transfer Partner",
    description:
      "Learn about The Europe Transfers — 25 years of B2B Europe DMC experience in private transfers, coaches, sightseeing and tour packages.",
    url: "https://theeuropetransfers.com/about",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
