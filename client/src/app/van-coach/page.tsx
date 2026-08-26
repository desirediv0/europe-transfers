"use client";

import { useState, useEffect, Suspense } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { usePayment } from "@/hooks/usePayment";
import { useCurrency } from "@/context/CurrencyContext";
import { HeroSearchBar } from "@/components/HeroSearchBar";
import { DropdownPickerField, DatePickerField } from "@/components/SearchFields";
import type { Location } from "@/lib/types";
import {
  IconClock,
  IconMapPin,
  IconLoader2,
  IconSearch,
  IconUsers,
  IconRoad,
  IconCar,
  IconShieldCheck,
  IconSend,
  IconPhoneCall,
  IconBrandWhatsapp,
  IconMail,
  IconUser,
  IconCreditCard,
  IconCheck,
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
  allInclusiveRate8h: number;
  allInclusiveRate10h: number;
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
    features: ["Air Conditioning", "English-Speaking Chauffeur", "Free Waiting Time", "Meet & Greet", "Bottled Water", "Phone Charger"],
    description: v.description || `${v.name} available for hourly disposal with dedicated English-speaking chauffeur.`,
    allInclusiveRate8h: Number(v.rate8h) || 0,
    allInclusiveRate10h: Number(v.rate10h) || 0,
  };
}

const FLEET_FEATURES = [
  { icon: IconShieldCheck, title: "Licensed & Insured", desc: "Fully authorized European transport operator" },
  { icon: IconClock, title: "60 Min Free Wait", desc: "Complimentary waiting time at airports" },
  { icon: IconCar, title: "Luxury Fleet", desc: "Late-model Mercedes-Benz vehicles" },
  { icon: IconUsers, title: "English Speaking", desc: "Professional multilingual chauffeurs" },
];

const PROCESS_STEPS = [
  { step: "01", title: "Search Engine", desc: "Select city & disposal hours" },
  { step: "02", title: "Choose Vehicle", desc: "Pick Mercedes S-Class or V-Class" },
  { step: "03", title: "View Details", desc: "Check included km, rates & specs" },
  { step: "04", title: "Register", desc: "Enter trip itinerary & passenger info" },
  { step: "05", title: "Confirm", desc: "Pay securely or send enquiry" },
];

