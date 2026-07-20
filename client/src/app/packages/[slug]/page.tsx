import { api } from "@/lib/api";
import type { Package } from "@/lib/types";
import { PackageDetailClient } from "./PackageDetailClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;

  let pkg: Package | null = null;
  try {
    const data = await api.get<{ items: Package[] }>("/packages?limit=100");
    pkg = data.items.find((p) => p.slug === slug) || null;
    if (pkg) {
      const full = await api.get<Package>(`/packages/${pkg.id}`);
      pkg = full;
    }
  } catch {
    // silent
  }

  if (!pkg) notFound();

  return <PackageDetailClient pkg={pkg} />;
}
