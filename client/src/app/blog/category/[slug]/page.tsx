import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import type { BlogCategory } from "@/lib/types";
import BlogCategoryClient from "./BlogCategoryClient";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string): Promise<BlogCategory | null> {
  try {
    const categories = await api.get<BlogCategory[]>("/blog/categories");
    return categories.find((c) => c.slug === slug) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Category Not Found | Europe Transfers" };
  }

  return {
    title: category.metaTitle || `${category.name} Articles | Europe Transfers Blog`,

    description: category.metaDescription || category.description || `Read articles in ${category.name}`,
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return <BlogCategoryClient category={category} />;
}
