"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";
import {
  IconCar,
  IconClock,
  IconMapPin,
  IconCalendar,
  IconUsers,
  IconSearch,
  IconLoader2,
  IconX,
  IconArrowLeft,
  IconFilter,
} from "@tabler/icons-react";

interface VanCoachRoutePrice {
  id: string;
  group: "AIRPORT_TRANSFER" | "POINT_TO_POINT" | "TOUR_PACKAGE";
  label: string;
  price: number;
}

interface VanCoachVehicle {
  id: string;
  name: string;
  category: string | null;
  seats: number;
  image: string | null;
  description: string | null;
  rate8h: number;
  rate10h: number;
  overtimeRate: number;
  currency: string;
  routePrices: VanCoachRoutePrice[];
}

interface DisposalVehicle {
  id: string;
  name: string;
  category: string;
  seats: number;
  hourlyRate: number;
  image: string | null;
  description: string;
}

function mapToDisposalVehicle(v: VanCoachVehicle): DisposalVehicle {
  return {
    id: v.id,
    name: v.name,
    category: v.category || "Van & Coach",
    seats: v.seats,
    hourlyRate: Math.round((Number(v.rate8h) / 8) * 100) / 100,
    image: v.image || null,
    description: v.description || `${v.name} available for hourly disposal with dedicated English-speaking chauffeur.`,
  };
}

