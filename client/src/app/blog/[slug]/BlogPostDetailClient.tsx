"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import {
  Calendar,
  Tag,
  Clock,
  Share2,
  Folder,
  Home,
  ChevronRight,
  Phone,
  MessageSquare,
  Sparkles,
  Bookmark,
} from "lucide-react";


interface Props {
  post: BlogPost;
}

export default function BlogPostDetailClient({ post }: Props) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Load related posts from the same category or latest posts
    api.get<{ items: BlogPost[] }>(`/blog/posts?status=PUBLISHED&limit=4`)
      .then((res) => {
        const filtered = (res.items || []).filter((p) => p.id !== post.id).slice(0, 3);
        setRelatedPosts(filtered);
      })
      .catch(() => {});
  }, [post.id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const articleJsonLd = {

    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.title,
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      "@type": "Organization",
      name: "Europe Transfers",
    },
    publisher: {
      "@type": "Organization",
      name: "Europe Transfers",
      logo: {
        "@type": "ImageObject",
        url: "https://europe-transfers.com/logo.png",
      },
    },
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Schema.org Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Hero Header Banner */}
      <section className="relative bg-[#0F1A2E] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Overlay Image if present */}
        <div className="absolute inset-0 opacity-20">
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#0F1A2E] via-[#1B2A4A] to-[#0F1A2E]" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2E] via-[#0F1A2E]/80 to-transparent" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-5">
          {post.category && (
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40 uppercase tracking-widest hover:bg-[#C9A227] hover:text-[#0F1A2E] transition-colors shadow-sm"
            >
              <Folder className="h-3.5 w-3.5 mr-1.5" />
              {post.category.name}
            </Link>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-300">
            <span className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#C9A227]" />
              Published: {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-[#C9A227]" />
              5 min read
            </span>
            <span className="flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#C9A227]" />
              By Europe Transfers Team
            </span>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 60L60 52.5C120 45 240 30 360 22.5C480 15 600 15 720 18.75C840 22.5 960 30 1080 33.75C1200 37.5 1320 37.5 1380 37.5L1440 37.5V60H0Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </section>

      {/* Breadcrumbs Navigation */}
      <nav className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <ol className="flex items-center space-x-2 text-xs text-slate-500 font-medium overflow-x-auto">
            <li>
              <Link href="/" className="hover:text-[#0F1A2E] flex items-center transition-colors">
                <Home className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 mx-1" />
              <Link href="/blog" className="hover:text-[#0F1A2E] transition-colors">
                Blog
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 mx-1" />
              <span className="text-[#0F1A2E] font-bold line-clamp-1">{post.title}</span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Main 2-Column Grid Area */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Main Article Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8">
              
              {/* Cover Image */}
              {post.coverImage && (
                <div className="relative w-full h-[320px] sm:h-[400px] rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Post Content */}
              <article
                className="prose prose-slate lg:prose-lg max-w-none text-slate-700 leading-relaxed font-sans prose-headings:font-extrabold prose-headings:text-[#0F1A2E] prose-a:text-[#0F1A2E] prose-a:font-bold hover:prose-a:text-[#C9A227]"
                dangerouslySetInnerHTML={{ __html: post.content || "<p>No content provided yet.</p>" }}
              />

              {/* Author & Share Bar */}
              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-[#0F1A2E] text-[#C9A227] font-black flex items-center justify-center text-xs shadow">
                    ET
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#0F1A2E] text-sm">Europe Transfers Team</h4>
                    <p className="text-xs text-slate-500">Official B2B Europe Travel Partner</p>
                  </div>
                </div>


                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: post.title, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Article URL copied to clipboard!");
                    }
                  }}
                  className="inline-flex items-center text-xs font-bold text-[#0F1A2E] hover:bg-slate-200 bg-slate-100 px-4 py-2.5 rounded-xl transition-colors self-start sm:self-auto"
                >
                  <Share2 className="h-3.5 w-3.5 mr-2" /> Share Article
                </button>
              </div>

              {/* Tag Pills */}
              {post.tags && post.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Article Tags:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <Link
                        key={t.tagId}
                        href={`/blog/tag/${t.tag?.slug || ""}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-[#0F1A2E] text-slate-700 hover:text-white text-xs font-bold border border-slate-200 transition-all flex items-center"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        #{t.tag?.name || "Tag"}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Sticky Sidebar Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              
              {/* Need Help B2B Widget */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold text-[#C9A227] uppercase tracking-widest block">
                    Need Travel Assistance?
                  </span>
                  <h3 className="text-xl font-extrabold text-[#0F1A2E]">
                    B2B Travel Desk & Quotes
                  </h3>
                </div>

                <div className="space-y-3">
                  <a
                    href="https://wa.me/918882382864"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center shadow transition-transform hover:scale-105"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> Chat on WhatsApp
                  </a>

                  <Link
                    href="/contact"
                    className="w-full py-3.5 bg-[#0F1A2E] hover:bg-[#1B2A4A] text-white rounded-xl font-extrabold text-xs flex items-center justify-center shadow transition-transform hover:scale-105"
                  >
                    <Phone className="h-4 w-4 mr-2 text-[#C9A227]" /> Get B2B Quote
                  </Link>
                </div>
              </div>

              {/* Related Posts Widget */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <Bookmark className="h-4 w-4 text-[#C9A227]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0F1A2E]">
                      Related Articles
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {relatedPosts.map((rel) => (
                      <Link key={rel.id} href={`/blog/${rel.slug}`} className="block group">
                        <h4 className="text-sm font-bold text-[#0F1A2E] group-hover:text-[#C9A227] transition-colors line-clamp-2">
                          {rel.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-[#C9A227]" />
                          {formatDate(rel.publishedAt || rel.createdAt)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Bottom CTA Banner */}
        <section className="mt-16 bg-gradient-to-r from-[#0F1A2E] via-[#1B2A4A] to-[#0F1A2E] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl font-black">
            Ready to Expand Your Europe Travel Business?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Get exclusive B2B wholesale rates, customized tour packages, and reliable ground transportation for your agency.
          </p>

          <div className="flex justify-center items-center space-x-6 text-xs font-extrabold text-[#C9A227] uppercase tracking-widest pt-2">
            <span>✓ 100% Reliability</span>
            <span>•</span>
            <span>✓ 24/7 On-Ground Support</span>
          </div>

          <div className="pt-2 flex justify-center">
            <Link
              href="/results"
              className="bg-[#C9A227] hover:bg-[#b08d1e] text-[#0F1A2E] font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              Search Rates & Fleet
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
