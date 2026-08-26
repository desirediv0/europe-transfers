"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  IconSparkles,
  IconShieldCheck,
  IconStar,
  IconFilter,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";
import { api } from "@/lib/api";
import { HeroSearchBar } from "@/components/HeroSearchBar";
import { DropdownPickerField, DatePickerField, StepperField } from "@/components/SearchFields";

interface SightseeingTourSummary {
  id: string;
  cityName?: string;
}

function SightseeingSearchContent() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [cities, setCities] = useState<string[]>([]);
  const [barCity, setBarCity] = useState("");
  const [barDate, setBarDate] = useState<Date | null>(null);
  const [barTravelers, setBarTravelers] = useState(2);

  useEffect(() => {
    api
      .get<{ items: SightseeingTourSummary[] }>("/sightseeing?limit=100")
      .then((res) => {
        const names = Array.from(
          new Set((res.items || []).map((t) => t.cityName).filter((c): c is string => Boolean(c)))
        ).sort();
        setCities(names);
      })
      .catch(() => setCities([]));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (barCity) params.set("city", barCity);
    if (barDate) params.set("date", barDate.toISOString().split("T")[0]);
    params.set("pax", String(barTravelers));
    const qs = params.toString();
    router.push(`/sightseeing/results${qs ? `?${qs}` : ""}`);
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

          {/* Hero Search Bar */}
          <div className="mt-8">
            <HeroSearchBar
              fieldCount={3}
              onSubmit={handleSearch}
              fields={
                <>
                  <DropdownPickerField
                    label="City"
                    icon={IconMapPin}
                    value={barCity}
                    placeholder="Any city"
                    options={cities.map((c) => ({ id: c, label: c }))}
                    onChange={(_id, label) => { setBarCity(label); setSelectedCity(label); }}
                  />
                  <DatePickerField label="Activity date" date={barDate} onChange={setBarDate} />
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

          {/* City Filter Pills */}
          {cities.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-gray-400 font-bold mr-1 flex items-center gap-1">
                <IconFilter className="h-3.5 w-3.5 text-gold" /> City:
              </span>
              <button
                onClick={() => { setSelectedCity("ALL"); setBarCity(""); }}
                className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                  selectedCity === "ALL"
                    ? "bg-gold text-navy shadow-md"
                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
                }`}
              >
                All
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => { setSelectedCity(city); setBarCity(city); }}
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
          )}
        </div>
      </section>

      {/* Trust & Features Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
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
          <p className="text-navy font-semibold text-sm">Loading...</p>
        </div>
      </div>
    }>
      <SightseeingSearchContent />
    </Suspense>
  );
}
