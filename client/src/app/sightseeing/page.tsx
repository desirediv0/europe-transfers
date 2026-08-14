"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import {
  IconSearch,
  IconMapPin,
  IconClock,
  IconArrowRight,
  IconTicket,
  IconSparkles,
  IconStar,
  IconShieldCheck,
  IconFilter,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";

export interface SightseeingTour {
  id: string;
  title: string;
  slug: string;
  cityName?: string;
  countryName?: string;
  duration: string;
  priceFrom: number | string;
  coverImage?: string;
  summary?: string;
  highlights?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const CITIES = ["ALL", "Paris", "Rome", "Tuscany", "Switzerland"];
const LIMIT = 20;

function SightseeingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read URL params
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialCity = searchParams.get("city") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const [tours, setTours] = useState<SightseeingTour[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: initialPage, limit: LIMIT, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Sync state from URL changes (back/forward navigation)
  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get("page") || "1", 10));
    setSelectedCity(searchParams.get("city") || "ALL");
    const s = searchParams.get("search") || "";
    setSearchQuery(s);
    setDebouncedSearch(s);
  }, [searchParams]);

  // URL update helper
  const updateUrl = useCallback(
    (newParams: { page?: number; city?: string; search?: string }) => {
      const params = new URLSearchParams();

      const page = newParams.page !== undefined ? newParams.page : currentPage;
      const city = newParams.city !== undefined ? newParams.city : selectedCity;
      const search = newParams.search !== undefined ? newParams.search : debouncedSearch;

      if (page > 1) params.set("page", page.toString());
      if (city && city !== "ALL") params.set("city", city);
      if (search.trim()) params.set("search", search.trim());

      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    },
    [currentPage, selectedCity, debouncedSearch, pathname, router]
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

  // Fetch tours from API
  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("limit", LIMIT.toString());
        if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
        if (selectedCity && selectedCity !== "ALL") params.set("city", selectedCity);

        const data = await api.get<{ items: SightseeingTour[]; pagination: PaginationInfo }>(
          `/sightseeing?${params.toString()}`
        );

        if (data && data.items) {
          setTours(data.items);
          setPagination(data.pagination);
        } else if (Array.isArray(data)) {
          // fallback: old API returns array
          setTours(data as unknown as SightseeingTour[]);
          setPagination({ page: 1, limit: LIMIT, total: (data as unknown as SightseeingTour[]).length, pages: 1 });
        }
      } catch (err) {
        console.error("Failed to load sightseeing tours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [currentPage, debouncedSearch, selectedCity]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCurrentPage(1);
    updateUrl({ city, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
    updateUrl({ search: "", page: 1 });
  };

  // Build page numbers to show (max 5 around current)
  const getPageNumbers = () => {
    const total = pagination.pages;
    const cur = pagination.page;
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) {
      range.push(i);
    }
    if (range[0] > 1) {
      if (range[0] > 2) range.unshift(-1); // ellipsis
      range.unshift(1);
    }
    if (range[range.length - 1] < total) {
      if (range[range.length - 1] < total - 1) range.push(-1); // ellipsis
      range.push(total);
    }
    return range;
  };

  return (
    <div className="bg-slate-50/60 min-h-screen font-sans">

      {/* Hero Section */}
      <section className="relative bg-[#060C17] text-white overflow-hidden py-14 sm:py-24 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-[#060C17] via-[#060C17]/80 to-transparent z-10" />
        <img
          src="/images/hero_swiss_alps.png"
          alt="European Sightseeing Tours"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="rounded-full bg-gold/20 text-gold border border-gold/30 px-4 py-1 text-xs font-black uppercase tracking-wider mb-4">
            <IconSparkles className="mr-1.5 h-3.5 w-3.5 inline" />
            Curated European Sightseeing & Cruises
          </Badge>

          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Travel moments you&apos;ll love
          </h1>
          <p className="mt-3 text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto font-normal">
            Partnered with leading travel & tour experiences across Paris, France, Rome & Switzerland.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-2 pl-3 flex-1 text-gray-400">
              <IconSearch className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search tours… Eiffel Tower, Seine Cruise, Versailles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 text-navy font-semibold text-xs sm:text-sm placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="p-1 hover:text-red-500 transition-colors flex-shrink-0">
                  <IconX className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={() => updateUrl({ search: searchQuery, page: 1 })}
              variant="gold"
              className="rounded-xl px-5 py-2.5 font-extrabold text-xs text-navy shadow-md flex-shrink-0"
            >
              Search
            </Button>
          </div>

          {/* City Filter Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-400 font-bold mr-1 flex items-center gap-1">
              <IconFilter className="h-3.5 w-3.5 text-gold" /> City:
            </span>
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                  selectedCity === city
                    ? "bg-gold text-navy shadow-md"
                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Section header with result count */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-navy tracking-tight">
              {debouncedSearch
                ? `Results for "${debouncedSearch}"`
                : selectedCity !== "ALL"
                ? `${selectedCity} Activities`
                : "Top Sightseeing Tours & Activities"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Skip-the-line tickets, guided tours, dinner cruises & day trips
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!loading && (
              <Badge className="bg-navy text-gold font-extrabold text-xs px-3 py-1">
                {pagination.total} {pagination.total === 1 ? "Experience" : "Experiences"}
              </Badge>
            )}
            {(debouncedSearch || selectedCity !== "ALL") && (
              <button
                onClick={() => { setSearchQuery(""); setDebouncedSearch(""); setSelectedCity("ALL"); updateUrl({ search: "", city: "ALL", page: 1 }); }}
                className="text-xs text-gray-500 hover:text-red-500 font-semibold flex items-center gap-1 transition-colors"
              >
                <IconX className="h-3.5 w-3.5" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
            <IconTicket className="h-12 w-12 text-gold mx-auto mb-3" />
            <h3 className="text-lg font-black text-navy">No activities found</h3>
            <p className="text-xs text-gray-500 mt-1">Try a different search or select &quot;ALL&quot; cities.</p>
            <Button onClick={() => { clearSearch(); handleCitySelect("ALL"); }} className="mt-4 bg-navy text-white text-xs font-bold px-6 py-2.5 rounded-xl">
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tours.map((tour) => (
              <Card
                key={tour.id}
                className="group border border-gray-200/80 bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={tour.coverImage || "/images/hero_swiss_alps.png"}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge className="rounded-full bg-[#060C17]/90 text-gold border border-gold/30 backdrop-blur-md text-[10px] font-extrabold px-2.5">
                      <IconMapPin className="mr-1 h-3 w-3" />
                      {tour.cityName || "Europe"}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge className="rounded-full bg-white/90 text-navy backdrop-blur-md text-[10px] font-bold px-2 py-0.5 shadow-sm">
                      <IconClock className="mr-1 h-3 w-3 text-gold" />
                      {tour.duration}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-navy leading-snug line-clamp-2 group-hover:text-gold transition-colors">
                      {tour.title}
                    </h3>
                    {tour.summary && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed font-normal">
                        {tour.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Starting from</span>
                      <span className="text-lg font-black text-navy">{Number(tour.priceFrom).toFixed(2)} €</span>
                    </div>
                    <Link href={`/sightseeing/${tour.slug}`}>
                      <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-navy group-hover:bg-gold group-hover:text-navy transition-all shadow-sm cursor-pointer">
                        <IconArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && pagination.pages > 1 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: info */}
            <p className="text-xs text-gray-500 font-medium">
              Showing{" "}
              <span className="font-bold text-navy">
                {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-bold text-navy">{pagination.total}</span> activities
            </p>

            {/* Right: page buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-navy hover:border-gold/60 hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <IconChevronLeft className="h-4 w-4" />
              </button>

              {getPageNumbers().map((num, i) =>
                num === -1 ? (
                  <span key={`ellipsis-${i}`} className="flex h-9 w-6 items-center justify-center text-xs text-gray-400 font-bold">
                    …
                  </span>
                ) : (
                  <button
                    key={num}
                    onClick={() => handlePageChange(num)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold transition-all shadow-sm border ${
                      num === pagination.page
                        ? "bg-navy text-white border-navy shadow-navy/20"
                        : "border-gray-200 bg-white text-navy hover:border-gold/60 hover:bg-gold/10"
                    }`}
                  >
                    {num}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-navy hover:border-gold/60 hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <IconChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Trust & Features Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-[#060C17] text-white rounded-3xl p-6 sm:p-12 border border-gold/30 shadow-2xl relative overflow-hidden grid gap-6 grid-cols-1 sm:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold flex-shrink-0">
              <IconShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-base text-white">Instant Ticket Guarantee</h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">Official partner access with instant digital booking voucher.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold flex-shrink-0">
              <IconStar className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-base text-white">Handpicked Experiences</h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">Top-rated Seine dinner cruises, Eiffel Tower summit & Tuscan tours.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold flex-shrink-0">
              <IconSparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-base text-white">24/7 VIP Assistance</h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">Dedicated concierge travel team to assist your tour itinerary.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SightseeingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy font-semibold text-sm">Loading sightseeing experiences...</p>
        </div>
      </div>
    }>
      <SightseeingContent />
    </Suspense>
  );
}