function ResultsContent() {
  const { format: formatCurrency } = useCurrency();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [fleet, setFleet] = useState<DisposalVehicle[]>([]);
  const selectedLocationName = searchParams.get("location") || "Europe";
  const [vehicleSearch, setVehicleSearch] = useState(searchParams.get("search") || "");
  const hours = searchParams.get("hours") || "8";
  const pickupDateParam = searchParams.get("date");
  const pickupDate = pickupDateParam ? new Date(pickupDateParam) : new Date();

  useEffect(() => {
    api.get<VanCoachVehicle[]>("/van-coach/all")
      .then((vehicles) => setFleet(vehicles.map(mapToDisposalVehicle)))
      .catch(() => { });
  }, []);

  const updateUrl = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    router.push(`/van-coach/results?${params.toString()}`);
  }, [searchParams, router]);

  const numericHours = Number(hours) || 8;

  const filteredFleet = fleet.filter((v) => {
    // Location filter: vehicle names carry the city as a prefix
    // (e.g. "Barcelona - Standard Sedan"); the 4 original Japan
    // vehicles (Alphard, Hiace, V-Class, S-Class) have no city
    // prefix and match every location so they still show up.
    if (selectedLocationName && selectedLocationName !== "Europe") {
      const loc = selectedLocationName.toLowerCase();
      const nameLower = v.name.toLowerCase();
      const hasCityPrefix = nameLower.includes(" - ");
      if (hasCityPrefix && !nameLower.startsWith(loc)) return false;
    }
    if (!vehicleSearch.trim()) return true;
    const q = vehicleSearch.toLowerCase();
    return v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || v.description.toLowerCase().includes(q);
  });

  const hasActiveFilters = vehicleSearch.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Top Bar */}
      <section className="bg-white border-b border-gray-200/80 sticky top-16 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Link href="/van-coach" className="inline-flex items-center gap-2 text-xs font-bold text-navy hover:text-gold transition-colors">
              <IconArrowLeft className="h-4 w-4" /> Back to Vehicle at Disposal
            </Link>

            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="rounded-full bg-slate-100 text-navy text-[10px] font-bold px-2.5 py-0.5">
                <IconMapPin className="h-3 w-3 text-gold mr-1 inline" /> {selectedLocationName}
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-slate-100 text-navy text-[10px] font-bold px-2.5 py-0.5">
                <IconClock className="h-3 w-3 text-gold mr-1 inline" /> {hours}h
              </Badge>
              {pickupDate && (
                <Badge variant="secondary" className="rounded-full bg-slate-100 text-navy text-[10px] font-bold px-2.5 py-0.5">
                  <IconCalendar className="h-3 w-3 text-gold mr-1 inline" /> {format(pickupDate, "dd MMM")}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Search + Filters */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-4 p-3 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black text-gold uppercase tracking-widest flex items-center gap-1.5">
                <IconFilter className="h-3 w-3" /> Active Filters
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy text-white text-[10px] font-bold pl-2.5 pr-1.5 py-1">
                &quot;{vehicleSearch}&quot;
                <button
                  type="button"
                  onClick={() => { setVehicleSearch(""); updateUrl(""); }}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setVehicleSearch(""); updateUrl(""); }}
              className="text-[10px] font-bold text-navy border-gray-200 rounded-lg px-3 py-1.5 h-auto cursor-pointer hover:bg-slate-50">
              <IconX className="h-3 w-3 mr-1" /> Clear All
            </Button>
          </div>
        )}

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search vehicles... e.g. Mercedes, S-Class, Van"
              value={vehicleSearch}
              onChange={(e) => { setVehicleSearch(e.target.value); updateUrl(e.target.value); }}
              className="flex h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-9 py-2 text-xs font-semibold text-navy shadow-sm focus:outline-none focus:border-gold transition-colors"
            />
            {vehicleSearch && (
              <button onClick={() => { setVehicleSearch(""); updateUrl(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors cursor-pointer">
                <IconX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-500">
            Showing <span className="text-navy">{filteredFleet.length}</span> of <span className="text-navy">{fleet.length}</span> vehicles
          </p>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {filteredFleet.map((v) => {
            const totalPrice = v.hourlyRate * numericHours;
            const detailParams = new URLSearchParams();
            detailParams.set("location", selectedLocationName);
            detailParams.set("hours", hours);
            return (
              <Link key={v.id} href={`/van-coach/${v.id}?${detailParams.toString()}`}>
                <Card className="group overflow-hidden rounded-2xl sm:rounded-3xl border-gray-200/80 bg-white transition-all duration-300 hover:shadow-xl hover:border-gold/40 flex flex-col justify-between cursor-pointer h-full">
                  <CardContent className="p-0">
                    <div className="relative h-28 sm:h-48 bg-slate-100 overflow-hidden">
                      {v.image ? (
                        <img src={v.image} alt={v.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-200 text-slate-400">
                          <IconCar className="h-6 w-6 sm:h-8 sm:w-8" />
                          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="rounded-full bg-navy/90 text-gold border-0 px-2 py-0.5 text-[9px] sm:text-xs font-black shadow-sm">{formatCurrency(v.hourlyRate)}/hr</Badge>
                      </div>
                    </div>
                    <div className="p-3 sm:p-5 space-y-1.5 sm:space-y-3">
                      <div>
                        <p className="text-[8px] sm:text-[10px] font-black text-gold uppercase tracking-wider truncate">{v.category}</p>
                        <h3 className="text-xs sm:text-base font-black text-navy truncate leading-tight">{v.name}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-gray-500">
                        <span className="flex items-center gap-0.5"><IconUsers className="h-3 w-3 text-gold shrink-0" /> {v.seats} Seats</span>
                      </div>
                      <p className="hidden sm:block text-xs text-gray-500 line-clamp-2">{v.description}</p>
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-[8px] sm:text-[10px] font-bold text-gray-400">Total ({numericHours}h)</span>
                        <p className="text-xs sm:text-lg font-black text-navy">{formatCurrency(totalPrice)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          {filteredFleet.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
              <IconCar className="h-12 w-12 text-gold mx-auto mb-3" />
              <h3 className="text-lg font-black text-navy">No vehicles found</h3>
              <p className="text-xs text-gray-500 mt-1">Try a different search term or clear the search.</p>
              <Button onClick={() => { setVehicleSearch(""); updateUrl(""); }} className="mt-4 bg-navy text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer">
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function VanCoachResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><IconLoader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <ResultsContent />
    </Suspense>
  );
}
