import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Van & Coach Results | The Europe Transfers",
  robots: { index: false, follow: true },
};

export default function VanCoachResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
