import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import type { BlogTag } from "@/lib/types";
import BlogTagClient from "./BlogTagClient";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getTag(slug: string): Promise<BlogTag | null> {
  try {
    const tags = await api.get<BlogTag[]>("/blog/tags");
    return tags.find((t) => t.slug === slug) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);

  if (!tag) {
    return { title: "Tag Not Found | Europe Transfers" };
  }

  return {
    title: `#${tag.name} Articles | Europe Transfers Blog`,
    description: `Browse articles tagged with #${tag.name} on Europe Transfers.`,
  };

}

export default async function BlogTagPage({ params }: Props) {
  const { slug } = await params;
  const tag = await getTag(slug);

  if (!tag) {
    notFound();
  }

  return <BlogTagClient tag={tag} />;
}
