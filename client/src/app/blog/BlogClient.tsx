"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { BlogPost, BlogCategory, BlogTag, Pagination } from "@/lib/types";
import { Search, Calendar, Tag as TagIcon, ArrowRight, Clock, ChevronLeft, ChevronRight } from "lucide-react";

export default function BlogClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read state from URL
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const categoryFromUrl = searchParams.get("category") || "";
  const searchFromUrl = searchParams.get("search") || "";

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: pageFromUrl, limit: 9, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);

  // Local search input for debouncing
  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  // Helper to update URL search params
  const updateUrlParams = useCallback(
    (newParams: { page?: number; category?: string; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newParams.page !== undefined) {
        if (newParams.page > 1) params.set("page", String(newParams.page));
        else params.delete("page");
      }

      if (newParams.category !== undefined) {
        if (newParams.category) params.set("category", newParams.category);
        else params.delete("category");
        params.delete("page"); // Reset page when category changes
      }

      if (newParams.search !== undefined) {
        if (newParams.search) params.set("search", newParams.search);
        else params.delete("search");
        params.delete("page"); // Reset page when search changes
      }

      const queryString = params.toString();
      router.push(`/blog${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Debounced search handler
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      updateUrlParams({ search: val });
    }, 400);
  };

  // Load posts whenever URL searchParams change
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = `/blog/posts?page=${pageFromUrl}&limit=9&status=PUBLISHED`;
      if (categoryFromUrl) query += `&categorySlug=${encodeURIComponent(categoryFromUrl)}`;
      if (searchFromUrl) query += `&search=${encodeURIComponent(searchFromUrl)}`;

      const data = await api.get<{ items: BlogPost[]; pagination: Pagination }>(query);
      setPosts(data.items);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  }, [pageFromUrl, categoryFromUrl, searchFromUrl]);

  useEffect(() => {
    // Load categories & tags for sidebar/filter pills once
    api.get<BlogCategory[]>("/blog/categories").then(setCategories).catch(() => {});
    api.get<BlogTag[]>("/blog/tags").then(setTags).catch(() => {});
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getExcerpt = (text?: string, maxLen = 120) => {
    if (!text) return "Read the full story and travel tips on Europe Transfers...";
    const cleanText = text.replace(/<[^>]*>?/gm, "");
    return cleanText.length > maxLen ? cleanText.substring(0, maxLen) + "..." : cleanText;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-extrabold bg-[#C9A227]/15 text-[#8A6A0B] border border-[#C9A227]/30 uppercase tracking-widest">
            Europe Transfers Travel Journal
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F1A2E] tracking-tight">
            Europe Travel Guides & B2B Insights
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            Discover destination guides, insider travel tips, DMC news, and expert Europe transfer advice.
          </p>
        </div>

        {/* Search & Categories Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search blog articles..."
                value={searchInput}
                onChange={handleSearchInputChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F1A2E] focus:bg-white transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 sm:pb-0 scrollbar-none">
              <button
                onClick={() => updateUrlParams({ category: "" })}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  !categoryFromUrl
                    ? "bg-[#0F1A2E] text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Articles
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateUrlParams({ category: cat.slug })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    categoryFromUrl === cat.slug
                      ? "bg-[#0F1A2E] text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags list */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 flex items-center mr-1 uppercase tracking-wider">
                <TagIcon className="h-3 w-3 mr-1" /> Tags:
              </span>
              {tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/blog/tag/${t.slug}`}
                  className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-white hover:bg-[#0F1A2E] hover:border-[#0F1A2E] transition-all"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Blog Post Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200 h-96 animate-pulse p-4 space-y-4">
                <div className="bg-slate-200 h-48 rounded-xl" />
                <div className="bg-slate-200 h-4 w-24 rounded" />
                <div className="bg-slate-200 h-6 w-full rounded" />
                <div className="bg-slate-200 h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xl font-bold text-slate-800">No blog posts found</h3>
            <p className="text-sm text-slate-500">Try adjusting your category filter or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Cover Image Container */}
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0F1A2E] to-[#1B2A4A] flex items-center justify-center p-6 text-center text-white font-bold text-lg">
                      {post.title}
                    </div>
                  )}
                  {post.category && (
                    <Link
                      href={`/blog/category/${post.category.slug}`}
                      className="absolute top-4 left-4 bg-[#0F1A2E] text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-sm hover:bg-[#C9A227] hover:text-[#0F1A2E] transition-colors"
                    >
                      {post.category.name}
                    </Link>
                  )}
                </div>

                {/* Article Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-[#C9A227]" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-[#C9A227]" />
                        4 min read
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-[#0F1A2E] group-hover:text-[#C9A227] transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {getExcerpt(post.content)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-xs font-extrabold text-[#0F1A2E] hover:text-[#C9A227] group-hover:translate-x-1 transition-all"
                    >
                      Read Article <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-6">
            <button
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {Array.from({ length: pagination.pages }).map((_, idx) => {
              const pNum = idx + 1;
              const isActive = pagination.page === pNum;
              return (
                <button
                  key={pNum}
                  onClick={() => handlePageChange(pNum)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#0F1A2E] text-white shadow-md"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
