import { Suspense } from "react";
import type { Metadata } from "next";
import SeoPagesDirectoryClient from "./SeoPagesDirectoryClient";

export const metadata: Metadata = {
  title: "Regional Destinations & Europe DMC Directory | Europe Transfers",
  description: "Browse all regional B2B Europe DMC pages, travel partner guides, and airport transfer services by city and country.",
};


export default function SeoPagesDirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-12 text-center text-slate-500">Loading Regional Directory...</div>}>
      <SeoPagesDirectoryClient />
    </Suspense>
  );
}
