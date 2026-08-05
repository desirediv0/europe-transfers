"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { BlogTag, BlogPost } from "@/lib/types";
import { ArrowLeft, Calendar, ArrowRight, Tag as TagIcon } from "lucide-react";

interface Props {
  tag: BlogTag;
}

export default function BlogTagClient({ tag }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ items: BlogPost[] }>(`/blog/posts?tagSlug=${tag.slug}&status=PUBLISHED`)
      .then((res) => setPosts(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tag.slug]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-bold text-[#0F1A2E] hover:text-[#C9A227] transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Articles
          </Link>
        </div>

        {/* Tag Header Banner */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <span className="text-xs font-extrabold text-[#C9A227] uppercase tracking-widest flex items-center">
            <TagIcon className="h-3.5 w-3.5 mr-1" /> Tag Archive
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1A2E]">#{tag.name}</h1>
        </div>

        {/* Grid of posts */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white h-80 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500">
            No articles found tagged with #{tag.name} yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-[#0F1A2E] flex items-center justify-center p-4 text-white font-bold text-center text-sm">{post.title}</div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs text-slate-400 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-[#C9A227]" /> {formatDate(post.publishedAt || post.createdAt)}
                    </div>
                    <h2 className="text-lg font-bold text-[#0F1A2E] group-hover:text-[#C9A227] transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                  </div>
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-xs font-bold text-[#0F1A2E] hover:text-[#C9A227]">
                    Read Article <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
