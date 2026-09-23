import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Results | The Europe Transfers",
  robots: { index: false, follow: true },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
