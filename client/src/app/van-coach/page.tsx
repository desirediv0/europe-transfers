"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Location } from "@/lib/types";
import {
  IconClock,
  IconMapPin,
  IconCalendar,
  IconChevronDown,
  IconCircleCheck,
  IconLoader2,
  IconSearch,
} from "@tabler/icons-react";

function LocationPicker({
  value,
  name,
  placeholder,
  locations,
  onChange,
}: {
  value: string;
  name: string;
  placeholder: string;
  locations: Location[];
  onChange: (id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = locations.find((l) => l.id === value || l.name === value);

  const filtered = locations.filter((l) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q);
  });

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-navy shadow-sm transition-colors hover:border-gold/50 focus:outline-none"
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <IconMapPin className="h-4 w-4 shrink-0 text-gold" />
              <span className="truncate font-bold">{selected.name}</span>
              <span className="text-gray-400 font-medium">({selected.city})</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-gray-400 font-medium">
              <IconMapPin className="h-4 w-4 shrink-0 text-gold" />
              {value || placeholder}
            </span>
          )}
          <IconChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] z-50 bg-white shadow-2xl rounded-2xl border border-gray-100" align="start" side="bottom" sideOffset={4}>
        <div className="max-h-80 overflow-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${name}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 py-1 text-xs font-medium focus:outline-none focus:border-gold"
                autoFocus
              />
            </div>
          </div>
          <div className="p-1.5">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">No location found.</div>
            ) : (
              filtered.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onChange(loc.id, loc.name);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-start rounded-lg px-3 py-2.5 text-xs text-left transition-colors hover:bg-slate-100 ${value === loc.id || value === loc.name ? "bg-slate-100 font-bold" : ""}`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-navy">{loc.name}</span>
                    <span className="text-[10px] text-gray-400">{loc.city}</span>
                  </div>
                  {(value === loc.id || value === loc.name) && <IconCircleCheck className="ml-auto h-4 w-4 text-gold" />}
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const PROCESS_STEPS = [
  { step: "01", title: "Search Engine", desc: "Select city & disposal hours", icon: IconClock },
  { step: "02", title: "Products", desc: "Choose Mercedes S-Class or V-Class", icon: IconClock },
  { step: "03", title: "Product Detail", desc: "View included km, driver & specs", icon: IconClock },
  { step: "04", title: "Registration Form", desc: "Enter trip itinerary & passenger info", icon: IconClock },
  { step: "05", title: "Email Team Contact", desc: "Direct dispatch to concierge team", icon: IconClock },
];

function VanCoachSearchContent() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedLocationName, setSelectedLocationName] = useState("Milan, Italy");
  const [hours, setHours] = useState("8");
  const [pickupDate, setPickupDate] = useState<Date | null>(new Date());
  const [pickupTime, setPickupTime] = useState("09:00 AM");
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    api.get<Location[]>("/search/locations").then(setLocations).catch(() => { });
  }, []);

  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hr = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      const min = m.toString().padStart(2, "0");
      const hrStr = hr.toString().padStart(2, "0");
      times.push(`${hrStr}:${min} ${ampm}`);
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLocationId) params.set("locationId", selectedLocationId);
    if (selectedLocationName) params.set("location", selectedLocationName);
    params.set("hours", hours);
    if (pickupDate) params.set("date", format(pickupDate, "yyyy-MM-dd"));
    params.set("time", pickupTime);
    router.push(`/van-coach/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Banner */}
      <section className="relative bg-[#060C17] text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0B1426]/90 to-black/80 z-10" />
        <div className="absolute top-10 right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-black text-gold uppercase tracking-wider mb-6 border border-gold/30">
            <IconClock className="h-4 w-4 text-gold" />
            Flexible Hourly Service
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Vehicle at <span className="text-gold">Disposal</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Hire a private Mercedes-Benz vehicle with dedicated English-speaking chauffeur by the hour for business roadshows, shopping, or custom European itineraries.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="bg-white border-b border-gray-200/80 py-8 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {PROCESS_STEPS.map((s) => (
              <div key={s.step} className="p-4 rounded-2xl bg-slate-50 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gold uppercase tracking-widest">{s.step}</span>
                  <s.icon className="h-4 w-4 text-navy" />
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-navy leading-snug">{s.title}</h4>
                <p className="text-[10px] text-gray-500 font-medium leading-tight">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Card className="border-gray-200/80 bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-bold tracking-widest text-gold uppercase">Step 01: Search Engine</span>
            <h2 className="text-2xl font-black text-navy mt-1">Configure Hourly Disposal</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase">
                <IconMapPin className="h-3.5 w-3.5 text-gold" /> Service Location
              </Label>
              <LocationPicker
                value={selectedLocationName}
                name="city"
                placeholder="e.g. Milan, Zurich, Paris"
                locations={locations}
                onChange={(id, name) => { setSelectedLocationId(id); setSelectedLocationName(name); }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase">
                <IconClock className="h-3.5 w-3.5 text-gold" /> Duration
              </Label>
              <Select value={hours} onValueChange={setHours}>
                <SelectTrigger className="h-12 rounded-xl bg-white px-3.5 text-xs font-bold text-navy border-gray-200">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
                  <SelectItem value="4">4 Hours Half-Day</SelectItem>
                  <SelectItem value="8">8 Hours Full-Day</SelectItem>
                  <SelectItem value="12">12 Hours Grand Day</SelectItem>
                  <SelectItem value="24">24 Hours Multi-Day Charter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase">
                <IconCalendar className="h-3.5 w-3.5 text-gold" /> Date
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-12 justify-start text-left font-normal rounded-xl bg-white px-3.5 text-xs font-semibold text-navy border-gray-200">
                    <IconCalendar className="mr-2 h-4 w-4 text-gold shrink-0" />
                    <span className="truncate">{pickupDate ? format(pickupDate, "dd MMM yyyy") : "Pick date"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] sm:w-[320px] p-0 z-50 rounded-2xl bg-white shadow-2xl border border-gray-100" align="start" side="bottom" sideOffset={4}>
                  <Calendar
                    mode="single"
                    selected={pickupDate || undefined}
                    onSelect={(d) => { if (d) { setPickupDate(d); setCalendarOpen(false); } }}
                    disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase">
                <IconClock className="h-3.5 w-3.5 text-gold" /> Time
              </Label>
              <Select value={pickupTime} onValueChange={setPickupTime}>
                <SelectTrigger className="h-12 rounded-xl bg-white px-3.5 text-xs font-bold text-navy border-gray-200">
                  <IconClock className="mr-2 h-4 w-4 text-gold shrink-0" />
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-60 z-50 bg-white">
                  {times.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleSearch} className="w-full sm:w-auto h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer px-8">
              <IconSearch className="h-4 w-4 mr-2" /> Search Vehicles
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default function VehicleAtDisposalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><IconLoader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <VanCoachSearchContent />
    </Suspense>
  );
}
