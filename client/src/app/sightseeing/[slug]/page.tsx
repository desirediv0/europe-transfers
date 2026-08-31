import { api } from "@/lib/api";
import { notFound } from "next/navigation";
import { SightseeingDetailClient, SightseeingTourDetail } from "./SightseeingDetailClient";

// Always fetch fresh tour data — this page must reflect admin edits
// immediately, not a cached build-time snapshot.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getSightseeingTour(slug: string): Promise<SightseeingTourDetail | null> {
  try {
    const tour = await api.get<SightseeingTourDetail>(`/sightseeing/${slug}`);
    return tour || null;
  } catch (err) {
    console.error("Error fetching sightseeing detail:", err);
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tour = await getSightseeingTour(slug);

  if (!tour) {
    return {
      title: "Sightseeing Experience Not Found | Europe Transfers",
    };
  }

  return {
    title: `${tour.seoTitle || tour.title} | Europe Transfers`,
    description: tour.seoDescription || tour.summary || `Book ${tour.title} with priority access and instant voucher.`,
  };
}

export default async function SightseeingDetailPage({ params }: Props) {
  const { slug } = await params;
  const tour = await getSightseeingTour(slug);

  if (!tour) {
    notFound();
  }

  return <SightseeingDetailClient tour={tour} />;
}
