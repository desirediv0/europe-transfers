"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { IconPackage, IconSearch, IconChevronLeft, IconChevronRight, IconFilter, IconX } from "@tabler/icons-react";
import { api } from "@/lib/api";
import type { Package, Country } from "@/lib/types";
import PackageCard, { PackageCardSkeleton } from "@/components/PackageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

function PackagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read URL params
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialCountry = searchParams.get("country") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [packages, setPackages] = useState<Package[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: initialPage, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Sync state with URL params changes
  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get("page") || "1", 10));
    setSelectedCountry(searchParams.get("country") || "all");
    const s = searchParams.get("search") || "";
    setSearchQuery(s);
    setDebouncedSearch(s);
  }, [searchParams]);

  // Update URL helper
  const updateUrl = useCallback(
    (newParams: { page?: number; country?: string; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      const page = newParams.page !== undefined ? newParams.page : currentPage;
      const country = newParams.country !== undefined ? newParams.country : selectedCountry;
      const search = newParams.search !== undefined ? newParams.search : debouncedSearch;

      if (page > 1) params.set("page", page.toString());
      else params.delete("page");

      if (country && country !== "all") params.set("country", country);
      else params.delete("country");

      if (search.trim()) params.set("search", search.trim());
      else params.delete("search");

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, currentPage, selectedCountry, debouncedSearch, pathname, router]
  );

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== debouncedSearch) {
        setDebouncedSearch(searchQuery);
        setCurrentPage(1);
        updateUrl({ page: 1, search: searchQuery });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch, updateUrl]);

  // Fetch Countries on mount
  useEffect(() => {
    api.get<{ items: Country[] }>("/countries?limit=100")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setCountries(list);
      })
      .catch(() => setCountries([]));
  }, []);

  // Fetch Packages based on currentPage, selectedCountry, debouncedSearch
  useEffect(() => {
    setLoading(true);
    let url = `/packages?page=${currentPage}&limit=20`;

    if (selectedCountry !== "all") {
      const countryObj = countries.find((c) => c.slug === selectedCountry || c.name.toLowerCase() === selectedCountry.toLowerCase());
      if (countryObj) {
        url += `&countryId=${countryObj.id}`;
      }
    }

    if (debouncedSearch.trim()) {
      url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
    }

    api.get<{ items: Package[]; pagination: PaginationInfo }>(url)
      .then((res) => {
        setPackages(res.items || []);
        if (res.pagination) {
          setPagination(res.pagination);
        } else {
          setPagination({ page: currentPage, limit: 20, total: res.items?.length || 0, pages: 1 });
        }
      })
      .catch(() => {
        setPackages([]);
      })
      .finally(() => setLoading(false));
  }, [currentPage, selectedCountry, debouncedSearch, countries]);

  const handleCountrySelect = (countrySlug: string) => {
    setSelectedCountry(countrySlug);
    setCurrentPage(1);
    updateUrl({ page: 1, country: countrySlug });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
    updateUrl({ page: 1, search: "" });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setCurrentPage(newPage);
    updateUrl({ page: newPage });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 350, behavior: "smooth" });
    }
  };

  return (
    <div>
      {/* Search & Filter Bar */}
      <section className="bg-white border-b border-gray-200/80 sticky top-16 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Input Box with Debounce */}
            <div className="relative w-full md:w-80">
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-10 sm:h-11 rounded-xl border-gray-200 text-xs sm:text-sm font-medium focus:border-gold"
              />
              <IconSearch className="absolute left-3 top-3 sm:top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3 sm:top-3.5 text-gray-400 hover:text-navy cursor-pointer"
                >
                  <IconX className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Country Filter Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-3 px-3 sm:mx-0 sm:px-0">
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <IconFilter className="h-3 w-3 text-gold" /> Filter:
              </span>

              <button
                onClick={() => handleCountrySelect("all")}
                className={`rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                  selectedCountry === "all"
                    ? "bg-navy text-gold shadow-md"
                    : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                }`}
              >
                All Countries
              </button>

              {(Array.isArray(countries) ? countries : []).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCountrySelect(c.slug)}
                  className={`rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                    selectedCountry === c.slug
                      ? "bg-navy text-gold shadow-md"
                      : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Packages Grid: 2 columns on Mobile, 3 columns on Desktop */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Results Header Info */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-navy tracking-tight">
              {selectedCountry !== "all"
                ? `${selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1)} Packages`
                : "Tour Packages"}
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">
              Showing {packages.length} of {pagination.total} luxury experiences
            </p>
          </div>

          {(selectedCountry !== "all" || debouncedSearch) && (
            <button
              onClick={() => {
                setSelectedCountry("all");
                setSearchQuery("");
                setDebouncedSearch("");
                setCurrentPage(1);
                updateUrl({ page: 1, country: "all", search: "" });
              }}
              className="text-[11px] sm:text-xs font-bold text-gold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Reset <IconX className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* 2-Column Mobile Grid: grid-cols-2 lg:grid-cols-3 */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 text-center space-y-4 shadow-sm max-w-md mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <IconPackage className="h-7 w-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-navy">No Packages Found</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              No matching tour packages were found. Try searching for a different keyword or resetting filters.
            </p>
            <Button
              variant="gold"
              onClick={() => {
                setSelectedCountry("all");
                setSearchQuery("");
                setDebouncedSearch("");
                setCurrentPage(1);
                updateUrl({ page: 1, country: "all", search: "" });
              }}
              className="rounded-xl px-5 py-2.5 text-xs font-bold cursor-pointer"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            ))}
          </div>
        )}

        {/* Pagination Bar (20 per page) */}
        {pagination.pages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-10 sm:pt-16">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-white border border-gray-200 text-navy font-bold shadow-xs hover:bg-gold hover:border-gold disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              title="Previous Page"
            >
              <IconChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {Array.from({ length: pagination.pages }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                    currentPage === p
                      ? "bg-navy text-gold shadow-md"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gold/20"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              className="flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-white border border-gray-200 text-navy font-bold shadow-xs hover:bg-gold hover:border-gold disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              title="Next Page"
            >
              <IconChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        )}

      </section>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <div className="bg-slate-50/50 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative bg-[#060C17] text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0B1426]/90 to-black/80 z-10" />
        <div className="absolute top-10 right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />

        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-black text-gold uppercase tracking-wider mb-4 border border-gold/30">
            <IconPackage className="h-4 w-4 text-gold" />
            Curated European Experiences
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Tour <span className="text-gold">Packages</span>
          </h1>
          <p className="mt-3 text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Hand-picked luxury chauffeured tour itineraries across Europe, designed for uncompromised comfort, scenic beauty, and memorable journeys.
          </p>
        </div>
      </section>

      {/* Main Filtered & Paginated Content */}
      <Suspense fallback={<div className="text-center py-16 text-gray-500 font-bold">Loading Packages...</div>}>
        <PackagesContent />
      </Suspense>
    </div>
  );
}
