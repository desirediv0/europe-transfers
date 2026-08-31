import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import BlogPostDetailClient from "./BlogPostDetailClient";

// Always fetch fresh post data — this page must reflect admin edits
// immediately, not a cached build-time snapshot.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    return await api.get<BlogPost>(`/blog/posts/slug/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found | Europe Transfers",
    };
  }

  return {
    title: post.metaTitle || `${post.title} | Europe Transfers Blog`,

    description: post.metaDescription || post.title,
    keywords: post.metaKeywords ? post.metaKeywords.split(",") : undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.title,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostDetailClient post={post} />;
}
