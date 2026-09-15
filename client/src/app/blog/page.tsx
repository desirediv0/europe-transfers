import type { Metadata } from "next";
import { Suspense } from "react";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Europe Travel Blog & Guides | Europe Transfers",
  description:
    "Explore Europe travel guides, DMC insights, destination planning tips, and B2B Europe transfer updates from Europe Transfers.",
  keywords: [
    "Europe travel blog",
    "Europe DMC guide",
    "Europe destination planning",
    "Europe travel tips",
    "B2B Europe transfers blog",
    "Europe tour guide",
  ],
  alternates: {
    canonical: "https://theeuropetransfers.com/blog",
  },
  openGraph: {
    title: "Europe Travel Blog & Guides | Europe Transfers",
    description:
      "Explore Europe travel guides, DMC insights, destination planning tips, and B2B Europe transfer updates.",
    url: "https://theeuropetransfers.com/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Europe Travel Blog & Guides | Europe Transfers",
    description:
      "Explore Europe travel guides, DMC insights, destination planning tips, and B2B Europe transfer updates.",
  },
};


export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-12 text-center text-slate-400">Loading articles...</div>}>
      <BlogClient />
    </Suspense>
  );
}
