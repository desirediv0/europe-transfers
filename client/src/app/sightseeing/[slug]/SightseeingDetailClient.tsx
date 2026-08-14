"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  IconClock,
  IconArrowLeft,
  IconCheck,
  IconMail,
  IconPhone,
  IconUsers,
  IconShieldCheck,
  IconSparkles,
  IconArrowRight,
  IconSend,
  IconLoader2,
  IconBrandWhatsapp,
  IconPhoneCall,
  IconCalendar,
  IconMapPin,
  IconStar,
  IconTicket,
  IconChevronRight,
} from "@tabler/icons-react";

export interface SightseeingTourDetail {
  id: string;
  title: string;
  slug: string;
  cityName?: string;
  countryName?: string;
  duration: string;
  priceFrom: number | string;
  coverImage?: string;
  galleryImages?: string;
  summary?: string;
  description?: string;
  highlights?: string;
  includes?: string;
  options?: string;
  schedule?: string;
  seoTitle?: string;
  seoDescription?: string;
}

interface Props {
  tour: SightseeingTourDetail;
}

export function SightseeingDetailClient({ tour }: Props) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ name: string; price: number } | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    travelDate: "",
    pax: "2",
    message: "",
  });

  const parseJson = (str?: string, fallback: any = []) => {
    if (!str) return fallback;
    try {
      return typeof str === "string" ? JSON.parse(str) : str;
    } catch {
      return fallback;
    }
  };

  const parsedGallery: string[] = parseJson(tour.galleryImages, []);
  let galleryList: string[] = Array.isArray(parsedGallery) && parsedGallery.length > 0
    ? parsedGallery
    : (tour.coverImage ? [tour.coverImage] : ["/images/hero_swiss_alps.png"]);

  if (tour.coverImage && galleryList.includes(tour.coverImage) && galleryList[0] !== tour.coverImage) {
    galleryList = [tour.coverImage, ...galleryList.filter((img) => img !== tour.coverImage)];
  }

  const highlightsList: string[] = parseJson(tour.highlights, [
    "Skip-the-line reserved access",
    "Panoramic views of iconic European landmarks",
    "Multi-language digital audio guide",
    "24/7 VIP concierge travel assistance",
  ]);

  const includesList: string[] = parseJson(tour.includes, [
    "Official activity entrance ticket",
    "Audio guide app download",
    "Local guide assistance",
  ]);

  const optionsList: Array<{ name: string; price: number; duration?: string }> = parseJson(tour.options, [
    { name: `${tour.title} (Standard Access)`, price: Number(tour.priceFrom), duration: tour.duration },
  ]);

  const scheduleList: Array<{ type: string; address: string; metro?: string; time?: string }> = parseJson(tour.schedule, [
    { type: "Departure", address: `Meeting point in ${tour.cityName || "City Center"}`, time: "Flexible Departure" },
    { type: "Arrival", address: `Return to meeting location`, time: `${tour.duration} duration` },
  ]);

  const priceDisplay = Number(tour.priceFrom).toFixed(2);

  const handleOpenOption = (opt: { name: string; price: number }) => {
    setSelectedOption(opt);
    setForm({ name: "", email: "", phone: "", travelDate: "", pax: "2", message: "" });
    setEnquiryOpen(true);
  };

  const handleEnquireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please enter your name, email, and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const activeOptName = selectedOption?.name || tour.title;
      const activeOptPrice = selectedOption ? Number(selectedOption.price).toFixed(2) : priceDisplay;

      await api.post("/sightseeing/enquire", {
        sightseeingId: tour.id,
        sightseeingTitle: tour.title,
        optionSelected: activeOptName,
        cityName: tour.cityName || "Europe",
        priceDisplay: activeOptPrice,
        name: form.name,
        phone: form.phone,
        email: form.email,
        travelDate: form.travelDate || undefined,
        pax: parseInt(form.pax, 10) || 2,
        message: form.message || undefined,
      });

      setSubmitting(false);
      setEnquiryOpen(false);
      setSuccessOpen(true);
      toast.success("Sightseeing booking request submitted! Confirmation sent to your email.");
    } catch (err: any) {
      setSubmitting(false);
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* Dark Hero Banner with Main Gallery Image */}
      <section className="relative bg-[#060C17] overflow-hidden">
        {/* Background blurred image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: `url(${galleryList[0] || "/images/hero_swiss_alps.png"})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060C17]/80 via-[#060C17]/40 to-[#060C17]" />

        {/* Breadcrumb inside hero */}
        <div className="relative z-10 border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <span>/</span>
              <Link href="/sightseeing" className="hover:text-gold transition-colors">Sightseeing</Link>
              <span>/</span>
              <span className="text-white font-semibold truncate max-w-[180px] sm:max-w-xs">{tour.title}</span>
            </div>
            <Link href="/sightseeing" className="hidden sm:flex items-center gap-1 text-gold font-bold hover:underline text-xs">
              <IconArrowLeft className="h-3.5 w-3.5" /> All Activities
            </Link>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="bg-gold text-navy font-black text-[11px] px-3 py-1 rounded-full">
              <IconMapPin className="h-3 w-3 mr-1 inline" />{tour.cityName || "Europe"}
            </Badge>
            <Badge className="bg-white/10 text-white border border-white/20 font-semibold text-[11px] px-3 py-1 rounded-full backdrop-blur-sm">
              <IconClock className="h-3 w-3 mr-1 inline text-gold" />{tour.duration}
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold text-[11px] px-3 py-1 rounded-full backdrop-blur-sm">
              <IconShieldCheck className="h-3 w-3 mr-1 inline" /> Official Ticket
            </Badge>
          </div>

          <h1 className="text-xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl mb-4">
            {tour.title}
          </h1>

          {tour.summary && (
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed font-normal mb-8">
              {tour.summary}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold block mb-1">Starting From</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-gold">{priceDisplay} €</span>
                <span className="text-sm text-gray-400 font-medium">/ person</span>
              </div>
            </div>
            <Button
              onClick={() => handleOpenOption(optionsList[0] || { name: tour.title, price: Number(tour.priceFrom) })}
              className="rounded-2xl px-6 py-3.5 bg-gold hover:bg-yellow-400 text-navy font-extrabold text-sm shadow-xl shadow-gold/30 hover:shadow-gold/50 transition-all cursor-pointer w-full sm:w-auto"
            >
              Check Availability <IconArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Photo Gallery Tabs */}
      {galleryList.length > 1 && (
        <section className="bg-[#060C17] pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Active large photo */}
            <div className="relative h-64 sm:h-96 lg:h-[480px] rounded-2xl overflow-hidden shadow-2xl mb-3">
              <img
                src={galleryList[activeGalleryIdx]}
                alt={`${tour.title} - photo ${activeGalleryIdx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {activeGalleryIdx + 1} / {galleryList.length}
              </div>
            </div>
            {/* Thumbnail strip - horizontally scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {galleryList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveGalleryIdx(idx)}
                  className={`relative flex-shrink-0 h-14 w-20 sm:h-16 sm:w-24 rounded-xl overflow-hidden border-2 transition-all ${
                    idx === activeGalleryIdx
                      ? "border-gold scale-105 shadow-lg shadow-gold/30"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content + Sidebar Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-12">

          {/* ─── LEFT MAIN COLUMN (8 cols) ─── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Single image only hero (if only 1 image, show it inline) */}
            {galleryList.length === 1 && (
              <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-xl">
                <img src={galleryList[0]} alt={tour.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* ✦ HIGHLIGHTS */}
            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-black text-navy tracking-tight mb-5 flex items-center gap-2">
                <IconSparkles className="h-6 w-6 text-gold flex-shrink-0" /> Highlights
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {highlightsList.map((hl, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold/20">
                      <IconCheck className="h-3 w-3 text-gold stroke-[3]" />
                    </div>
                    <span className="text-sm font-semibold text-navy leading-snug">{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ✦ BOOK YOUR TOUR — TICKET OPTIONS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-black text-navy tracking-tight flex items-center gap-2">
                  <IconTicket className="h-6 w-6 text-gold flex-shrink-0" /> Book Your Tour
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1">Choose from our curated ticket options below</p>
              </div>

              <div className="space-y-4">
                {optionsList.map((opt, idx) => (
                  <div
                    key={idx}
                    className="group relative flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border-2 border-gray-200 hover:border-gold/60 bg-white hover:bg-gold/5 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => handleOpenOption(opt)}
                  >
                    {idx === 0 && (
                      <span className="absolute -top-3 left-4 bg-navy text-gold text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                        Most Popular
                      </span>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-base text-navy">{opt.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1 font-semibold">
                            <IconClock className="h-3.5 w-3.5 text-gold" /> {opt.duration || tour.duration}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-600">
                            <IconShieldCheck className="h-3.5 w-3.5" /> Instant Confirmation
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-2xl font-black text-navy">{Number(opt.price).toFixed(2)} €</span>
                          <span className="text-xs text-gray-400 font-medium ml-1">/ person</span>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleOpenOption(opt); }}
                        className="bg-navy hover:bg-gold hover:text-navy text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer w-full sm:w-auto flex-shrink-0"
                      >
                        Choose This Option <IconChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ✦ THE PRICE INCLUDES */}
            {includesList.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-black text-navy tracking-tight mb-5">The Price Includes</h2>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {includesList.map((inc, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-700 font-medium py-1.5 border-b border-gray-100 last:border-0">
                      <span className="h-2 w-2 rounded-full bg-gold flex-shrink-0" />
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ✦ DESCRIPTION */}
            {(tour.description || tour.summary) && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-black text-navy tracking-tight mb-4">About This Experience</h2>
                {tour.description ? (
                  <div
                    className="text-sm text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_h1]:text-xl [&_h1]:font-black [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-gold/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_strong]:font-bold [&_strong]:text-navy"
                    dangerouslySetInnerHTML={{ __html: tour.description }}
                  />
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">{tour.summary}</p>
                )}

                {/* Extra gallery image in description */}
                {galleryList[2] && (
                  <div className="mt-6 rounded-2xl overflow-hidden h-60 sm:h-72 shadow-md">
                    <img src={galleryList[2]} alt={`${tour.title} experience`} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* ✦ VISIT'S ORGANISATION TIMELINE */}
            {scheduleList.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-black text-navy tracking-tight mb-1">Visit's Organisation</h2>
                <p className="text-xs text-gray-500 font-medium mb-7">We'll take care of every detail</p>

                <div className="relative pl-7 space-y-8 border-l-2 border-gold/30">
                  {scheduleList.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[35px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-navy text-gold text-xs font-black border-2 border-white shadow-md">
                        {idx + 1}
                      </div>

                      <Badge className="bg-navy/90 text-gold font-extrabold text-[10px] px-3 py-0.5 mb-2 uppercase tracking-wider">
                        {step.type}
                      </Badge>

                      <p className="text-sm font-bold text-navy leading-snug">{step.address}</p>

                      {step.metro && (
                        <p className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 font-semibold">
                          <IconMapPin className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                          Metro: {step.metro}
                        </p>
                      )}
                      {step.time && (
                        <p className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 font-semibold">
                          <IconClock className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                          {step.time}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ─── RIGHT SIDEBAR (4 cols) ─── */}
          <div className="lg:col-span-4 space-y-5 order-first lg:order-none">

            {/* Sticky booking card */}
            <div className="lg:sticky lg:top-24 space-y-5">

              {/* Price & Quick Book */}
              <Card className="border-2 border-gray-200 rounded-3xl overflow-hidden shadow-xl">
                {/* Top navy header */}
                <div className="bg-[#060C17] p-5 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-gold">
                      {[1,2,3,4,5].map(i => <IconStar key={i} className="h-3.5 w-3.5 fill-gold text-gold" />)}
                    </div>
                    <span className="text-[11px] text-gray-400 font-semibold">Premium Experience</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold block">Starting From</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-gold">{priceDisplay} €</span>
                      <span className="text-xs text-gray-400">/ person</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Details grid */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                        <IconClock className="h-3.5 w-3.5 text-gold" /> Duration
                      </span>
                      <span className="font-extrabold text-navy">{tour.duration}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                        <IconMapPin className="h-3.5 w-3.5 text-gold" /> Location
                      </span>
                      <span className="font-extrabold text-navy">{tour.cityName || "Europe"}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                        <IconShieldCheck className="h-3.5 w-3.5 text-gold" /> Confirmation
                      </span>
                      <span className="font-extrabold text-emerald-600">Instant Email</span>
                    </div>
                  </div>

                  {/* Options quick list */}
                  {optionsList.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <p className="text-[11px] font-black text-navy uppercase tracking-wider">Available Options</p>
                      {optionsList.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleOpenOption(opt)}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-gold/60 hover:bg-gold/5 transition-all cursor-pointer text-left group"
                        >
                          <div>
                            <p className="text-[11px] font-extrabold text-navy group-hover:text-navy leading-tight">{opt.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{opt.duration || tour.duration}</p>
                          </div>
                          <span className="text-base font-black text-navy flex-shrink-0 ml-2">€{Number(opt.price).toFixed(0)}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => handleOpenOption(optionsList[0] || { name: tour.title, price: Number(tour.priceFrom) })}
                    className="w-full rounded-xl py-3.5 bg-gold hover:bg-yellow-400 text-navy font-black text-sm shadow-md shadow-gold/20 cursor-pointer"
                  >
                    Enquire & Reserve Now <IconArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Concierge Assistance Box */}
              <div className="bg-[#060C17] text-white rounded-3xl p-5 border border-gold/20 shadow-xl">
                <h4 className="text-sm font-black text-white mb-1">Need Tour Assistance?</h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Our concierge team can arrange private group tours, custom timings & VIP entry.
                </p>
                <div className="space-y-2 text-xs">
                  <a href="tel:+41441234567" className="flex items-center gap-2 text-gray-300 hover:text-gold transition-colors font-semibold">
                    <IconPhone className="h-4 w-4 text-gold" /> +41 44 123 4567
                  </a>
                  <a href="mailto:info@europetransfers.com" className="flex items-center gap-2 text-gray-300 hover:text-gold transition-colors font-semibold">
                    <IconMail className="h-4 w-4 text-gold" /> info@europetransfers.com
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─── BOOKING ENQUIRY MODAL ─── */}
      <Dialog open={enquiryOpen} onOpenChange={setEnquiryOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden bg-white border border-gray-100 shadow-2xl">
          {/* Modal Header */}
          <div className="bg-[#060C17] p-6 text-white">
            <Badge className="rounded-full bg-gold text-navy font-black text-[10px] px-3 mb-2">
              {tour.cityName || "Europe"}
            </Badge>
            <DialogTitle className="text-base font-black text-white leading-snug">{tour.title}</DialogTitle>
            {selectedOption && (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-gray-300 font-medium">Selected:</span>
                <span className="text-xs text-gold font-extrabold">{selectedOption.name}</span>
                <span className="text-base font-black text-white">€{Number(selectedOption.price).toFixed(2)}</span>
                <span className="text-[11px] text-gray-400">/ person</span>
              </div>
            )}
          </div>

          <form onSubmit={handleEnquireSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <DialogDescription className="text-[11px] text-gray-400 font-medium -mt-1">
              Fill in your details and we'll confirm availability within 2 hours.
            </DialogDescription>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-black text-navy">Full Name *</Label>
                <Input
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-black text-navy">Phone / WhatsApp *</Label>
                <Input
                  type="tel"
                  required
                  placeholder="+41 44 123 4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-black text-navy">Email Address *</Label>
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
                <Label className="text-xs font-black text-navy flex items-center gap-1">
                  <IconCalendar className="h-3.5 w-3.5 text-gold" /> Preferred Date
                </Label>
                <Input
                  type="date"
                  value={form.travelDate}
                  onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1 bg-slate-50"
                />
              </div>
              <div>
                <Label className="text-xs font-black text-navy flex items-center gap-1">
                  <IconUsers className="h-3.5 w-3.5 text-gold" /> Passengers
                </Label>
                <select
                  value={form.pax}
                  onChange={(e) => setForm({ ...form, pax: e.target.value })}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-slate-50 px-3 text-xs font-bold text-navy focus:outline-none focus:border-gold mt-1"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5 People</option>
                  <option value="6">6+ Group</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-black text-navy">Special Requests / Notes</Label>
              <textarea
                rows={3}
                placeholder="Window table requests, dietary needs, hotel pick-up details..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full mt-1 rounded-xl border border-gray-200 p-3 text-xs font-semibold text-navy focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-gold hover:bg-yellow-400 text-navy font-black text-sm shadow-lg shadow-gold/20 cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 className="h-4 w-4 animate-spin" /> Transmitting Request...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IconSend className="h-4 w-4" /> Confirm & Book Activity
                </span>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── SUCCESS DIALOG ─── */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 text-center bg-white border border-gray-100 shadow-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-100 mb-4 shadow-sm">
            <IconShieldCheck className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-black text-navy">Activity Request Sent!</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-2 leading-relaxed">
            Your request for <span className="font-extrabold text-navy">{tour.title}</span> has been saved.
            Confirmation details have been emailed to you.
          </DialogDescription>

          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
            <p className="text-[10px] font-black text-gold uppercase tracking-widest">Need Immediate Assistance?</p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="tel:+41441234567"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 p-2.5 text-xs font-extrabold text-navy hover:bg-slate-50 transition-colors"
              >
                <IconPhoneCall className="h-4 w-4 text-gold" /> Call Concierge
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
