import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import type { SeoPage } from "@/lib/types";
import SeoPageClient from "./SeoPageClient";

// Always fetch fresh page data — this page must reflect admin edits
// immediately, not a cached build-time snapshot.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getSeoPageData(slug: string): Promise<SeoPage | null> {
  try {
    return await api.get<SeoPage>(`/seo-pages/slug/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageData = await getSeoPageData(slug);

  if (!pageData) {
    return {
      title: "Page Not Found | Europe Transfers",
    };
  }

  return {
    title: pageData.metaTitle || `${pageData.title} | Europe Transfers`,

    description: pageData.metaDescription || pageData.pageDescription || pageData.title,
    keywords: pageData.metaKeywords ? pageData.metaKeywords.split(",") : undefined,
    openGraph: {
      title: pageData.metaTitle || pageData.title,
      description: pageData.metaDescription || pageData.pageDescription || pageData.title,
    },
  };
}

export default async function DynamicSeoPage({ params }: Props) {
  const { slug } = await params;
  const pageData = await getSeoPageData(slug);

  if (!pageData) {
    notFound();
  }

  return <SeoPageClient pageData={pageData} />;
}
