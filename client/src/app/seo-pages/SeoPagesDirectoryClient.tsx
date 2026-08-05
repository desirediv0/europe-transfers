"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { SeoPage, Pagination } from "@/lib/types";
import { Search, MapPin, ArrowRight, ChevronLeft, ChevronRight, Globe, ShieldCheck } from "lucide-react";

export default function SeoPagesDirectoryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const searchFromUrl = searchParams.get("search") || "";
  const categoryFromUrl = searchParams.get("category") || "";

  const [pages, setPages] = useState<SeoPage[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: pageFromUrl, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

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
        params.delete("page");
      }

      if (newParams.search !== undefined) {
        if (newParams.search) params.set("search", newParams.search);
        else params.delete("search");
        params.delete("page");
      }

      const queryString = params.toString();
      router.push(`/seo-pages${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      updateUrlParams({ search: val });
    }, 400);
  };

  const loadSeoPages = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/seo-pages?status=ACTIVE&page=${pageFromUrl}&limit=12`;
      if (searchFromUrl) url += `&search=${encodeURIComponent(searchFromUrl)}`;
      if (categoryFromUrl) url += `&category=${encodeURIComponent(categoryFromUrl)}`;

      const data = await api.get<{ items: SeoPage[]; pagination: Pagination }>(url);
      setPages(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });

      // Extract unique categories for filter pills
      const cats = Array.from(new Set((data.items || []).map((p) => p.linkedCategory).filter(Boolean))) as string[];
      if (cats.length > 0) setCategoriesList(cats);
    } catch (err) {
      console.error("Failed to load SEO pages directory", err);
    } finally {
      setLoading(false);
    }
  }, [pageFromUrl, searchFromUrl, categoryFromUrl]);

  useEffect(() => {
    loadSeoPages();
  }, [loadSeoPages]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold bg-[#C9A227]/15 text-[#8A6A0B] border border-[#C9A227]/30 uppercase tracking-widest">
            <Globe className="h-3.5 w-3.5 mr-1 text-[#C9A227]" /> Europe DMC Regional Network
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F1A2E] tracking-tight">
            Regional Destinations & B2B Services Directory
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            Browse our customized regional DMC landing pages, travel agent partner solutions, and European transfer guides across cities worldwide.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search city, region, or DMC..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F1A2E] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 sm:pb-0 scrollbar-none">
              <button
                onClick={() => updateUrlParams({ category: "" })}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  !categoryFromUrl
                    ? "bg-[#0F1A2E] text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Regional Pages
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateUrlParams({ category: cat })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    categoryFromUrl === cat
                      ? "bg-[#0F1A2E] text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white h-52 rounded-2xl animate-pulse border border-slate-200 p-6" />
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xl font-bold text-slate-800">No regional pages found</h3>
            <p className="text-sm text-slate-500">Try searching for a different city or region name.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((item) => (
              <Link
                key={item.id}
                href={`/${item.slug}`}
                className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#0F1A2E]/5 text-[#0F1A2E] border border-[#0F1A2E]/10 uppercase tracking-wider">
                      <MapPin className="h-3 w-3 mr-1 text-[#C9A227]" />
                      {item.linkedCategory || "EUROPE PACKAGE"}
                    </span>
                    <ShieldCheck className="h-4 w-4 text-[#C9A227]" />
                  </div>

                  <h2 className="text-xl font-bold text-[#0F1A2E] group-hover:text-[#C9A227] transition-colors leading-snug">
                    {item.title}
                  </h2>

                  {item.pageDescription && (
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.pageDescription}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0F1A2E] group-hover:text-[#C9A227]">
                  <span>View Regional DMC Services</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-6">
            <button
              disabled={pagination.page <= 1}
              onClick={() => updateUrlParams({ page: pagination.page - 1 })}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {Array.from({ length: pagination.pages }).map((_, idx) => {
              const pNum = idx + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => updateUrlParams({ page: pNum })}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                    pagination.page === pNum
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
              onClick={() => updateUrlParams({ page: pagination.page + 1 })}
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
