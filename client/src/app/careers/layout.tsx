import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | The Europe Transfers",
  description:
    "Explore career opportunities at The Europe Transfers — join Europe's trusted B2B DMC for private transfers, coaches and tour operations.",
  alternates: {
    canonical: "https://theeuropetransfers.com/careers",
  },
  openGraph: {
    title: "Careers | The Europe Transfers",
    description:
      "Explore career opportunities at The Europe Transfers — join Europe's trusted B2B DMC.",
    url: "https://theeuropetransfers.com/careers",
    type: "website",
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
