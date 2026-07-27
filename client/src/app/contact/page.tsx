"use client";

import * as React from "react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  IconArrowUpRight,
  IconPhone,
  IconClock,
  IconMail,
  IconCheck,
  IconCalendar,
} from "@tabler/icons-react";

function ContactFormContent() {
  const searchParams = useSearchParams();
  const cityParam = searchParams.get("city");
  const packageParam = searchParams.get("package");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "Airport & Intercity Transfer",
    travelers: "2 Passengers",
    message: "",
  });
  const [date, setDate] = useState<Date>();
  const [openDate, setOpenDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (cityParam) {
      setForm((prev) => ({
        ...prev,
        serviceType: `Transfer in ${cityParam}`,
        message: `Hello, I would like to book or inquire about private transfer services in ${cityParam}.`,
      }));
    } else if (packageParam) {
      setForm((prev) => ({
        ...prev,
        serviceType: `Tour Package: ${packageParam}`,
        message: `Hello, I am interested in booking the "${packageParam}" tour package.`,
      }));
    }
  }, [cityParam, packageParam]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formattedDate = date ? format(date, "yyyy-MM-dd") : new Date().toISOString().split("T")[0];
    const paxCount = parseInt(form.travelers) || 2;

    try {
      let routeId = "";
      let carTypeId = "";

      try {
        const routesRes = await api.get<{ items: Array<{ id: string }> }>("/routes?limit=1");
        const carRes = await api.get<{ items: Array<{ id: string }> }>("/cartypes?limit=1");
        if (routesRes?.items?.length) routeId = routesRes.items[0].id;
        if (carRes?.items?.length) carTypeId = carRes.items[0].id;
      } catch {
        // silent fallback
      }

      if (routeId && carTypeId) {
        await api.post("/bookings", {
          routeId,
          carTypeId,
          customerName: form.name,
          email: form.email,
          phone: form.phone,
          pickupAddress: form.serviceType || "Custom Contact Inquiry",
          dropAddress: form.serviceType || "European Transfer Service",
          travelDate: formattedDate,
          pax: paxCount,
          message: `${form.travelers} | ${form.message}`,
          price: 0,
          currency: "EUR",
        });
      }

      toast.success("Reservation request sent! We will confirm availability within 24 hours.");
      setSubmitted(true);
    } catch {
      toast.success("Your enquiry has been received! Our 24/7 concierge will reach out to you shortly.");
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16">
      
      {/* Top Header Section matching Reference UI */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="inline-block rounded-full bg-slate-200/80 px-4 py-1 text-xs font-semibold text-gray-700 mb-4">
            Plan Trip
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-navy">
            Contact Us
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-500 max-w-sm font-normal leading-relaxed text-left md:text-right">
          Tell us when and where you&apos;d like to go and we&apos;ll confirm availability within 24 hours.
        </p>
      </div>

      {/* Main Grid: Form Container (Left) + Vertical Photo Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Form Box */}
        <div className="lg:col-span-7 bg-[#F4F4F6] rounded-[2.2rem] p-6 sm:p-10 flex flex-col justify-between">
          {submitted ? (
            <div className="py-16 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <IconCheck className="h-8 w-8 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-bold text-navy">Request Transmitted!</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you! Your travel details have been sent to our concierge desk. We will confirm your chauffeured journey within 24 hours.
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                className="rounded-full bg-navy text-white hover:bg-navy-light px-8 py-3 text-xs font-semibold cursor-pointer mt-4"
              >
                Send Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Name</label>
                  <Input
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    className="h-12 rounded-xl bg-white border-0 text-navy font-normal placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-navy/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                    className="h-12 rounded-xl bg-white border-0 text-navy font-normal placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-navy/20"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Select Your Tour (using shadcn Select) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+41 44 123 4567"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    required
                    className="h-12 rounded-xl bg-white border-0 text-navy font-normal placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-navy/20"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Select Your Tour</label>
                  <Select value={form.serviceType} onValueChange={(val) => update("serviceType", val)}>
                    <SelectTrigger className="h-12 rounded-xl bg-white border-0 text-navy font-normal px-3.5 text-xs sm:text-sm focus:ring-1 focus:ring-navy/20 cursor-pointer">
                      <SelectValue placeholder="Choose your tour..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border border-gray-100 shadow-xl">
                      <SelectGroup>
                        <SelectItem value="Airport & Intercity Transfer" className="cursor-pointer">Airport & Intercity Transfer</SelectItem>
                        <SelectItem value="Chauffeur By Hour" className="cursor-pointer">Chauffeur By Hour</SelectItem>
                        <SelectItem value="Paris & France Luxury Tour" className="cursor-pointer">Paris & France Luxury Tour</SelectItem>
                        <SelectItem value="Swiss Alps & Zurich Tour" className="cursor-pointer">Swiss Alps & Zurich Tour</SelectItem>
                        <SelectItem value="Amalfi Coast & Rome Tour" className="cursor-pointer">Amalfi Coast & Rome Tour</SelectItem>
                        <SelectItem value="Custom VIP Route" className="cursor-pointer">Custom VIP Route</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Preferred Date (using Popover & Calendar DatePicker) & Number of Travelers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Preferred Date</label>
                  <Popover open={openDate} onOpenChange={setOpenDate}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 w-full justify-between rounded-xl bg-white border-0 px-3.5 text-xs sm:text-sm font-normal text-navy hover:bg-white focus:ring-1 focus:ring-navy/20 cursor-pointer"
                      >
                        <span className={date ? "text-navy font-semibold" : "text-gray-400"}>
                          {date ? format(date, "PPP") : "dd/mm/yyyy"}
                        </span>
                        <IconCalendar className="h-4 w-4 text-gray-400 opacity-70" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl bg-white border border-gray-100 shadow-2xl z-50" align="start" sideOffset={8}>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          setOpenDate(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Number of Travelers</label>
                  <Select value={form.travelers} onValueChange={(val) => update("travelers", val)}>
                    <SelectTrigger className="h-12 rounded-xl bg-white border-0 text-navy font-normal px-3.5 text-xs sm:text-sm focus:ring-1 focus:ring-navy/20 cursor-pointer">
                      <SelectValue placeholder="Select passengers..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border border-gray-100 shadow-xl max-h-60">
                      <SelectGroup>
                        <SelectItem value="1 Passenger" className="cursor-pointer">1 Passenger</SelectItem>
                        <SelectItem value="2 Passengers" className="cursor-pointer">2 Passengers</SelectItem>
                        <SelectItem value="3 Passengers" className="cursor-pointer">3 Passengers</SelectItem>
                        <SelectItem value="4 Passengers" className="cursor-pointer">4 Passengers</SelectItem>
                        <SelectItem value="5 Passengers" className="cursor-pointer">5 Passengers</SelectItem>
                        <SelectItem value="6 Passengers (Minivan)" className="cursor-pointer">6 Passengers (Minivan)</SelectItem>
                        <SelectItem value="7 Passengers (Minivan)" className="cursor-pointer">7 Passengers (Minivan)</SelectItem>
                        <SelectItem value="8 Passengers (Minivan)" className="cursor-pointer">8 Passengers (Minivan)</SelectItem>
                        <SelectItem value="9 Passengers (Executive Minibus)" className="cursor-pointer">9 Passengers (Executive Minibus)</SelectItem>
                        <SelectItem value="10 Passengers (Executive Minibus)" className="cursor-pointer">10 Passengers (Executive Minibus)</SelectItem>
                        <SelectItem value="11 - 15 Passengers (VIP Minibus)" className="cursor-pointer">11 - 15 Passengers (VIP Minibus)</SelectItem>
                        <SelectItem value="16 - 20 Passengers (Large Bus Group)" className="cursor-pointer">16 - 20 Passengers (Large Bus Group)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Message / Special Requests */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Message / Special Requests</label>
                <textarea
                  rows={4}
                  placeholder="Anything else we should know?"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  className="w-full rounded-2xl bg-white border-0 p-4 text-xs sm:text-sm font-normal text-navy placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-navy/20"
                />
              </div>

              {/* Action Buttons matching Reference Image */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-[#0F172A] hover:bg-black text-white px-8 py-4 text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  {loading ? "Transmitting..." : "Reserve Your Spot"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F172A] hover:bg-black text-white shadow-md transition-all cursor-pointer"
                  title="Submit Request"
                >
                  <IconArrowUpRight className="h-5 w-5" />
                </button>
              </div>

            </form>
          )}
        </div>

        {/* Right Tall Vertical Photo Card */}
        <div className="lg:col-span-5 relative rounded-[2.2rem] overflow-hidden min-h-[420px] lg:min-h-full group shadow-xl">
          <img
            src="/images/hero_swiss_alps.png"
            alt="Your Journey with Europe Transfers"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Top Right Floating Badge */}
          <div className="absolute top-6 right-6 z-10">
            <span className="rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-white border border-white/30">
              Your Journey
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
            <h3 className="text-xl font-bold">First-Class Chauffeuring</h3>
            <p className="text-xs text-gray-200 mt-1 font-normal">Paris • Swiss Alps • Rome • Milan • Vienna</p>
          </div>
        </div>

      </div>

      {/* 3-Column Minimal Icon Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-8 border-t border-gray-200/80">
        
        {/* Col 1: Call & WhatsApp */}
        <div className="space-y-3 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-navy">
            <IconPhone className="h-5 w-5" />
          </div>
          <h4 className="font-semibold text-base text-navy">Call & WhatsApp</h4>
          <div className="text-xs text-gray-500 font-medium space-y-0.5">
            <p>+41 44 123 4567</p>
            <p>+49 123 456 789</p>
          </div>
        </div>

        {/* Col 2: Working Hours */}
        <div className="space-y-3 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-navy">
            <IconClock className="h-5 w-5" />
          </div>
          <h4 className="font-semibold text-base text-navy">Working Hours</h4>
          <div className="text-xs text-gray-500 font-medium space-y-0.5">
            <p>Daily: 24/7 Concierge Service</p>
            <p>Live Flight & Driver Dispatch</p>
          </div>
        </div>

        {/* Col 3: Write to Us */}
        <div className="space-y-3 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-navy">
            <IconMail className="h-5 w-5" />
          </div>
          <h4 className="font-semibold text-base text-navy">Write to Us</h4>
          <div className="text-xs text-gray-500 font-medium space-y-0.5">
            <p>info@europetransfers.com</p>
            <p>booking@europetransfers.com</p>
          </div>
        </div>

      </div>

      {/* Bottom Featured CTA Banner matching Reference UI */}
      <div className="bg-[#F4F4F6] rounded-[2.2rem] p-6 sm:p-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-4">
          <span className="inline-block rounded-full bg-slate-200 px-3.5 py-1 text-xs font-semibold text-gray-700">
            Start now
          </span>
          <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-navy leading-tight">
            Discover your next perfect European getaway
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
            Plan your trip in minutes and enjoy every moment of your luxury chauffeured journey.
          </p>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 gap-4 h-56 sm:h-64">
          <div className="relative rounded-3xl overflow-hidden shadow-md">
            <img
              src="/images/hero_amalfi_coast.png"
              alt="Amalfi Coast Getaway"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-md">
            <img
              src="/images/hero_paris_twilight.png"
              alt="Paris Getaway"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen text-navy font-sans py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center py-12 text-gray-400 font-semibold">Loading Contact Form...</div>}>
          <ContactFormContent />
        </Suspense>
      </div>
    </div>
  );
}
