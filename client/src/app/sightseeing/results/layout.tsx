import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sightseeing Results | The Europe Transfers",
  robots: { index: false, follow: true },
};

export default function SightseeingResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
