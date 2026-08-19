"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Location } from "@/lib/types";
import {
  IconCar,
  IconClock,
  IconMapPin,
  IconCalendar,
  IconUsers,
  IconShieldCheck,
  IconSend,
  IconPhoneCall,
  IconBrandWhatsapp,
  IconMail,
  IconUser,
  IconInfoCircle,
  IconRoad,
  IconSearch,
  IconChevronDown,
  IconCircleCheck,
  IconLoader2,
  IconChecklist,
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
  minHours: number;
  includedKmPerHour: number;
  extraKmRate: number;
  image: string;
  features: string[];
  description: string;
}

function mapToDisposalVehicle(v: VanCoachVehicle): DisposalVehicle {
  return {
    id: v.id,
    name: v.name,
    category: v.category || "Van & Coach",
    seats: v.seats,
    hourlyRate: Math.round((Number(v.rate8h) / 8) * 100) / 100,
    minHours: 4,
    includedKmPerHour: 25,
    extraKmRate: Number(v.overtimeRate) || 0,
    image: v.image || "/images/about_luxury_chauffeur.png",
    features: ["Air Conditioning", "Professional Chauffeur", "Free Waiting Time", "Meet & Greet"],
    description: v.description || `${v.name} available for hourly disposal with dedicated English-speaking chauffeur.`,
  };
}

const PROCESS_STEPS = [
  { step: "01", title: "Search Engine", desc: "Select city & disposal hours", icon: IconClock },
  { step: "02", title: "Products", desc: "Choose Mercedes S-Class or V-Class", icon: IconCar },
  { step: "03", title: "Product Detail", desc: "View included km, driver & specs", icon: IconInfoCircle },
  { step: "04", title: "Registration Form", desc: "Enter trip itinerary & passenger info", icon: IconChecklist },
  { step: "05", title: "Email Team Contact", desc: "Direct dispatch to concierge team", icon: IconMail },
];

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
                  className={`flex w-full items-start rounded-lg px-3 py-2.5 text-xs text-left transition-colors hover:bg-slate-100 ${value === loc.id || value === loc.name ? "bg-slate-100 font-bold" : ""
                    }`}
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

export default function VehicleAtDisposalPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><IconLoader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <VehicleAtDisposalPage />
    </Suspense>
  );
}

function VehicleAtDisposalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [fleet, setFleet] = useState<DisposalVehicle[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedLocationName, setSelectedLocationName] = useState("Milan, Italy");
  const vehicleSearchFromURL = searchParams.get("search") || "";
  const [vehicleSearch, setVehicleSearch] = useState(vehicleSearchFromURL);

  const [hours, setHours] = useState("8");
  const [pickupDate, setPickupDate] = useState<Date | null>(new Date());
  const [pickupTime, setPickupTime] = useState("09:00 AM");

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<DisposalVehicle | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pickupAddress: "",
    itineraryNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    api.get<Location[]>("/search/locations").then(setLocations).catch(() => { });
    api
      .get<VanCoachVehicle[]>("/van-coach/all")
      .then((vehicles) => setFleet(vehicles.map(mapToDisposalVehicle)))
      .catch(() => { });
  }, []);

  const updateURLSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const hasActiveFilters = vehicleSearch.trim().length > 0;

  // Time slots (Formatted as "09:00 AM", "09:30 AM", etc.)
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

  const numericHours = Number(hours) || 8;

  const handleOpenDetail = (v: DisposalVehicle) => {
    setSelectedVehicle(v);
    setDetailModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      toast.error("Please select a vehicle from the disposal list");
      return;
    }
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please enter your name, email, and phone number");
      return;
    }

    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 1000));
    setSubmitting(false);
    setDetailModalOpen(false);
    setSuccessDialogOpen(true);
    toast.success("Enquiry sent to Europe Transfers Concierge Team!");
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

      {/* Process Flow Steps Bar (01 Search Engine -> 02 Products -> 03 Detail -> 04 Registration -> 05 Email Team) */}
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

      {/* Step 01: Hourly Search Engine (Matching TransferSearchWidget Popovers & Pickers) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Card className="border-gray-200/80 bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-bold tracking-widest text-gold uppercase">Step 01: Search Engine</span>
            <h2 className="text-2xl font-black text-navy mt-1">Configure Hourly Disposal</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Location Picker Popover */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase">
                <IconMapPin className="h-3.5 w-3.5 text-gold" /> Service Location
              </Label>
              <LocationPicker
                value={selectedLocationName}
                name="city"
                placeholder="e.g. Milan, Zurich, Paris"
                locations={locations}
                onChange={(id, name) => {
                  setSelectedLocationId(id);
                  setSelectedLocationName(name);
                }}
              />
            </div>

            {/* Disposal Hours Select */}
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

            {/* Date Picker Popover */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase">
                <IconCalendar className="h-3.5 w-3.5 text-gold" /> Date
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-12 justify-start text-left font-normal rounded-xl bg-white px-3.5 text-xs font-semibold text-navy border-gray-200">
                    <IconCalendar className="mr-2 h-4 w-4 text-gold shrink-0" />
                    <span className="truncate">
                      {pickupDate ? format(pickupDate, "dd MMM yyyy") : "Pick date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] sm:w-[320px] p-0 z-50 rounded-2xl bg-white shadow-2xl border border-gray-100" align="start" side="bottom" sideOffset={4}>
                  <Calendar
                    mode="single"
                    selected={pickupDate || undefined}
                    onSelect={(d) => {
                      if (d) {
                        setPickupDate(d);
                        setCalendarOpen(false);
                      }
                    }}
                    disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker Select */}
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
        </Card>
      </section>

      {/* Step 02: Products / Disposal Fleet List */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-widest text-gold uppercase">Step 02: Products</span>
          <h2 className="text-2xl sm:text-4xl font-black text-navy mt-1">Select Disposal Vehicle</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto mt-1">
            Rates include dedicated English-speaking chauffeur, fuel, city permits & tolls.
          </p>
        </div>

        {/* Search bar with back/clear */}
        <div className="max-w-2xl mx-auto mb-6">
          {hasActiveFilters && (
            <div className="flex items-center justify-between mb-4 p-3 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-black text-gold uppercase tracking-widest flex items-center gap-1.5">
                  <IconFilter className="h-3 w-3" /> Active Filters
                </span>
                <Badge variant="secondary" className="rounded-full bg-navy text-white text-[10px] font-bold px-2.5 py-0.5">
                  Search: "{vehicleSearch}"
                  <button
                    onClick={() => { setVehicleSearch(""); updateURLSearch(""); }}
                    className="ml-1.5 text-white/60 hover:text-white"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setVehicleSearch(""); updateURLSearch(""); }}
                className="text-[10px] font-bold text-navy border-gray-200 rounded-lg px-3 py-1.5 h-auto cursor-pointer hover:bg-slate-50"
              >
                <IconX className="h-3 w-3 mr-1" /> Clear All
              </Button>
            </div>
          )}
          <div className="relative">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search vehicles... e.g. Mercedes, S-Class, Van"
              value={vehicleSearch}
              onChange={(e) => {
                setVehicleSearch(e.target.value);
                updateURLSearch(e.target.value);
              }}
              className="flex h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-9 py-2 text-xs font-semibold text-navy shadow-sm focus:outline-none focus:border-gold transition-colors"
            />
            {vehicleSearch && (
              <button
                onClick={() => { setVehicleSearch(""); updateURLSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors cursor-pointer"
              >
                <IconX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-500">
            Showing <span className="text-navy">{fleet.filter((v) => {
              if (!vehicleSearch.trim()) return true;
              const q = vehicleSearch.toLowerCase();
              return v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || v.description.toLowerCase().includes(q);
            }).length}</span> of <span className="text-navy">{fleet.length}</span> vehicles
          </p>
        </div>

        {/* 2-Column Mobile Grid: grid-cols-2 lg:grid-cols-4 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {fleet
            .filter((v) => {
              if (!vehicleSearch.trim()) return true;
              const q = vehicleSearch.toLowerCase();
              return (
                v.name.toLowerCase().includes(q) ||
                v.category.toLowerCase().includes(q) ||
                v.description.toLowerCase().includes(q)
              );
            })
            .map((v) => {
              const totalPrice = v.hourlyRate * numericHours;
              const totalKm = v.includedKmPerHour * numericHours;

              return (
                <Card key={v.id} className="group overflow-hidden rounded-2xl sm:rounded-3xl border-gray-200/80 bg-white transition-all duration-300 hover:shadow-xl hover:border-gold/40 flex flex-col justify-between">
                  <CardContent className="p-0">
                    <div className="relative h-28 sm:h-48 bg-slate-100 overflow-hidden">
                      <img src={v.image} alt={v.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="rounded-full bg-navy/90 text-gold border-0 px-2 py-0.5 text-[9px] sm:text-xs font-black shadow-sm">€{v.hourlyRate}/hr</Badge>
                      </div>
                    </div>

                    <div className="p-3 sm:p-5 space-y-1.5 sm:space-y-3">
                      <div>
                        <p className="text-[8px] sm:text-[10px] font-black text-gold uppercase tracking-wider truncate">{v.category}</p>
                        <h3 className="text-xs sm:text-base font-black text-navy truncate leading-tight">{v.name}</h3>
                      </div>

                      {/* Single-line specs on mobile */}
                      <div className="flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-gray-500">
                        <span className="flex items-center gap-0.5">
                          <IconUsers className="h-3 w-3 text-gold shrink-0" /> {v.seats}s
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <IconRoad className="h-3 w-3 text-gold shrink-0" /> {totalKm}km
                        </span>
                      </div>

                      <p className="hidden sm:block text-xs text-gray-500 line-clamp-2">{v.description}</p>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                        <div>
                          <span className="text-[8px] sm:text-[10px] font-bold text-gray-400">Total ({numericHours}h)</span>
                          <p className="text-xs sm:text-lg font-black text-navy">€{totalPrice}</p>
                        </div>
                        <Button
                          onClick={() => handleOpenDetail(v)}
                          className="rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-[10px] sm:text-xs px-2 sm:px-4 py-1 sm:py-2 cursor-pointer shadow-xs"
                        >
                          Register
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          {fleet.filter((v) => {
            if (!vehicleSearch.trim()) return true;
            const q = vehicleSearch.toLowerCase();
            return (
              v.name.toLowerCase().includes(q) ||
              v.category.toLowerCase().includes(q) ||
              v.description.toLowerCase().includes(q)
            );
          }).length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
              <IconCar className="h-12 w-12 text-gold mx-auto mb-3" />
              <h3 className="text-lg font-black text-navy">No vehicles found</h3>
              <p className="text-xs text-gray-500 mt-1">Try a different search term or clear the search.</p>
              <Button onClick={() => { setVehicleSearch(""); updateURLSearch(""); }} className="mt-4 bg-navy text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer">
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Step 03 & 04 Modal: Product Detail & Offline Registration Form */}
      {selectedVehicle && (
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden bg-white border border-gray-200">
            <div className="relative h-48 bg-slate-900 text-white overflow-hidden">
              <img src={selectedVehicle.image} alt={selectedVehicle.name} className="absolute inset-0 h-full w-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <Badge className="rounded-full bg-gold text-navy font-bold text-xs mb-1">{selectedVehicle.category}</Badge>
                <h2 className="text-2xl font-black text-white">{selectedVehicle.name}</h2>
                <p className="text-xs text-gray-300">{numericHours} Hours Disposal in {selectedLocationName} · Included {selectedVehicle.includedKmPerHour * numericHours} KM</p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Product Specs Detail Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy">Estimated Hourly Rate</span>
                  <span className="text-base font-black text-navy">€{selectedVehicle.hourlyRate} / hour</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200/60 pt-2 text-xs">
                  <span className="text-gray-500 font-medium">Estimated Total ({numericHours} Hours)</span>
                  <span className="text-lg font-black text-gold">€{selectedVehicle.hourlyRate * numericHours}</span>
                </div>
              </div>

              {/* Step 04: Offline Registration Form */}
              <div>
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Step 04: Offline Registration Form</span>
                <h3 className="text-lg font-black text-navy">Passenger & Itinerary Registration</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-navy">Full Name</Label>
                  <div className="relative mt-1">
                    <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-navy">Phone Number</Label>
                  <div className="relative mt-1">
                    <IconPhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="tel"
                      required
                      placeholder="+41 44 123 4567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-navy">Email Address</Label>
                <div className="relative mt-1">
                  <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-navy">Pickup Hotel / Airport Address</Label>
                <Input
                  type="text"
                  placeholder="e.g. Park Hyatt Milan or Malpensa Airport Terminal 1"
                  value={form.pickupAddress}
                  onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-navy">Custom Itinerary Notes & Requests</Label>
                <textarea
                  rows={3}
                  placeholder="Mention any planned stops (e.g. Lake Como, Serravalle Shopping, Business Roadshow)..."
                  value={form.itineraryNotes}
                  onChange={(e) => setForm({ ...form, itineraryNotes: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-gray-200 p-3 text-xs font-semibold text-navy focus:outline-none focus:border-gold"
                />
              </div>

              {/* Step 05: Submit to Email Team */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" /> Dispatching to Concierge Team...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IconSend className="h-4 w-4" /> Send Enquiry to Europe Transfers Team
                  </span>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Step 05 Confirmation Dialog & Direct Team Contact */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 text-center bg-white border border-gray-200">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-100 shadow-inner mb-4">
            <IconShieldCheck className="h-8 w-8" />
          </div>

          <DialogTitle className="text-2xl font-black text-navy">Enquiry Sent to Team!</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-2 leading-relaxed">
            Our concierge team has received your <span className="font-extrabold text-navy">{numericHours}-hour disposal</span> enquiry for <span className="font-extrabold text-navy">{selectedVehicle?.name}</span> in {selectedLocationName}. We will email your confirmed quote within 15 minutes.
          </DialogDescription>

          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
            <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Need Urgent Assistance?</p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="tel:+41441234567"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 p-2.5 text-xs font-extrabold text-navy hover:bg-slate-50 transition-colors"
              >
                <IconPhoneCall className="h-4 w-4 text-gold" /> Call Team
              </a>
              <a
                href="https://wa.me/41441234567"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-white p-2.5 text-xs font-extrabold hover:bg-emerald-600 transition-colors shadow-sm"
              >
                <IconBrandWhatsapp className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>

          <Button onClick={() => setSuccessDialogOpen(false)} className="mt-6 w-full rounded-xl bg-navy text-white text-xs font-extrabold h-11">
            Done
          </Button>
        </DialogContent>
      </Dialog>

    </div>
  );
}
