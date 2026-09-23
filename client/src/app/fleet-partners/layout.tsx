import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Driver & Fleet Partners | The Europe Transfers",
  description:
    "Partner with The Europe Transfers as a driver or fleet owner. Join our B2B Europe DMC network for consistent transfers, coaches and sightseeing work.",
  alternates: {
    canonical: "https://theeuropetransfers.com/fleet-partners",
  },
  openGraph: {
    title: "Driver & Fleet Partners | The Europe Transfers",
    description:
      "Partner with The Europe Transfers as a driver or fleet owner across Europe.",
    url: "https://theeuropetransfers.com/fleet-partners",
    type: "website",
  },
};

export default function FleetPartnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
