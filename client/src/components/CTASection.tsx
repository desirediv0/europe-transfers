"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  bannerText?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function CTASection({
  title = "Luxury Travel That Works Around You",
  subtitle = "Our professional chauffeurs handle every detail so you can relax and focus on what matters.",
  imageSrc = "/images/cta_luxury_banner.png",
  bannerText = "READY FOR A FIRST-CLASS JOURNEY ACROSS EUROPE?",
  buttonText = "Book a Transfer",
  buttonLink = "/private-transfers",
}: CTASectionProps) {
  return (
    <section className="py-12 lg:py-16 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main CTA Card Container */}
        <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-navy p-7 sm:p-12 lg:p-16 text-white shadow-2xl border border-white/10 min-h-[460px] flex flex-col justify-between">
          {/* Background Cover Image with Soft Dark Overlay */}
          <img
            src={imageSrc}
            alt="Europe Transfers CTA"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-65 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/50 to-black/75" />

          {/* Top Row: Left Headline & Subtitle, Right Services Stack */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12 lg:mb-16">
            {/* Left Headline */}
            <div className="lg:col-span-8 max-w-2xl">
              <h2 className="text-3xl sm:text-5xl  font-black tracking-tight text-white leading-[1.1]">
                {title}
              </h2>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-300 max-w-lg leading-relaxed font-medium">
                {subtitle}
              </p>
            </div>

            {/* Right Services List Stack (Matching Reference) */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center space-y-2 lg:text-right">
              {[
                "AIRPORT TRANSFERS",
                "INTERCITY TRANSFERS",
                "CHAUFFEUR BY HOUR",
                "TOUR PACKAGES",
              ].map((service) => (
                <div
                  key={service}
                  className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-gray-300/80 hover:text-gold transition-colors py-1 cursor-pointer flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block lg:hidden" />
                  {service}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row: Full Gold/Yellow Pill Banner (Matching Reference Image) */}
          <div className="relative z-10 bg-gold rounded-3xl p-2.5 sm:p-3.5 pl-6 sm:pl-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-gold-light/40">
            {/* Banner Left Text */}
            <div className="text-navy font-black text-xs sm:text-sm md:text-base uppercase tracking-wider text-center sm:text-left">
              {bannerText}
            </div>

            {/* Banner Right Pill Button */}
            <Link href={buttonLink} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto rounded-xl bg-navy hover:bg-[#060D1A] text-gold hover:text-white px-8 py-3.5 text-xs sm:text-sm font-extrabold shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer">
                {buttonText} <IconArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
