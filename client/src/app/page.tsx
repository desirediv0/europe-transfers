"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { api } from "@/lib/api";
import type { Package, Route, BlogPost } from "@/lib/types";
import CTASection from "@/components/CTASection";
import PackageCard, { PackageCardSkeleton } from "@/components/PackageCard";
import DestinationCard, { DestinationCardSkeleton, type FeaturedCity } from "@/components/DestinationCard";
import {
  IconCar,
  IconPackage,
  IconStar,
  IconArrowRight,
  IconShieldCheck,
  IconClock,
  IconCreditCard,
  IconHeadset,
  IconMapPin,
  IconCheck,
  IconUsers,
  IconBus,
  IconCompass,
  IconUsersGroup,
  IconRoute,
  IconArticle,
  IconCalendar,
} from "@tabler/icons-react";

const HERO_IMAGES = [
  "/images/hero_swiss_alps.png",
  "/images/hero_paris_twilight.png",
  "/images/hero_amalfi_coast.png",
];





const CITY_IMAGE_FALLBACKS: Record<string, string> = {
  london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
  paris: "/images/hero_paris_twilight.png",
  milan: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?q=80&w=1000&auto=format&fit=crop",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop",
  zurich: "/images/hero_swiss_alps.png",
  barcelona: "https://images.unsplash.com/photo-1583422409516-2895a771deda?q=80&w=1000&auto=format&fit=crop",
};

interface LocationSummary {
  id: string;
  name: string;
  city: string;
}

interface FeaturedRoute extends Route {
  routePrices?: { price: number; currency: string; carType: { name: string } }[];
}

interface FeaturedVehicle {
  id: string;
  name: string;
  seats: number;
  image?: string;
  category?: string;
  rate8h: number;
  currency: string;
}

interface FeaturedTour {
  id: string;
  title: string;
  slug: string;
  cityName?: string;
  countryName?: string;
  duration: string;
  priceFrom: number;
  coverImage?: string;
}

