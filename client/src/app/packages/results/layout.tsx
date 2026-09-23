import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Package Results | The Europe Transfers",
  robots: { index: false, follow: true },
};

export default function PackageResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
