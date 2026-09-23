import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Fleet | The Europe Transfers",
  description:
    "Browse the premium fleet at The Europe Transfers — Mercedes-Benz sedans, vans and coaches for private transfers and sightseeing across Europe.",
  alternates: {
    canonical: "https://theeuropetransfers.com/fleet",
  },
  openGraph: {
    title: "Our Fleet | The Europe Transfers",
    description:
      "Browse the premium fleet at The Europe Transfers — Mercedes-Benz sedans, vans and coaches.",
    url: "https://theeuropetransfers.com/fleet",
    type: "website",
  },
};

export default function FleetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
