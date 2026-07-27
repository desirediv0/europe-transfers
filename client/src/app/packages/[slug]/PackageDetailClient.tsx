"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Package } from "@/lib/types";
import {
  IconCalendar,
  IconMapPin,
  IconArrowLeft,
  IconCheck,
  IconMail,
  IconPhone,
  IconUsers,
  IconClock,
  IconShieldCheck,
  IconCar,
  IconStar,
  IconSparkles,
  IconArrowRight,
} from "@tabler/icons-react";

interface Props {
  pkg: Package;
}

const DEFAULT_HIGHLIGHTS = [
  "Bespoke Private Chauffeured Transfers",
  "Luxury Mercedes-Benz S-Class / V-Class Fleet",
  "English Speaking Professional Chauffeurs",
  "Flight Tracking & Complimentary Wait Time",
  "Customizable Daily Sightseeing Itinerary",
  "24/7 VIP Concierge Travel Assistance",
];

export function PackageDetailClient({ pkg }: Props) {
  const imageSrc = pkg.coverImage || "/images/hero_swiss_alps.png";
  const countryName = pkg.country?.name || "Europe";
  const priceDisplay = pkg.priceFrom ? Number(pkg.priceFrom).toFixed(0) : "1,195";

  return (
    <div className="bg-slate-50/50 min-h-screen font-sans pb-24 md:pb-0">
      
      {/* Luxury Hero Banner */}
      <section className="relative bg-[#060C17] text-white overflow-hidden border-b border-white/10">
        
        {/* Background Image with Dark Gradient Overlays */}
        {imageSrc && (
          <img
            src={imageSrc}
            alt={pkg.title}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060C17] via-[#060C17]/60 to-black/70" />
        <div className="absolute top-10 right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />

        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-28">
          
          {/* Back Navigation Button */}
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white/90 hover:bg-gold hover:text-navy transition-all duration-300 mb-6 sm:mb-8 cursor-pointer shadow-md"
          >
            <IconArrowLeft className="h-4 w-4" /> Back to Packages
          </Link>

          {/* Badges Bar */}
          <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-4 sm:mb-6">
            <Badge className="rounded-full bg-gold text-navy border-0 px-3.5 py-1 text-xs font-black shadow-md">
              <IconCalendar className="mr-1.5 h-3.5 w-3.5" />
              {pkg.durationDays} Days / {pkg.durationDays - 1} Nights
            </Badge>
            <Badge className="rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-bold shadow-sm">
              <IconMapPin className="mr-1.5 h-3.5 w-3.5 text-gold" />
              {countryName}
            </Badge>
            <Badge className="rounded-full bg-white/10 text-gold border border-gold/30 backdrop-blur-md px-3.5 py-1 text-xs font-bold">
              <IconStar className="mr-1.5 h-3.5 w-3.5 fill-gold" />
              4.9 VIP Rating
            </Badge>
          </div>

          {/* Package Title */}
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl">
            {pkg.title}
          </h1>

          {/* Summary */}
          {pkg.summary && (
            <p className="mt-4 sm:mt-5 text-xs sm:text-lg text-gray-300 max-w-3xl leading-relaxed font-normal">
              {pkg.summary}
            </p>
          )}

          {/* Starting Price Pill */}
          <div className="mt-6 sm:mt-8 inline-flex items-baseline gap-2.5 sm:gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-5 py-3 sm:px-6 sm:py-3.5 shadow-xl">
            <span className="text-[10px] sm:text-xs font-bold text-gray-300 uppercase tracking-wider">Starting From</span>
            <span className="text-2xl sm:text-4xl font-black text-gold">€{priceDisplay}</span>
            <span className="text-xs text-gray-300 font-medium">/ person</span>
          </div>

        </div>
      </section>

      {/* Main Content & Sidebar Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Main Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-8 sm:space-y-10">
            
            {/* Highlights Card */}
            <Card className="border border-gray-200/80 bg-white rounded-3xl p-5 sm:p-8 shadow-md">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                    <IconSparkles className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-navy tracking-tight">Package Highlights</h2>
                </div>

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  {DEFAULT_HIGHLIGHTS.map((item) => (
                    <div key={item} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-100">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-gold flex-shrink-0 mt-0.5">
                        <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-navy leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Day-by-Day Itinerary Section */}
            {pkg.itineraryDays && pkg.itineraryDays.length > 0 ? (
              <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-md">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-navy text-gold">
                    <IconCalendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-navy tracking-tight">Day-by-Day Itinerary</h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Detailed daily schedule for your European tour</p>
                  </div>
                </div>

                <Accordion type="multiple" defaultValue={pkg.itineraryDays.map(d => d.id)} className="w-full space-y-3.5">
                  {pkg.itineraryDays.map((day) => (
                    <AccordionItem
                      key={day.id}
                      value={day.id}
                      className="border border-gray-200/80 rounded-2xl px-4 sm:px-6 data-[state=open]:border-gold/40 data-[state=open]:shadow-md transition-all bg-slate-50/50"
                    >
                      <AccordionTrigger className="text-left py-4 sm:py-5 hover:no-underline cursor-pointer">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-navy text-gold font-black text-xs shadow-sm flex-shrink-0">
                            D{day.dayNumber}
                          </div>
                          <span className="font-extrabold text-sm sm:text-base text-navy">
                            <span className="text-gold mr-1">Day {day.dayNumber}:</span> {day.title}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 text-xs sm:text-sm leading-relaxed pb-5 sm:pb-6 pl-12 sm:pl-14 font-normal">
                        {day.description}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              /* Fallback Itinerary overview if no itinerary days returned */
              <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-md">
                <h2 className="text-xl sm:text-2xl font-black text-navy mb-3">Tour Route Overview</h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  This tour covers top landmarks in {countryName} with private chauffeured transfers, flexible stops, and dedicated travel support throughout your trip.
                </p>
              </div>
            )}

            {/* Included Fleet Guarantee Card */}
            <div className="bg-[#060C17] text-white rounded-3xl p-6 sm:p-8 border border-gold/30 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative z-10">
                <span className="inline-block rounded-full bg-gold/20 text-gold px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
                  First-Class Fleet
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white">Chauffeured Mercedes-Benz Guaranteed</h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-lg">
                  Travel in unmatched comfort with air-conditioned luxury sedans & VIP passenger vans.
                </p>
              </div>
              <Link href="/fleet" className="relative z-10 flex-shrink-0 w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-xl px-6 py-3 text-xs sm:text-sm font-extrabold bg-gold hover:bg-gold-light text-navy shadow-md cursor-pointer">
                  View Our Fleet
                </Button>
              </Link>
            </div>

          </div>

          {/* Sidebar Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Booking Card (Desktop & Tablet) */}
            <Card className="border border-gray-200/80 bg-white rounded-3xl shadow-xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-navy">Book This Package</h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Send an enquiry & customize your itinerary with our concierge team.</p>
                </div>

                <div className="space-y-3.5 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                    <IconClock className="h-4 w-4 text-gold flex-shrink-0" />
                    <span>{pkg.durationDays} Days / {pkg.durationDays - 1} Nights</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                    <IconCar className="h-4 w-4 text-gold flex-shrink-0" />
                    <span>Private Chauffeured Transfer</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                    <IconUsers className="h-4 w-4 text-gold flex-shrink-0" />
                    <span>Solo, Couple & Group Tours</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                    <IconShieldCheck className="h-4 w-4 text-gold flex-shrink-0" />
                    <span>Licensed & Fully Insured</span>
                  </div>
                </div>

                <div className="pt-5 border-t border-gray-100">
                  <div className="mb-5 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Price</span>
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-navy">€{priceDisplay}</span>
                      <span className="text-xs text-gray-500 font-medium"> / person</span>
                    </div>
                  </div>

                  <Link href={`/contact?package=${encodeURIComponent(pkg.title)}`} className="block">
                    <Button variant="gold" size="lg" className="w-full rounded-xl py-3.5 text-sm font-extrabold shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all cursor-pointer">
                      Enquire & Book Package <IconArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Support Assistance Card */}
            <Card className="border border-navy/20 bg-gradient-to-br from-[#060C17] via-[#0C172E] to-[#060C17] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <CardContent className="p-0 space-y-4">
                <h3 className="text-base sm:text-lg font-black text-white">Need Personal Concierge Help?</h3>
                <p className="text-xs text-gray-300 leading-relaxed">Our European travel concierge team is available 24/7 to answer your questions.</p>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-200">
                    <IconPhone className="h-4 w-4 text-gold flex-shrink-0" />
                    <span>+41 44 123 4567</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-200">
                    <IconMail className="h-4 w-4 text-gold flex-shrink-0" />
                    <span>info@europetransfers.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </section>

      {/* Sticky Bottom Booking Bar for Mobile Screens (md:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#060C17]/95 backdrop-blur-xl border-t border-gold/30 p-3.5 shadow-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-gold">€{priceDisplay}</span>
            <span className="text-[10px] text-gray-300">/ person</span>
          </div>
        </div>

        <Link href={`/contact?package=${encodeURIComponent(pkg.title)}`}>
          <button className="rounded-xl bg-gold hover:bg-gold-light text-navy px-5 py-2.5 text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer">
            Book Package <IconArrowRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>

    </div>
  );
}
