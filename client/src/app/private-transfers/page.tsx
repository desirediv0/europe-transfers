"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  IconMapPin,
  IconCar,
  IconUsers,
  IconSend,
  IconPhoneCall,
  IconBrandWhatsapp,
  IconShieldCheck,
  IconLoader2,
  IconRoute,
  IconCheck,
  IconCalendar,
  IconClock,
  IconChevronRight,
  IconSparkles,
  IconSearch,
  IconPlaneArrival,
} from "@tabler/icons-react";

interface TransferRoute {
  id: string;
  description: string;
  sedanPrice: number;
  minivanPrice: number;
  currency: string;
}

interface TransferCity {
  id: string;
  name: string;
  slug: string;
  coverImage?: string;
  routes: TransferRoute[];
}

const CITY_IMAGES: Record<string, string> = {
  london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
  edinburgh: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=800&q=80",
  glasgow: "https://images.unsplash.com/photo-1549039952-1e4e5e8bc1da?w=800&q=80",
  inverness: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  manchester: "https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=800&q=80",
  paris: "/images/hero_swiss_alps.png",
  zurich: "/images/lucerne_chape_bridge.png",
};

export default function PrivateTransfersPage() {
  const [cities, setCities] = useState<TransferCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<TransferCity | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<"sedan" | "minivan">("sedan");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pickupDate: "",
    pickupTime: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    api
      .get<TransferCity[]>("/private-transfers/all")
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleEnquire = (
    city: TransferCity,
    route?: TransferRoute,
    type: "sedan" | "minivan" = "sedan"
  ) => {
    setSelectedCity(city);
    const targetRoute = route || city.routes[0];
    setSelectedRouteId(targetRoute?.id || "");
    setVehicleType(type);
    setForm({
      name: "",
      email: "",
      phone: "",
      pickupDate: "",
      pickupTime: "",
      message: "",
    });
    setEnquiryOpen(true);
  };

  const selectedRoute = selectedCity?.routes.find((r) => r.id === selectedRouteId) || selectedCity?.routes[0];

  const totalPrice = selectedRoute
    ? vehicleType === "sedan"
      ? selectedRoute.sedanPrice
      : selectedRoute.minivanPrice
    : 0;

  const currencySymbol = selectedRoute?.currency === "EUR" ? "€" : "£";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please enter your name, email, and phone number.");
      return;
    }

    if (!selectedCity || !selectedRoute) {
      toast.error("Please select a city and transfer route.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/private-transfers/enquire", {
        cityName: selectedCity.name,
        routeDescription: selectedRoute.description,
        vehicleType,
        price: Number(totalPrice),
        currency: selectedRoute.currency || "GBP",
        name: form.name,
        phone: form.phone,
        email: form.email,
        pickupDate: form.pickupDate || undefined,
        pickupTime: form.pickupTime || undefined,
        message: form.message || undefined,
      });

      setSubmitting(false);
      setEnquiryOpen(false);
      setSuccessOpen(true);
      toast.success("Private transfer enquiry submitted! Confirmation sent to your email.");
    } catch (err: unknown) {
      setSubmitting(false);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errMsg = error?.response?.data?.message || error?.message || "Failed to submit enquiry. Please try again.";
      toast.error(errMsg);
    }
  };

  const filteredCities = cities.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.routes.some((r) => r.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans pb-24">
      
      {/* Luxury Hero Banner */}
      <section className="relative bg-[#060C17] text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-[#060C17] via-[#060C17]/80 to-transparent z-10" />
        <img
          src="/images/about_luxury_chauffeur.png"
          alt="Luxury Chauffeured Private Transfer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />

        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <Badge className="rounded-full bg-gold/20 text-gold border border-gold/30 px-4 py-1 text-xs font-black uppercase tracking-wider mb-5">
            <IconSparkles className="mr-1.5 h-3.5 w-3.5 inline" />
            Bespoke Chauffeured Private Transfers
          </Badge>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Private Chauffeur <span className="text-gold">Transfers</span>
          </h1>
          <p className="mt-4 text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Fixed-price private airport, hotel & intercity transfers. Travel in luxury Mercedes-Benz sedans & minivans with flight tracking & 60 mins complimentary wait time.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-lg mx-auto flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-2 pl-3 flex-1 text-gray-400">
              <IconSearch className="h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search transfer city or airport route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 text-navy font-semibold text-xs sm:text-sm placeholder:text-gray-400"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-3 text-xs text-gray-400 font-bold hover:text-navy"
              >
                Clear
              </button>
            )}
          </div>

          {/* Feature Guarantee Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-bold text-gray-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <IconShieldCheck className="h-4 w-4 text-gold" /> Fixed Transparent Rates
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <IconPlaneArrival className="h-4 w-4 text-gold" /> Flight Tracking & Free Wait
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <IconCar className="h-4 w-4 text-gold" /> Mercedes-Benz Fleet
            </span>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">Available Private Transfer Routes</h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Select your city & preferred vehicle type to get an instant quote</p>
          </div>
          <Badge className="bg-navy text-gold font-black text-xs px-3.5 py-1">
            {filteredCities.length} Cities
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse rounded-3xl border-gray-200">
                <div className="h-48 bg-slate-200 rounded-t-3xl" />
                <CardContent className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-md mx-auto shadow-sm">
            <IconMapPin className="h-12 w-12 text-gold mx-auto mb-3" />
            <h3 className="text-lg font-black text-navy">No cities found</h3>
            <p className="text-xs text-gray-500 mt-1">Try searching for another city or clear the search filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city) => {
              const minSedan = city.routes.reduce((min, r) => Math.min(min, r.sedanPrice), Infinity);
              const isPound = city.routes[0]?.currency === "GBP";
              const symbol = isPound ? "£" : "€";

              return (
                <Card
                  key={city.id}
                  className="group overflow-hidden rounded-3xl border border-gray-200/80 bg-white transition-all duration-300 hover:shadow-xl hover:border-gold/40 flex flex-col justify-between"
                >
                  <div>
                    {/* City Image Header */}
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={city.coverImage || CITY_IMAGES[city.slug] || "/images/about_luxury_chauffeur.png"}
                        alt={city.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <h3 className="text-2xl font-black text-white leading-tight">{city.name}</h3>
                        <p className="text-xs text-gray-200 font-semibold">{city.routes.length} Chauffeured Routes</p>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="rounded-full bg-navy/90 text-gold border border-gold/30 px-3 py-1 text-xs font-black shadow-md backdrop-blur-md">
                          From {symbol}{minSedan}
                        </Badge>
                      </div>
                    </div>

                    {/* Routes List */}
                    <CardContent className="p-5 space-y-3">
                      {city.routes.map((route) => (
                        <div
                          key={route.id}
                          onClick={() => handleEnquire(city, route, "sedan")}
                          className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-gold/40 hover:bg-gold/5 transition-all cursor-pointer group/route"
                        >
                          <div className="flex items-start gap-2">
                            <IconRoute className="h-4 w-4 text-gold shrink-0 mt-0.5 group-hover/route:scale-110 transition-transform" />
                            <p className="font-bold text-xs text-navy group-hover/route:text-gold transition-colors leading-tight">
                              {route.description}
                            </p>
                          </div>

                          {/* Clickable Vehicle Pills */}
                          <div className="flex items-center gap-2 mt-2.5 pl-6">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnquire(city, route, "sedan");
                              }}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white text-slate-700 hover:bg-gold hover:text-navy transition-all border border-slate-200 shadow-2xs"
                            >
                              <IconCar className="h-3 w-3 text-slate-500" />
                              <span>Sedan:</span>
                              <span className="text-navy font-black">{symbol}{route.sedanPrice}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnquire(city, route, "minivan");
                              }}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white text-slate-700 hover:bg-gold hover:text-navy transition-all border border-slate-200 shadow-2xs"
                            >
                              <IconUsers className="h-3 w-3 text-slate-500" />
                              <span>Minivan:</span>
                              <span className="text-navy font-black">{symbol}{route.minivanPrice}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </div>

                  <div className="p-5 pt-0">
                    <Button
                      onClick={() => handleEnquire(city, city.routes[0], "sedan")}
                      className="w-full rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs py-3 shadow-md shadow-gold/15 cursor-pointer"
                    >
                      Book / Enquire Transfer <IconChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Luxury Fleet Vehicles Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-[#060C17] text-white rounded-3xl p-8 sm:p-12 border border-gold/30 shadow-2xl space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-bold text-xs uppercase tracking-widest block mb-2">First-Class Chauffeured Vehicles</span>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Our Luxury Mercedes-Benz Fleet</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <IconCar className="h-5 w-5 text-gold" /> Executive Sedan
                </h4>
                <Badge className="bg-gold text-navy font-black text-xs">Mercedes E-Class / S-Class</Badge>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Perfect for individual executive travel, couples, and VIP airport arrivals with leather interior & Wi-Fi.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-200 font-semibold pt-2">
                <span><strong className="text-gold">Capacity:</strong> 1-3 Passengers</span>
                <span><strong className="text-gold">Luggage:</strong> 3 Suitcases</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <IconUsers className="h-5 w-5 text-gold" /> Luxury Minivan
                </h4>
                <Badge className="bg-gold text-navy font-black text-xs">Mercedes V-Class / Vito</Badge>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Ideal for family groups, business teams & extra luggage. Conference seating layout available.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-200 font-semibold pt-2">
                <span><strong className="text-gold">Capacity:</strong> 1-7 Passengers</span>
                <span><strong className="text-gold">Luggage:</strong> 7 Suitcases</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Booking & Enquiry Modal */}
      {selectedCity && (
        <Dialog open={enquiryOpen} onOpenChange={setEnquiryOpen}>
          <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden bg-white border border-gray-200">
            {/* Modal Header */}
            <div className="bg-[#060C17] p-6 text-white relative">
              <div className="flex items-center gap-2 mb-2">
                <IconMapPin className="h-4 w-4 text-gold" />
                <Badge className="rounded-full bg-gold text-navy font-black text-xs px-3">{selectedCity.name}</Badge>
              </div>
              <h3 className="text-lg font-black text-white leading-snug">
                {selectedRoute?.description || "Select Transfer Route"}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-gray-300 font-medium">
                  {vehicleType === "sedan" ? "Executive Sedan (1-3 Pax)" : "Luxury Minivan (1-7 Pax)"}
                </span>
                <span className="text-gold font-black text-base">
                  {currencySymbol}{totalPrice} Total
                </span>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* 1. Route Selector */}
              <div>
                <Label className="text-xs font-black text-navy mb-1.5 block">1. Select Transfer Route</Label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-slate-50 px-3 text-xs font-bold text-navy focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                >
                  {selectedCity.routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.description} (Sedan: {currencySymbol}{r.sedanPrice} | Minivan: {currencySymbol}{r.minivanPrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Vehicle Selection Cards */}
              <div>
                <Label className="text-xs font-black text-navy mb-1.5 block">2. Select Vehicle Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVehicleType("sedan")}
                    className={cn(
                      "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all relative cursor-pointer",
                      vehicleType === "sedan"
                        ? "border-gold bg-gold/10 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-navy">
                        <IconCar className="h-4 w-4 text-gold" /> Executive Sedan
                      </span>
                      {vehicleType === "sedan" && (
                        <span className="h-4 w-4 rounded-full bg-gold text-navy flex items-center justify-center">
                          <IconCheck className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">1–3 Passengers</span>
                    <span className="mt-2 text-sm font-black text-navy">{currencySymbol}{selectedRoute?.sedanPrice || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleType("minivan")}
                    className={cn(
                      "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all relative cursor-pointer",
                      vehicleType === "minivan"
                        ? "border-gold bg-gold/10 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-navy">
                        <IconUsers className="h-4 w-4 text-gold" /> Luxury Minivan
                      </span>
                      {vehicleType === "minivan" && (
                        <span className="h-4 w-4 rounded-full bg-gold text-navy flex items-center justify-center">
                          <IconCheck className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">1–7 Passengers</span>
                    <span className="mt-2 text-sm font-black text-navy">{currencySymbol}{selectedRoute?.minivanPrice || 0}</span>
                  </button>
                </div>
              </div>

              {/* 3. Customer Info */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <Label className="text-xs font-bold text-navy">Full Name *</Label>
                  <Input
                    required
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-navy">Phone / WhatsApp *</Label>
                  <Input
                    type="tel"
                    required
                    placeholder="+44 7700 900123"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-navy">Email Address *</Label>
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-navy flex items-center gap-1">
                    <IconCalendar className="h-3.5 w-3.5 text-gold" /> Pickup Date
                  </Label>
                  <Input
                    type="date"
                    value={form.pickupDate}
                    onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                    className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1 bg-slate-50"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-navy flex items-center gap-1">
                    <IconClock className="h-3.5 w-3.5 text-gold" /> Pickup Time
                  </Label>
                  <Input
                    type="time"
                    value={form.pickupTime}
                    onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
                    className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-navy">Flight No. / Pickup Details</Label>
                <textarea
                  rows={2}
                  placeholder="Flight number, terminal, hotel name or special requests..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-gray-200 p-3 text-xs font-semibold text-navy focus:outline-none focus:border-gold"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" /> Submitting Request...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IconSend className="h-4 w-4" /> Send Transfer Request ({currencySymbol}{totalPrice})
                  </span>
                )}
              </Button>

            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 text-center bg-white border border-gray-200">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-100 mb-4">
            <IconShieldCheck className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-black text-navy">Transfer Request Transmitted!</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-2 leading-relaxed">
            Our dispatch concierge team has received your private transfer enquiry.
            We will contact you shortly to confirm chauffeur details & booking voucher.
          </DialogDescription>

          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
            <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Need Immediate Assistance?</p>
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
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-white p-2.5 text-xs font-extrabold hover:bg-emerald-600 transition-colors"
              >
                <IconBrandWhatsapp className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>

          <Button onClick={() => setSuccessOpen(false)} className="mt-6 w-full rounded-xl bg-navy text-white text-xs font-extrabold h-11">
            Done
          </Button>
        </DialogContent>
      </Dialog>

    </div>
  );
}