export default function HomePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [cities, setCities] = useState<FeaturedCity[]>([]);
  const [featuredRoutes, setFeaturedRoutes] = useState<FeaturedRoute[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<FeaturedVehicle[]>([]);
  const [featuredTours, setFeaturedTours] = useState<FeaturedTour[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [_, setCurrentImageIndex] = useState(0);



  useEffect(() => {
    Promise.all([
      api.get<{ items: Package[] }>("/packages?featured=true&limit=6").catch(() => ({ items: [] })),
      api.get<LocationSummary[]>("/locations/all").catch(() => []),
      api.get<FeaturedRoute[]>("/routes/featured?limit=6").catch(() => []),
      api.get<FeaturedVehicle[]>("/van-coach/all?featured=true").catch(() => []),
      api.get<{ items: FeaturedTour[] }>("/sightseeing?featured=true&limit=6").catch(() => ({ items: [] })),
      api.get<{ items: BlogPost[] }>("/blog/posts?page=1&limit=8&status=PUBLISHED").catch(() => ({ items: [] })),
    ])
      .then(([p, locations, routes, vehicles, tours, blog]) => {
        setPackages(p.items);

        const byCity = new Map<string, number>();
        for (const loc of locations) {
          byCity.set(loc.city, (byCity.get(loc.city) || 0) + 1);
        }
        const featuredCities: FeaturedCity[] = Array.from(byCity.entries())
          .map(([city, locationCount]) => ({
            city,
            locationCount,
            image: CITY_IMAGE_FALLBACKS[city.toLowerCase()] || null,
          }))
          .slice(0, 6);

        setCities(featuredCities);
        setFeaturedRoutes(routes);
        setFeaturedVehicles(vehicles);
        setFeaturedTours(tours.items);
        setBlogPosts(blog.items);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-[#0B1426]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          poster="/images/hero_paris_twilight.png"
        >
          <source
            src="https://desirediv-storage.blr1.cdn.digitaloceanspaces.com/euro/magnific_cinematic-luxury-travel-c_EbrjM7EuuO.mp4"
            type="video/mp4"
          />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,10,20,0.55) 0%, rgba(5,10,20,0.15) 40%, rgba(5,10,20,0.15) 60%, rgba(5,10,20,0.65) 100%)",
          }}
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-between px-4 py-10 sm:py-14 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3.5 py-1 text-[11px] font-bold text-gold border border-gold/40 tracking-widest uppercase mb-2 shadow-lg">
              <IconShieldCheck className="h-3.5 w-3.5 text-gold" />
              The Europe Transfers
            </div>
            <div className="text-[clamp(1.5rem,3.5vw,3.2rem)] font-extrabold text-white tracking-tight leading-tight drop-shadow-lg mb-1">
              TRAVEL EUROPE IN STYLE
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 w-full max-w-md sm:max-w-none">
              <Link href="/private-transfers" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 rounded-full text-sm font-extrabold bg-gold hover:bg-gold-light text-navy shadow-xl shadow-gold/30 hover:shadow-gold/50 transition-all duration-300 uppercase tracking-wide border-2 border-gold"
                >
                  <IconCar className="mr-2 h-5 w-5" /> PRIVATE TRANSFERS
                </Button>
              </Link>
              <Link href="/van-coach" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 rounded-full text-sm font-extrabold bg-black/60 border-2 border-white/80 text-white backdrop-blur-md hover:bg-white hover:text-navy transition-all duration-300 uppercase tracking-wide shadow-xl"
                >
                  <IconClock className="mr-2 h-5 w-5 text-gold" /> VAN & COACH
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Why Choose Us Section */}
      <section className="bg-slate-50/70 py-12 lg:py-16 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Grid: Left title, Right description */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end mb-14">
            <div className="lg:col-span-7">

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy tracking-tight leading-[1.15]">
                Elevate Your Journey With <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-500 to-yellow-600">Unmatched Luxury</span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
                Experience world-class transfer services featuring top-tier Mercedes vehicles, certified professional chauffeurs, and 24/7 concierge assistance across Europe.
              </p>
            </div>
          </div>

          {/* Modern Dribbble-style Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="group relative bg-white border border-gray-200/80 rounded-[1rem] p-7 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold/10 to-transparent rounded-bl-[3rem] pointer-events-auto" />
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-8 transition-transform duration-300 group-hover:scale-110">
                  <IconCar className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div className="text-4xl sm:text-5xl font-black text-navy tracking-tight mb-2">
                  100<span className="text-gold text-3xl sm:text-4xl">%</span>
                </div>
                <h3 className="text-lg font-bold text-navy">Premium Fleet</h3>
              </div>
              <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100 leading-relaxed">
                Hand-picked Mercedes S-Class, V-Class & VIP limousines.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-white border border-gray-200/80 rounded-[1rem] p-7 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-[3rem] pointer-events-auto" />
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-8 transition-transform duration-300 group-hover:scale-110">
                  <IconShieldCheck className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div className="text-4xl sm:text-5xl font-black text-navy tracking-tight mb-2">
                  99.8<span className="text-emerald-500 text-3xl sm:text-4xl">%</span>
                </div>
                <h3 className="text-lg font-bold text-navy">On-Time Guarantee</h3>
              </div>
              <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100 leading-relaxed">
                Flight tracking & licensed professional chauffeurs.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-white border border-gray-200/80 rounded-[1rem] p-7 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-[3rem] pointer-events-auto" />
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-8 transition-transform duration-300 group-hover:scale-110">
                  <IconCreditCard className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div className="text-4xl sm:text-5xl font-black text-navy tracking-tight mb-2">
                  50<span className="text-amber-500 text-3xl sm:text-4xl">+</span>
                </div>
                <h3 className="text-lg font-bold text-navy">European Cities</h3>
              </div>
              <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100 leading-relaxed">
                Direct transfers across Swiss Alps, Paris & Amalfi Coast.
              </p>
            </div>

            {/* Card 4 - Featured Gradient Accent Card */}
            <div className="group relative bg-gradient-to-br from-navy via-[#0F1D38] to-gold/90 rounded-[1rem] p-7 sm:p-8 text-white shadow-xl shadow-navy/20 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-[3rem] pointer-events-auto backdrop-blur-sm" />
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-gold mb-8 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                  <IconHeadset className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
                  24<span className="text-gold text-3xl sm:text-4xl">/7</span>
                </div>
                <h3 className="text-lg font-bold text-white">VIP Support</h3>
              </div>
              <p className="text-xs text-gray-300 mt-6 pt-4 border-t border-white/10 leading-relaxed">
                Dedicated concierge assistance anytime, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="bg-white py-12 lg:py-16 relative overflow-hidden border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Showcase (Left Column) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Image Container */}
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-black/5 bg-navy/5 aspect-[4/5]">
                  <Image
                    src="/images/about_luxury_chauffeur.png"
                    alt="Europe Transfers Luxury Chauffeured Chauffeur"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />

                  {/* Overlay Bottom Content */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gold/90 px-3 py-1 text-[11px] font-bold text-navy uppercase tracking-widest mb-2 shadow-md">
                      <IconShieldCheck className="h-3.5 w-3.5" /> Licensed & Certified
                    </div>
                    <p className="text-xl font-extrabold text-white tracking-tight">
                      First-Class Chauffeured Services
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      Swiss Alps • Paris • Amalfi Coast • Vienna
                    </p>
                  </div>
                </div>

                {/* Floating Experience Badge (Top Right) */}
                <div className="absolute -top-6 -right-4 sm:-right-6 bg-navy text-white rounded-3xl p-5 shadow-2xl border border-gold/30 backdrop-blur-md max-w-[180px] sm:max-w-[200px] transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/20 text-gold">
                      <IconStar className="h-5 w-5 fill-gold text-gold" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-white">10+</span>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-300 leading-tight">
                    Years of Premier Chauffeured Excellence
                  </p>
                </div>

                {/* Floating Satisfaction Badge (Bottom Left) */}
                <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 text-navy rounded-3xl p-4 sm:p-5 shadow-xl border border-gray-200/80 backdrop-blur-md hidden sm:flex items-center gap-4 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                    <IconUsers className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-navy leading-none">15,000+</div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">Happy Global Travelers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Story & Pillars (Right Column) */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold uppercase tracking-widest mb-4">
                <IconShieldCheck className="h-4 w-4 text-gold" />
                About Europe Transfers
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy tracking-tight leading-[1.15] mb-6">
                Redefining Private Chauffeured Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-500 to-yellow-600">Across Europe</span>
              </h2>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal mb-8">
                Founded with a commitment to uncompromised luxury and punctuality, Europe Transfers delivers bespoke private transfer solutions, airport chauffeuring, and scenic inter-city tours across Europe&apos;s most iconic destinations.
              </p>

              {/* 3 Core Pillars List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                <div className="bg-slate-50 border border-gray-200/70 rounded-2xl p-5 hover:bg-slate-100/80 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10 text-navy mb-3">
                    <IconCar className="h-5 w-5 text-navy" />
                  </div>
                  <h3 className="text-sm font-bold text-navy mb-1">Tailored Fleet</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Premium Mercedes S-Class, E-Class & V-Class vans.
                  </p>
                </div>

                <div className="bg-slate-50 border border-gray-200/70 rounded-2xl p-5 hover:bg-slate-100/80 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold mb-3">
                    <IconClock className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="text-sm font-bold text-navy mb-1">Flight Tracking</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Zero waiting times with live airport tracking.
                  </p>
                </div>

                <div className="bg-slate-50 border border-gray-200/70 rounded-2xl p-5 hover:bg-slate-100/80 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-3">
                    <IconCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-navy mb-1">Fixed Pricing</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Transparent all-inclusive rates with zero hidden fees.
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/private-transfers">
                  <Button
                    size="lg"
                    className="h-12 px-7 rounded-xl text-sm font-bold bg-navy hover:bg-navy/90 text-white shadow-xl shadow-navy/20 transition-all duration-300"
                  >
                    Explore Our Fleet <IconArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-7 rounded-xl text-sm font-bold border-gray-300 text-navy hover:bg-gray-50 transition-all duration-300"
                  >
                    Contact Concierge
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages Section */}
      <section className="bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 py-12 lg:py-16 relative overflow-hidden border-b border-gray-100">
        {/* Subtle Ambient Glow Spheres */}
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Layout */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold uppercase tracking-widest mb-4">
                <IconPackage className="h-4 w-4 text-gold" />
                Curated Travel Experiences
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy tracking-tight leading-[1.15]">
                Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-500 to-yellow-600">Tour Packages</span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                Hand-picked luxury travel itineraries across Europe, designed for uncompromised comfort, scenic beauty, and memorable journeys.
              </p>
            </div>

            <Link
              href="/packages"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy px-6 py-3.5 text-sm font-bold shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:-translate-y-0.5 transition-all duration-300 self-start md:self-auto flex-shrink-0"
            >
              Explore All Packages <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Cards Carousel Container: 2 cards visible on mobile (basis-1/2), 3 cards on desktop (basis-1/3) */}
          <Carousel opts={{ align: "start", loop: true }} className="w-full relative px-1 sm:px-0">
            <CarouselContent className="-ml-2 md:-ml-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <CarouselItem key={i} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3">
                    <PackageCardSkeleton />
                  </CarouselItem>
                ))
                : packages.map((pkg) => (
                  <CarouselItem key={pkg.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3">
                    <PackageCard package={pkg} />
                  </CarouselItem>
                ))}
            </CarouselContent>

            {/* Navigation Arrows for Carousel */}
            <div className="flex items-center justify-end gap-2 mt-6">
              <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-xl bg-white border border-gray-200 text-navy hover:bg-gold hover:border-gold transition-all shadow-md cursor-pointer" />
              <CarouselNext className="static translate-y-0 h-10 w-10 rounded-xl bg-white border border-gray-200 text-navy hover:bg-gold hover:border-gold transition-all shadow-md cursor-pointer" />
            </div>
          </Carousel>

          {/* Bottom Custom Multi-City Banner */}
          <div className="mt-16 bg-navy text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 text-center sm:text-left">
              <span className="inline-block rounded-full bg-gold/20 text-gold px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
                Custom Itineraries
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">Need a Multi-City Private Transfer Package?</h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
                Our concierge team crafts custom multi-country European routes tailored to your schedule and preferences.
              </p>
            </div>
            <Link href="/contact" className="relative z-10 flex-shrink-0">
              <Button size="lg" className="rounded-xl px-7 py-3 text-xs sm:text-sm font-bold bg-gold hover:bg-gold-light text-navy shadow-md">
                Request Custom Itinerary
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Routes Section (admin-controlled per-item) */}
      {featuredRoutes.length > 0 && (
        <section className="bg-white py-12 lg:py-16 relative overflow-hidden border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold uppercase tracking-widest mb-4">
                  <IconRoute className="h-4 w-4 text-gold" />
                  Popular Transfer Routes
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy tracking-tight leading-[1.15]">
                  Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-500 to-yellow-600">Routes</span>
                </h2>
              </div>
              <Link
                href="/private-transfers"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy px-6 py-3.5 text-sm font-bold shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:-translate-y-0.5 transition-all duration-300 self-start md:self-auto flex-shrink-0"
              >
                See All Routes <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRoutes.map((route) => {
                const minPrice = route.routePrices?.length
                  ? Math.min(...route.routePrices.map((rp) => Number(rp.price)))
                  : null;
                return (
                  <Link
                    key={route.id}
                    href="/private-transfers"
                    className="group bg-white border border-gray-200/80 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy mb-4 group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                      <IconRoute className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-black text-navy leading-snug">
                      {route.fromLocation?.name} <span className="text-gold mx-1">→</span> {route.toLocation?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{route.fromLocation?.city} to {route.toLocation?.city}</p>
                    {minPrice !== null && (
                      <p className="text-sm font-bold text-gold mt-3">From €{minPrice.toFixed(0)}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Van & Coach Section (admin-controlled per-item) */}
      {featuredVehicles.length > 0 && (
        <section className="bg-slate-50/70 py-12 lg:py-16 relative overflow-hidden border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold uppercase tracking-widest mb-4">
                  <IconBus className="h-4 w-4 text-gold" />
                  Vehicle Disposal
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy tracking-tight leading-[1.15]">
                  Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-500 to-yellow-600">Van & Coach</span>
                </h2>
              </div>
              <Link
                href="/van-coach"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy px-6 py-3.5 text-sm font-bold shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:-translate-y-0.5 transition-all duration-300 self-start md:self-auto flex-shrink-0"
              >
                See All Vehicles <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <Link
                  key={vehicle.id}
                  href="/van-coach"
                  className="group bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-40 bg-navy/5">
                    {vehicle.image ? (
                      <img src={vehicle.image} alt={vehicle.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <IconBus className="h-10 w-10 text-navy/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-black text-navy">{vehicle.name}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                      <IconUsersGroup className="h-3.5 w-3.5 text-gold" /> {vehicle.seats} seats {vehicle.category ? `· ${vehicle.category}` : ""}
                    </p>
                    <p className="text-sm font-bold text-gold mt-3">{vehicle.currency} {Number(vehicle.rate8h).toFixed(0)} / 8h</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Sightseeing Section (admin-controlled per-item) */}
      {featuredTours.length > 0 && (
        <section className="bg-white py-12 lg:py-16 relative overflow-hidden border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold uppercase tracking-widest mb-4">
                  <IconCompass className="h-4 w-4 text-gold" />
                  Tours & Activities
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy tracking-tight leading-[1.15]">
                  Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-500 to-yellow-600">Sightseeing</span>
                </h2>
              </div>
              <Link
                href="/sightseeing"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy px-6 py-3.5 text-sm font-bold shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:-translate-y-0.5 transition-all duration-300 self-start md:self-auto flex-shrink-0"
              >
                See All Tours <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTours.map((tour) => (
                <Link
                  key={tour.id}
                  href={`/sightseeing/${tour.slug}`}
                  className="group bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-40 bg-navy/5">
                    {tour.coverImage ? (
                      <img src={tour.coverImage} alt={tour.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <IconCompass className="h-10 w-10 text-navy/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-black text-navy leading-snug">{tour.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{tour.cityName}{tour.countryName ? `, ${tour.countryName}` : ""} · {tour.duration}</p>
                    <p className="text-sm font-bold text-gold mt-3">From €{Number(tour.priceFrom).toFixed(0)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Destinations Carousel Section */}
      <section className="bg-slate-100/60 py-12 lg:py-16 relative overflow-hidden border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Layout (Top Left: Heading, Top Right: Subtitle) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end mb-14">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3.5 py-1 text-xs font-bold text-gold uppercase tracking-widest mb-3">
                <IconMapPin className="h-4 w-4 text-gold" />
                Featured Cities
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy tracking-tight leading-[1.15]">
                Top Destinations
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                From alpine retreats to historic European capitals, discover where your next private chauffeured journey will take you.
              </p>
            </div>
          </div>

          {/* Carousel Slider Track: 2 cards visible on mobile (basis-1/2), 4 cards on desktop (basis-1/4) */}
          <Carousel opts={{ align: "start", loop: true }} className="w-full relative px-1 sm:px-0">
            <CarouselContent className="-ml-2 md:-ml-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <CarouselItem key={i} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4">
                    <DestinationCardSkeleton />
                  </CarouselItem>
                ))
                : cities.map((city) => (
                  <CarouselItem key={city.city} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4">
                    <DestinationCard city={city} />
                  </CarouselItem>
                ))}
            </CarouselContent>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between pt-6 mt-2">
              <Link href="/rates">
                <Button
                  size="lg"
                  className="h-11 sm:h-12 px-5 sm:px-7 rounded-xl text-xs sm:text-sm font-bold bg-navy hover:bg-gold hover:text-navy text-white shadow-lg shadow-navy/15 transition-all duration-300 cursor-pointer"
                >
                  View More <IconArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>

              {/* Navigation Arrow Controls */}
              <div className="flex items-center gap-2">
                <CarouselPrevious className="static translate-y-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white border border-gray-200 text-navy shadow-md hover:bg-navy hover:text-white transition-all cursor-pointer" />
                <CarouselNext className="static translate-y-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white border border-gray-200 text-navy shadow-md hover:bg-navy hover:text-white transition-all cursor-pointer" />
              </div>
            </div>
          </Carousel>
        </div>
      </section>

      {/* Why Choose Us Section (Bento Grid Layout) */}
      <section className="bg-white py-12 lg:py-16 relative overflow-hidden border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header Layout */}
          <div className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3.5 py-1 text-xs font-bold text-gold uppercase tracking-widest mb-3">
              <IconShieldCheck className="h-4 w-4 text-gold" />
              Unmatched Quality
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy tracking-tight leading-[1.15]">
              Why Choose us
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              Dedicated chauffeurs, luxury fleet, flight tracking, and 24/7 concierge assistance to ensure your European journey is effortless.
            </p>
          </div>

          {/* Bento Asymmetric Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Left Bento Cards (8 columns) */}
            <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Card 1 - Solid Royal Blue Card */}
              <div className="group relative bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-navy rounded-[2rem] p-7 sm:p-8 text-white shadow-xl shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-[3rem] pointer-events-none" />
                <div>
                  <div className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
                    99.8%
                  </div>
                </div>
                <div className="pt-6 border-t border-white/20 mt-8">
                  <p className="text-sm font-bold text-white/95">Client Satisfaction</p>
                </div>
              </div>

              {/* Card 2 - Light Soft Stat Card */}
              <div className="group relative bg-slate-50 border border-gray-200/80 rounded-[2rem] p-7 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="text-4xl sm:text-5xl font-black tracking-tight text-navy mb-2">
                    120<span className="text-gold">+</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200/80 mt-8">
                  <p className="text-sm font-bold text-navy">European Cities Covered</p>
                </div>
              </div>

              {/* Card 3 - Light Soft 24/7 Support Card */}
              <div className="group relative bg-slate-50 border border-gray-200/80 rounded-[2rem] p-7 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="text-4xl sm:text-5xl font-black tracking-tight text-blue-600 mb-2">
                    24/7
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200/80 mt-8">
                  <p className="text-sm font-bold text-navy">Concierge Support Available</p>
                </div>
              </div>

              {/* Card 4 - Quote / Mission Statement Card */}
              <div className="group relative bg-slate-50 border border-gray-200/80 rounded-[2rem] p-7 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
                <div>
                  <p className="text-xs font-bold text-navy uppercase tracking-wider mb-2">
                    Building Lasting Journeys
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium italic">
                    &ldquo;Your comfort is our mission — we don&apos;t just deliver transfers, we craft luxury travel memories.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200/80 mt-4">
                  <p className="text-xs font-bold text-gray-400">Europe Transfers Concierge</p>
                </div>
              </div>

            </div>

            {/* Right Column - Tall Vertical Photo Card (5 columns) */}
            <div className="lg:col-span-5 xl:col-span-4 min-h-[380px] lg:min-h-full">
              <div className="group relative h-full min-h-[380px] w-full rounded-[2rem] overflow-hidden border border-gray-200/80 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                <img
                  src="/images/why_choose_us_chauffeur.png"
                  alt="Professional VIP Chauffeur"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />

                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                  <span className="inline-block rounded-full bg-gold/90 text-navy px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest mb-2 shadow-md">
                    First-Class Chauffeurs
                  </span>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    Dedicated VIP Chauffeurs
                  </h3>
                  <p className="text-xs text-gray-300 mt-1.5 leading-relaxed font-normal">
                    Licensed & certified professionals trained in luxury hospitality, flight tracking, and English fluency.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Latest From The Blog Section */}
      {blogPosts.length > 0 && (
        <section className="bg-slate-50/70 py-12 lg:py-16 relative overflow-hidden border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold uppercase tracking-widest mb-4">
                  <IconArticle className="h-4 w-4 text-gold" />
                  Travel Guides & Insights
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy tracking-tight leading-[1.15]">
                  Latest From The <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-500 to-yellow-600">Blog</span>
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy px-6 py-3.5 text-sm font-bold shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:-translate-y-0.5 transition-all duration-300 self-start md:self-auto flex-shrink-0"
              >
                View All Articles <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {blogPosts.slice(0, 8).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white border border-gray-200/80 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-24 sm:h-28 bg-navy/5">
                    {post.coverImage ? (
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy to-navy/70">
                        <IconArticle className="h-6 w-6 text-gold/60" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-navy leading-snug line-clamp-2 group-hover:text-gold transition-colors">
                      {post.title}
                    </p>
                    {post.publishedAt && (
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                        <IconCalendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reusable Dribbble-Style CTA Section */}
      <CTASection />
    </div>
  );
}
