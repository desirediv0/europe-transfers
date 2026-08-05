"use client";

import { useState } from "react";
import Link from "next/link";
import type { SeoPage, FaqItem } from "@/lib/types";
import {
  ChevronDown,
  CheckCircle2,
  Shield,
  Car,
  MapPin,
  Award,
  PhoneCall,
  Clock,
  Send,
  Users,
  Sparkles,
  ChevronRight,
  Home,
  Check,
} from "lucide-react";

interface Props {
  pageData: SeoPage;
}

export default function SeoPageClient({ pageData }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First FAQ open by default

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqsList: FaqItem[] = Array.isArray(pageData.faqs) ? pageData.faqs : [];

  const faqJsonLd =
    faqsList.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqsList.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Schema.org FAQ JSON-LD */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Hero Header Banner */}
      <section className="relative bg-[#0F1A2E] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decorative Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A227]/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1B2A4A]/50 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40 uppercase tracking-widest shadow-sm">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-[#C9A227]" />
            {pageData.linkedCategory || "EUROPE B2B DMC & TRANSFERS"}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
            {pageData.title}
          </h1>

          {pageData.pageDescription && (
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {pageData.pageDescription}
            </p>
          )}

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap gap-4 justify-center">
            <Link
              href="/results"
              className="bg-[#C9A227] hover:bg-[#b08d1e] text-[#0F1A2E] font-extrabold text-sm sm:text-base px-8 py-4 rounded-xl shadow-xl transition-all transform hover:scale-105 flex items-center"
            >
              Get Instant B2B Quote <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base px-7 py-4 rounded-xl border border-white/20 transition-all flex items-center"
            >
              <PhoneCall className="mr-2 h-4 w-4 text-[#C9A227]" /> Contact Travel Desk
            </Link>
          </div>
        </div>

        {/* Decorative Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H0Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <ol className="flex items-center space-x-2 text-xs text-slate-500 font-medium overflow-x-auto">
            <li>
              <Link href="/" className="hover:text-[#0F1A2E] flex items-center transition-colors">
                <Home className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 mx-1" />
              <Link href="/seo-pages" className="hover:text-[#0F1A2E] transition-colors">
                Destinations
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 mx-1" />
              <span className="text-[#0F1A2E] font-bold line-clamp-1">{pageData.title}</span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section 1: Overview & Regional Services */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-[#C9A227] uppercase tracking-widest block">
              Destination Management Services
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F1A2E] tracking-tight">
              About Our DMC Services
            </h2>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base sm:text-lg whitespace-pre-line font-sans">
            {pageData.pageDescription ||
              `Europe Transfers is a leading Europe Destination Management Company (DMC) specializing in complete B2B travel solutions for travel agents, wholesalers, and tour operators. From private luxury transfers and FIT packages to group tour transportation and MICE operations, we deliver top-rated ground handling across Europe.`}
          </div>

        </section>

        {/* Section 2: Why Travel Agents Choose Europe Transfers */}
        {pageData.cityContent && (
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-[#C9A227] uppercase tracking-widest block">
                Regional Partner Advantage
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F1A2E] tracking-tight flex items-center">
                <MapPin className="h-7 w-7 text-[#C9A227] mr-3 shrink-0" /> Why Travel Partners Choose Europe Transfers
              </h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base sm:text-lg whitespace-pre-line font-sans">
              {pageData.cityContent}
            </div>
          </section>
        )}

        {/* Section 3: Trust Signals Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-[#C9A227] uppercase tracking-widest block">
              Why Choose Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1A2E]">
              Why Choose Europe Transfers as Your DMC Partner
            </h2>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0F1A2E]/5 text-[#0F1A2E] flex items-center justify-center shrink-0 border border-[#0F1A2E]/10">
                <Award className="h-6 w-6 text-[#C9A227]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-[#0F1A2E] text-lg">8+ Years of B2B Expertise</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Trusted by 5,000+ travel agents worldwide for reliable Europe transfer operations and custom itineraries.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0F1A2E]/5 text-[#0F1A2E] flex items-center justify-center shrink-0 border border-[#0F1A2E]/10">
                <Shield className="h-6 w-6 text-[#C9A227]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-[#0F1A2E] text-lg">Best Wholesale B2B Rates</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Competitive net rates guaranteed with strong profit margins for travel agencies and tour operators.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0F1A2E]/5 text-[#0F1A2E] flex items-center justify-center shrink-0 border border-[#0F1A2E]/10">
                <Car className="h-6 w-6 text-[#C9A227]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-[#0F1A2E] text-lg">150+ European Destinations</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Licensed fleet covering France, Switzerland, Italy, Scandinavia, UK, Austria, and Eastern Europe.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0F1A2E]/5 text-[#0F1A2E] flex items-center justify-center shrink-0 border border-[#0F1A2E]/10">
                <Clock className="h-6 w-6 text-[#C9A227]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-[#0F1A2E] text-lg">24/7 Ground Operations Support</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Dedicated concierge desk, live flight tracking, and instant dispatch management for smooth travel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Additional Content & Key Highlights */}
        {pageData.additionalSeoContent && (
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-[#C9A227] uppercase tracking-widest block">
                Complete Coverage
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F1A2E] tracking-tight">
                Comprehensive Europe DMC Services
              </h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base sm:text-lg whitespace-pre-line font-sans">
              {pageData.additionalSeoContent}
            </div>
          </section>
        )}

        {/* Section 5: How Our B2B DMC Model Works (4-Step Workflow) */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-[#C9A227] uppercase tracking-widest block">
              Seamless Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1A2E]">
              How Our B2B DMC Model Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Simple 4-step process for travel agents to book private transfers and tour packages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 relative">
              <div className="w-14 h-14 rounded-2xl bg-[#0F1A2E] text-[#C9A227] font-black text-xl flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="font-bold text-[#0F1A2E] text-base">Send Enquiry</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Share client itinerary details, passenger counts, and travel dates.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 relative">
              <div className="w-14 h-14 rounded-2xl bg-[#0F1A2E] text-[#C9A227] font-black text-xl flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="font-bold text-[#0F1A2E] text-base">Custom Quote</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get instant wholesale B2B net rates with vehicle options.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 relative">
              <div className="w-14 h-14 rounded-2xl bg-[#0F1A2E] text-[#C9A227] font-black text-xl flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="font-bold text-[#0F1A2E] text-base">Booking Voucher</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant confirmation vouchers with driver details and meeting points.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 relative">
              <div className="w-14 h-14 rounded-2xl bg-[#0F1A2E] text-[#C9A227] font-black text-xl flex items-center justify-center mx-auto shadow-md">
                4
              </div>
              <h3 className="font-bold text-[#0F1A2E] text-base">Ground Execution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless transfer execution with 24/7 on-ground dispatch monitoring.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Interactive FAQ Accordion */}
        {faqsList.length > 0 && (
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-[#C9A227] uppercase tracking-widest block">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F1A2E]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqsList.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-5 text-left font-bold text-[#0F1A2E] text-base sm:text-lg flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span className="pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-[#C9A227]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-6 pt-2 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 7: Bottom CTA Banner */}
        <section className="bg-gradient-to-r from-[#0F1A2E] via-[#1B2A4A] to-[#0F1A2E] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-black">
            Partner with Europe Transfers for Europe DMC Services
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Get preferred B2B wholesale rates, instant booking access, and dedicated account management for your agency.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 justify-center">
            <Link
              href="/results"
              className="bg-[#C9A227] hover:bg-[#b08d1e] text-[#0F1A2E] font-extrabold text-sm sm:text-base px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              Search Rates & Transfers
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base px-7 py-4 rounded-xl border border-white/20 transition-all"
            >
              Register Agency Partner
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
