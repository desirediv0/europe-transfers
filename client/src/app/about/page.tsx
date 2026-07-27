"use client";

import Link from "next/link";
import TeamShowcase from "@/components/ui/team-showcase";
import CTASection from "@/components/CTASection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCar,
  IconShieldCheck,
  IconClock,
  IconSparkles,
  IconCheck,
  IconArrowRight,
  IconAward,
  IconMapPin,
} from "@tabler/icons-react";

const stats = [
  { value: "15,000+", label: "Travelers Chauffeured", tag: "Trusted Choice" },
  { value: "120+", label: "European Cities Covered", tag: "Multi-Country" },
  { value: "99.8%", label: "Punctuality & Safety Rate", tag: "Excellence" },
  { value: "24/7", label: "Live Dispatch Support", tag: "Always Available" },
];

const pillars = [
  {
    icon: IconShieldCheck,
    title: "Vetted Professional Chauffeurs",
    desc: "Every driver undergoes rigorous background checks, defensive driving certifications, and English fluency training for absolute peace of mind.",
  },
  {
    icon: IconCar,
    title: "First-Class Mercedes-Benz Fleet",
    desc: "Travel in pristine, current-model Mercedes S-Class sedans, E-Class executive cars, and spacious V-Class passenger vans equipped with Wi-Fi & AC.",
  },
  {
    icon: IconSparkles,
    title: "Fixed Transparent Pricing",
    desc: "Zero meter surprises, hidden baggage fees, or surge pricing. What you see is what you pay with full transparency on every route.",
  },
  {
    icon: IconClock,
    title: "Flight Tracking & Wait Guarantee",
    desc: "We monitor flight schedules in real time. Airport pickups include 60 minutes of complimentary waiting time with personalized meet & greet.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-slate-50/50 min-h-screen font-sans">
      
      {/* Luxury Hero Banner with High Contrast Geometric Grid Overlay */}
      <section className="relative bg-[#060C17] text-white overflow-hidden border-b border-white/10">
        
        {/* Prominent High-Contrast Grid SVG Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden z-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="about-hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C9A227" strokeWidth="0.8" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#about-hero-grid)" />
            
            {/* Glowing European Route Doodle Curves */}
            <path d="M100 150 Q 400 50, 700 200 T 1300 150" stroke="#C9A227" strokeWidth="2.5" strokeDasharray="8 8" />
            <path d="M200 350 Q 650 220, 1100 380" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 6" />

            {/* Glowing Destination City Pins (Paris, Zurich, Rome, Milan) */}
            <circle cx="400" cy="85" r="7" fill="#C9A227" />
            <circle cx="400" cy="85" r="16" stroke="#C9A227" strokeWidth="1.5" opacity="0.6" />
            <circle cx="700" cy="200" r="8" fill="#C9A227" />
            <circle cx="700" cy="200" r="18" stroke="#C9A227" strokeWidth="1.5" opacity="0.6" />
            <circle cx="1100" cy="380" r="7" fill="#3B82F6" />
          </svg>
        </div>

        {/* Ambient Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold/15 rounded-full blur-[140px] pointer-events-none z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none z-10" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#0B1426]/85 to-[#060C17] z-10" />
        
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4.5 py-1.5 text-xs font-black text-gold uppercase tracking-widest mb-6 border border-gold/30 backdrop-blur-md shadow-md">
            <IconAward className="h-4 w-4 text-gold" />
            First-Class European Chauffeuring
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Redefining Private Chauffeuring & <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-400 to-yellow-500">VIP Transfers</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-normal">
            From airport arrivals in Paris and Zurich to scenic alpine intercity rides and custom tour packages, <strong className="text-white font-semibold">The Europe Transfers</strong> delivers uncompromised safety, punctuality, and comfort across 120+ European destinations.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/fleet">
              <Button size="lg" className="rounded-xl px-8 py-4 text-xs sm:text-sm font-extrabold bg-gold hover:bg-gold-light text-navy shadow-xl shadow-gold/25 transition-all cursor-pointer">
                Explore Our Fleet <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <button className="rounded-xl px-8 py-4 text-xs sm:text-sm font-extrabold border border-white/30 bg-white/10 text-white hover:bg-gold hover:text-navy transition-all cursor-pointer shadow-md backdrop-blur-md">
                Contact Concierge
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200/80 shadow-xs relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{stat.tag}</span>
                <p className="text-3xl sm:text-4xl font-black text-navy tracking-tight">{stat.value}</p>
                <p className="text-xs font-semibold text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story & Mission Section (Bento Layout) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12 items-center mb-16">
          <div className="lg:col-span-6 space-y-5">
            <Badge className="rounded-full bg-gold/15 text-gold border border-gold/30 px-3.5 py-1 text-xs font-black uppercase tracking-widest">
              Our Journey & Standard
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy tracking-tight leading-[1.15]">
              Built for Travelers Who Value <span className="text-gold">Time & Comfort</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
              Founded with the vision to eliminate stress from long-distance European travel, Europe Transfers has grown into a premier chauffeured transfer network. Whether for corporate executives, holidaying families, or VIP tour groups, we ensure every leg of your journey is executed with precision.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                "Complimentary 60 minutes airport waiting time",
                "Clean, non-smoking Mercedes-Benz vehicles",
                "English-speaking professional drivers",
                "24/7 dedicated flight dispatch team",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-navy">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-gold flex-shrink-0">
                    <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-2xl h-[380px] sm:h-[440px] group border border-gray-200/80">
            <img
              src="/images/why_choose_us_chauffeur.png"
              alt="Chauffeur Excellence"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white z-10">
              <Badge className="rounded-full bg-gold text-navy font-black text-xs mb-2">99.8% Client Rating</Badge>
              <h3 className="text-xl font-extrabold text-white">Chauffeured Across 120+ Cities</h3>
              <p className="text-xs text-gray-300 mt-1">Paris • Zurich • Milan • Rome • Munich • Vienna</p>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-8">
          {pillars.map((pillar) => (
            <Card
              key={pillar.title}
              className="border border-gray-200/80 bg-white rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:border-gold/40 hover:-translate-y-1"
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-navy font-bold">
                  <pillar.icon className="h-6 w-6 text-navy" />
                </div>
                <h3 className="text-base font-extrabold text-navy leading-snug">{pillar.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">{pillar.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Leadership & Chauffeur Team Showcase Section */}
      <section className="bg-white border-t border-b border-gray-200/80 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TeamShowcase />
        </div>
      </section>

      {/* Fleet Standards Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="bg-[#060C17] text-white rounded-3xl p-8 sm:p-12 border border-gold/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block rounded-full bg-gold/20 text-gold px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              Fleet Excellence
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Need a Private Custom Tour?</h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
              Our travel desk designs bespoke multi-day European itineraries for private families, VIP delegations, and leisure travelers.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3.5 flex-shrink-0">
            <Link href="/packages">
              <Button size="lg" className="rounded-xl px-7 py-3.5 text-xs sm:text-sm font-extrabold bg-gold hover:bg-gold-light text-navy shadow-md cursor-pointer">
                View Tour Packages
              </Button>
            </Link>
            <Link href="/contact">
              <button className="rounded-xl px-7 py-3.5 text-xs sm:text-sm font-extrabold border border-white/30 bg-white/10 text-white hover:bg-gold hover:text-navy transition-all cursor-pointer shadow-md">
                Request Custom Quote
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reusable CTA Section */}
      <CTASection
        title="Ready to Experience Premium European Chauffeuring?"
        subtitle="Book your private airport transfer, intercity ride, or tour package with instant confirmation."
        bannerText="24/7 Chauffeured Transfers Across France, Switzerland, Italy & Spain"
        buttonText="Book Your Journey"
        buttonLink="/fleet"
      />

    </div>
  );
}