function VanCoachFleetContent() {
  const { format: formatCurrency } = useCurrency();
  const [locations, setLocations] = useState<Location[]>([]);
  const [fleet, setFleet] = useState<DisposalVehicle[]>([]);
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const [hours, setHours] = useState("8");
  const [pickupDate, setPickupDate] = useState<Date | null>(new Date());
  const [pickupTime, setPickupTime] = useState("09:00 AM");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedVehicle, setSelectedVehicle] = useState<DisposalVehicle | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", pickupAddress: "", itineraryNotes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [paymentForm, setPaymentForm] = useState({ name: "", email: "", phone: "", pickupAddress: "" });
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { initiatePayment, loading: paymentLoading } = usePayment();

  useEffect(() => {
    Promise.all([
      api.get<Location[]>("/search/locations").catch(() => []),
      api.get<VanCoachVehicle[]>("/van-coach/all").catch(() => []),
    ]).then(([locs, vehicles]) => {
      setLocations(locs);
      setFleet(vehicles.map(mapToDisposalVehicle));
      setLoading(false);
    });
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

  const numericHours = Number(hours) || 8;

  const filteredFleet = fleet.filter((v) => {
    if (!vehicleSearch.trim()) return true;
    const q = vehicleSearch.toLowerCase();
    return v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q);
  });

  const handleSearch = () => {
    const el = document.getElementById("fleet-grid");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    if (!enquiryForm.name || !enquiryForm.email || !enquiryForm.phone) {
      toast.error("Please enter name, email, and phone");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/van-coach/enquire", {
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        location: selectedLocationName || "Europe",
        hours: numericHours,
        rate: selectedVehicle.hourlyRate * numericHours,
        name: enquiryForm.name,
        phone: enquiryForm.phone,
        email: enquiryForm.email,
        pickupAddress: enquiryForm.pickupAddress || undefined,
        itineraryNotes: enquiryForm.itineraryNotes || undefined,
      });
      setSubmitting(false);
      setDetailModalOpen(false);
      setSuccessOpen(true);
      toast.success("Enquiry sent to Europe Transfers Concierge Team!");
    } catch {
      setSubmitting(false);
      toast.error("Failed to send enquiry. Please try again.");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    if (!paymentForm.name || !paymentForm.email || !paymentForm.phone) {
      toast.error("Please enter name, email, and phone");
      return;
    }

    const totalAmount = selectedVehicle.hourlyRate * numericHours;
    await initiatePayment({
      productType: "VAN_COACH",
      productId: selectedVehicle.id,
      productName: `${selectedVehicle.name} - ${numericHours}h Disposal`,
      amount: totalAmount,
      currency: "EUR",
      customerName: paymentForm.name,
      customerEmail: paymentForm.email,
      customerPhone: paymentForm.phone,
      travelDate: pickupDate ? format(pickupDate, "yyyy-MM-dd") : undefined,
      pax: 1,
      optionSelected: `${numericHours}h Disposal in ${selectedLocationName || "Europe"}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Banner */}
      <section className="relative bg-[#060C17] text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0B1426]/90 to-black/80 z-10" />
        <div className="absolute top-10 right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-black text-gold uppercase tracking-wider mb-6 border border-gold/30">
            <IconCar className="h-4 w-4 text-gold" />
            First-Class European Fleet
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Private Chauffeured <span className="text-gold">Fleet</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Hire a private Mercedes-Benz vehicle with dedicated English-speaking chauffeur by the hour for business roadshows, shopping, or custom European itineraries.
          </p>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-white border-b border-gray-200/80 py-6 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FLEET_FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 flex-shrink-0">
                  <f.icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-navy leading-snug">{f.title}</h4>
                  <p className="text-[10px] text-gray-500 font-medium leading-tight">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="bg-slate-50 border-b border-gray-200/80 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.step} className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-black text-gold">{s.step}</span>
                  <div>
                    <p className="text-[11px] font-extrabold text-navy leading-tight">{s.title}</p>
                    <p className="text-[9px] text-gray-400 font-medium">{s.desc}</p>
                  </div>
                </div>
                {i < PROCESS_STEPS.length - 1 && <div className="w-6 h-px bg-gray-300 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-gray-200/80 bg-white rounded-3xl shadow-xl p-4 sm:p-6">
          <div className="mb-5">
            <span className="text-xs font-bold tracking-widest text-gold uppercase">Step 01: Search Engine</span>
            <h2 className="text-2xl font-black text-navy mt-1">Configure Hourly Disposal</h2>
          </div>

          <HeroSearchBar
            fieldCount={4}
            submitLabel="Browse Fleet"
            onSubmit={handleSearch}
            fields={
              <>
                <DropdownPickerField
                  label="Location"
                  icon={IconMapPin}
                  value={selectedLocationName}
                  placeholder="e.g. Milan, Zurich, Paris"
                  options={locations.map((l) => ({ id: l.id, label: l.name, sublabel: l.city }))}
                  onChange={(_id, name) => setSelectedLocationName(name)}
                />
                <DropdownPickerField
                  label="Duration"
                  icon={IconClock}
                  value={hours}
                  placeholder="Select duration"
                  options={[
                    { id: "4", label: "4 Hours Half-Day" },
                    { id: "8", label: "8 Hours Full-Day" },
                    { id: "10", label: "10 Hours Extended Day" },
                    { id: "12", label: "12 Hours Grand Day" },
                    { id: "24", label: "24 Hours Multi-Day" },
                  ]}
                  onChange={(id) => setHours(id)}
                />
                <DatePickerField date={pickupDate} onChange={setPickupDate} />
                <DropdownPickerField
                  label="Pickup Time"
                  icon={IconClock}
                  value={pickupTime}
                  placeholder="Select time"
                  options={times.map((t) => ({ id: t, label: t }))}
                  onChange={(id) => setPickupTime(id)}
                  divider={false}
                />
              </>
            }
          />

          <div className="mt-4 relative max-w-md">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Quick search vehicles..."
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-xs font-semibold text-navy shadow-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </Card>
      </section>

      {/* Fleet Grid */}
      <section id="fleet-grid" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-navy">Step 02: Choose Your Luxury Ride</h2>
            <p className="text-xs text-gray-500 mt-1">All rates include chauffeur, fuel, insurance & taxes</p>
          </div>
          <Badge variant="secondary" className="text-xs font-bold">{filteredFleet.length} vehicles</Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-200 animate-pulse">
                <div className="h-48 bg-gray-100 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredFleet.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm">
            <IconCar className="h-12 w-12 text-gold mx-auto mb-3" />
            <h3 className="text-lg font-black text-navy">No vehicles found</h3>
            <p className="text-xs text-gray-500 mt-1">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFleet.map((v) => {
              const totalPrice = v.hourlyRate * numericHours;
              return (
                <Card key={v.id} className="group overflow-hidden rounded-3xl border-gray-200/80 bg-white transition-all duration-300 hover:shadow-xl hover:border-gold/40 flex flex-col">
                  <CardContent className="p-0">
                    <div className="relative h-52 bg-slate-100 overflow-hidden">
                      <img src={v.image} alt={v.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="rounded-full bg-navy/90 text-gold border-0 px-3 py-1 text-xs font-black shadow-sm">
                          {formatCurrency(totalPrice)}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 z-10">
                        <Badge className="rounded-full bg-gold text-navy border-0 px-3 py-1 text-[10px] font-black shadow-sm">
                          {numericHours}h Disposal
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <p className="text-[10px] font-black text-gold uppercase tracking-wider">{v.category}</p>
                        <h3 className="text-base font-black text-navy leading-tight mt-0.5">{v.name}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                        <span className="flex items-center gap-1"><IconUsers className="h-3.5 w-3.5 text-gold" /> {v.seats} Seats</span>
                        <span className="flex items-center gap-1"><IconRoad className="h-3.5 w-3.5 text-gold" /> {v.includedKmPerHour * numericHours}km</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{v.description}</p>

                      <div className="flex flex-wrap gap-1.5">
                        {v.features.slice(0, 3).map((f) => (
                          <span key={f} className="inline-flex items-center gap-1 text-[9px] font-bold text-navy bg-slate-100 rounded-full px-2 py-0.5">
                            <IconCheck className="h-2.5 w-2.5 text-gold" /> {f}
                          </span>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 font-medium">Hourly Rate</span>
                          <span className="font-bold text-navy">{formatCurrency(v.hourlyRate)}/hr</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-medium">Total ({numericHours}h)</span>
                          <span className="text-lg font-black text-navy">{formatCurrency(totalPrice)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => { setSelectedVehicle(v); setDetailModalOpen(true); }}
                            className="flex-1 rounded-xl bg-gold hover:bg-yellow-400 text-navy font-black text-xs py-2.5 cursor-pointer shadow-xs">
                            Enquire
                          </Button>
                          <Button onClick={() => { setSelectedVehicle(v); setPaymentForm({ name: "", email: "", phone: "", pickupAddress: "" }); setPaymentOpen(true); }}
                            variant="outline"
                            className="flex-1 rounded-xl border-2 border-navy text-navy hover:bg-navy hover:text-white font-black text-xs py-2.5 cursor-pointer">
                            <IconCreditCard className="h-3.5 w-3.5 mr-1" /> Pay Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Enquiry Modal */}
      {selectedVehicle && (
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden bg-white border border-gray-200">
            <div className="relative h-48 bg-slate-900 text-white overflow-hidden">
              <img src={selectedVehicle.image} alt={selectedVehicle.name} className="absolute inset-0 h-full w-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <Badge className="rounded-full bg-gold text-navy font-bold text-xs mb-1">{selectedVehicle.category}</Badge>
                <h2 className="text-2xl font-black text-white">{selectedVehicle.name}</h2>
                <p className="text-xs text-gray-300">{numericHours} Hours Disposal in {selectedLocationName || "Europe"} · Included {selectedVehicle.includedKmPerHour * numericHours} KM</p>
              </div>
            </div>
            <form onSubmit={handleEnquirySubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy">Estimated Hourly Rate</span>
                  <span className="text-base font-black text-navy">{formatCurrency(selectedVehicle.hourlyRate)} / hour</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200/60 pt-2 text-xs">
                  <span className="text-gray-500 font-medium">Estimated Total ({numericHours} Hours)</span>
                  <span className="text-lg font-black text-gold">{formatCurrency(selectedVehicle.hourlyRate * numericHours)}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Registration Form</span>
                <h3 className="text-lg font-black text-navy">Passenger & Itinerary Registration</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-navy">Full Name</Label>
                  <div className="relative mt-1">
                    <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="text" required placeholder="John Doe" value={enquiryForm.name} onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })} className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-navy">Phone Number</Label>
                  <div className="relative mt-1">
                    <IconPhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="tel" required placeholder="+41 44 123 4567" value={enquiryForm.phone} onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })} className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold" />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold text-navy">Email Address</Label>
                <div className="relative mt-1">
                  <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type="email" required placeholder="you@example.com" value={enquiryForm.email} onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })} className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold text-navy">Pickup Hotel / Airport Address</Label>
                <Input type="text" placeholder="e.g. Park Hyatt Milan or Malpensa Airport Terminal 1" value={enquiryForm.pickupAddress} onChange={(e) => setEnquiryForm({ ...enquiryForm, pickupAddress: e.target.value })} className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1" />
              </div>
              <div>
                <Label className="text-xs font-bold text-navy">Custom Itinerary Notes & Requests</Label>
                <textarea rows={3} placeholder="Mention any planned stops..." value={enquiryForm.itineraryNotes} onChange={(e) => setEnquiryForm({ ...enquiryForm, itineraryNotes: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 p-3 text-xs font-semibold text-navy focus:outline-none focus:border-gold" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl bg-gold hover:bg-yellow-400 text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer">
                {submitting ? (
                  <span className="flex items-center gap-2"><IconLoader2 className="h-4 w-4 animate-spin" /> Dispatching to Concierge Team...</span>
                ) : (
                  <span className="flex items-center gap-2"><IconSend className="h-4 w-4" /> Send Enquiry to Europe Transfers Team</span>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Modal */}
      {selectedVehicle && (
        <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
          <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden bg-white border border-gray-100 shadow-2xl">
            <div className="bg-[#060C17] p-6 text-white">
              <Badge className="rounded-full bg-gold text-navy font-black text-[10px] px-3 mb-2">Secure Payment</Badge>
              <DialogTitle className="text-base font-black text-white leading-snug">Complete Fleet Booking</DialogTitle>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-300 font-medium">{selectedVehicle.name} · {numericHours}h Disposal</p>
                <p className="text-lg font-black text-gold">{formatCurrency(selectedVehicle.hourlyRate * numericHours)}</p>
              </div>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <DialogDescription className="text-[11px] text-gray-400 font-medium -mt-1">
                Fill in your details to proceed with secure payment.
              </DialogDescription>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-black text-navy">Full Name *</Label>
                  <Input required placeholder="John Doe" value={paymentForm.name} onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })} className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-black text-navy">Phone *</Label>
                  <Input type="tel" required placeholder="+41 44 123 4567" value={paymentForm.phone} onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })} className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-black text-navy">Email *</Label>
                <Input type="email" required placeholder="you@example.com" value={paymentForm.email} onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })} className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1" />
              </div>
              <div>
                <Label className="text-xs font-black text-navy">Pickup Address</Label>
                <Input placeholder="Hotel or Airport address" value={paymentForm.pickupAddress} onChange={(e) => setPaymentForm({ ...paymentForm, pickupAddress: e.target.value })} className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1" />
              </div>
              <Button type="submit" disabled={paymentLoading} className="w-full h-12 rounded-xl bg-gold hover:bg-yellow-400 text-navy font-black text-sm shadow-lg shadow-gold/20 cursor-pointer">
                {paymentLoading ? (
                  <span className="flex items-center gap-2"><IconLoader2 className="h-4 w-4 animate-spin" /> Processing Payment...</span>
                ) : (
                  <span className="flex items-center gap-2"><IconCreditCard className="h-4 w-4" /> Pay {formatCurrency(selectedVehicle.hourlyRate * numericHours)} Now</span>
                )}
              </Button>
              <p className="text-[10px] text-gray-400 text-center font-medium">Secured by Razorpay. Your payment details are encrypted.</p>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 text-center bg-white border border-gray-200">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-100 shadow-inner mb-4">
            <IconShieldCheck className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-black text-navy">Enquiry Sent!</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-2 leading-relaxed">
            Our concierge team has received your enquiry. We will email your confirmed quote within 15 minutes.
          </DialogDescription>
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
            <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Need Urgent Assistance?</p>
            <div className="flex items-center justify-center gap-3">
              <a href="tel:+41441234567" className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 p-2.5 text-xs font-extrabold text-navy hover:bg-slate-50 transition-colors">
                <IconPhoneCall className="h-4 w-4 text-gold" /> Call Team
              </a>
              <a href="https://wa.me/41441234567" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-white p-2.5 text-xs font-extrabold hover:bg-emerald-600 transition-colors shadow-sm">
                <IconBrandWhatsapp className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>
          <Button onClick={() => setSuccessOpen(false)} className="mt-6 w-full rounded-xl bg-navy text-white text-xs font-extrabold h-11">Done</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function VanCoachFleetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><IconLoader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <VanCoachFleetContent />
    </Suspense>
  );
}
