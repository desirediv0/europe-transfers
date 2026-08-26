"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { IconPackage, IconFilter, IconMapPin, IconUsers } from "@tabler/icons-react";
import { api } from "@/lib/api";
import type { Country } from "@/lib/types";
import { HeroSearchBar } from "@/components/HeroSearchBar";
import { DropdownPickerField, DatePickerField, StepperField } from "@/components/SearchFields";

function PackagesSearchContent() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [barCountrySlug, setBarCountrySlug] = useState("");
  const [barDate, setBarDate] = useState<Date | null>(null);
  const [barTravelers, setBarTravelers] = useState(2);

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
    if (barCountrySlug) params.set("country", barCountrySlug);
    if (barDate) params.set("date", barDate.toISOString().split("T")[0]);
    params.set("travelers", String(barTravelers));
    const qs = params.toString();
    router.push(`/packages/results${qs ? `?${qs}` : ""}`);
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

          {/* Hero Search Bar */}
          <div className="mt-8">
            <HeroSearchBar
              fieldCount={3}
              onSubmit={handleSearch}
              fields={
                <>
                  <DropdownPickerField
                    label="Destination"
                    icon={IconMapPin}
                    value={barCountrySlug}
                    placeholder="Any destination"
                    options={countries.map((c) => ({ id: c.slug, label: c.name }))}
                    onChange={(id) => { setBarCountrySlug(id); setSelectedCountry(id); }}
                  />
                  <DatePickerField label="Travel date" date={barDate} onChange={setBarDate} />
                  <StepperField
                    label="Travelers"
                    icon={IconUsers}
                    value={barTravelers}
                    onChange={setBarTravelers}
                    unitLabel={(n) => (n === 1 ? "traveler" : "travelers")}
                    divider={false}
                  />
                </>
              }
            />
          </div>

          {/* Country Filter Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-400 font-bold mr-1 flex items-center gap-1">
              <IconFilter className="h-3.5 w-3.5 text-gold" /> Country:
            </span>
            <button
              onClick={() => { setSelectedCountry("all"); setBarCountrySlug(""); }}
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
                onClick={() => { setSelectedCountry(c.slug); setBarCountrySlug(c.slug); }}
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
