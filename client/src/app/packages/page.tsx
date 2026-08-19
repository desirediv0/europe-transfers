"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { IconPackage, IconSearch, IconFilter, IconX } from "@tabler/icons-react";
import { api } from "@/lib/api";
import type { Country } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function PackagesSearchContent() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");

  useEffect(() => {
    api.get<{ items: Country[] }>("/countries?limit=100")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setCountries(list);
      })
      .catch(() => setCountries([]));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCountry !== "all") params.set("country", selectedCountry);
    const qs = params.toString();
    router.push(`/packages/results${qs ? `?${qs}` : ""}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

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

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-2 pl-3 flex-1 text-gray-400">
              <IconSearch className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search packages... Italy, Switzerland, France..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-0 shadow-none focus-visible:ring-0 text-navy font-semibold text-xs sm:text-sm placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="p-1 hover:text-red-500 transition-colors flex-shrink-0">
                  <IconX className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              variant="gold"
              className="rounded-xl px-5 py-2.5 font-extrabold text-xs text-navy shadow-md flex-shrink-0 cursor-pointer"
            >
              Search
            </Button>
          </div>

          {/* Country Filter Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-400 font-bold mr-1 flex items-center gap-1">
              <IconFilter className="h-3.5 w-3.5 text-gold" /> Country:
            </span>
            <button
              onClick={() => setSelectedCountry("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                selectedCountry === "all"
                  ? "bg-gold text-navy shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
              }`}
            >
              All
            </button>
            {(Array.isArray(countries) ? countries : []).map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCountry(c.slug)}
                className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                  selectedCountry === c.slug
                    ? "bg-gold text-navy shadow-md"
                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-500 font-bold">Loading...</div>}>
      <PackagesSearchContent />
    </Suspense>
  );
}
