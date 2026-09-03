"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IconCheck, IconX, IconArrowRight, IconSparkles, IconShieldCheck } from "@tabler/icons-react";

interface RebrandAnnouncementModalProps {
  onExplore?: () => void;
}

const DISMISSED_KEY = "rebrand-announcement-dismissed";

export default function RebrandAnnouncementModal({ onExplore }: RebrandAnnouncementModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Show once ever per browser - stays hidden after the visitor
    // closes it, even across tabs/visits, until they clear site data.
    let alreadyDismissed = false;
    try {
      alreadyDismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    } catch {
      // localStorage unavailable (private mode, blocked cookies, etc.) -
      // fall back to showing it, same as before.
    }
    if (alreadyDismissed) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // ignore - worst case it shows again next visit
    }
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
    }, 250);
  };

  const handleExplore = () => {
    handleClose();
    if (onExplore) {
      onExplore();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-title"
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 transition-all duration-300 ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Dark Luxury Backdrop Blur */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border border-gold/40 bg-gradient-to-b from-[#1c2f52] via-[#182642] to-[#131f38] text-white shadow-[0_25px_70px_rgba(0,0,0,0.6),0_0_50px_rgba(201,162,39,0.18)] overflow-hidden z-10 transition-all duration-300 ${
          isAnimatingOut ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{
          animation: isAnimatingOut ? undefined : "modalPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Subtle Luxury Ambient Glow Accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-navy-light/40 blur-2xl" />

        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-gold to-yellow-300 shrink-0" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close Announcement"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border border-white/15 transition-all duration-200 hover:scale-105"
        >
          <IconX className="h-5 w-5" />
        </button>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-7 space-y-5">
          {/* Header Badge & Tagline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/30 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-gold shadow-sm">
              <IconSparkles className="h-3.5 w-3.5 text-gold" />
              <span>Official Announcement</span>
            </div>

            {/* A NEW NAME. THE SAME TRUST. */}
            <div className="pt-1">
              <p className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-gold/90">
                A NEW NAME.
              </p>
              <p className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-gold">
                THE SAME TRUST.
              </p>
            </div>
          </div>

          {/* Transformation Showcase Card: GYF HOLIDAYS PVT LTD IS NOW THE EUROPE TRANSFERS PVT LTD */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 backdrop-blur-sm shadow-inner">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              {/* Previous Brand */}
              <div className="flex-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                  Formerly Known As
                </span>
                <span className="text-base sm:text-lg font-black text-gray-300 line-through decoration-gold/60 decoration-2">
                  GYF HOLIDAYS PVT LTD
                </span>
              </div>

              {/* Transition Badge */}
              <div className="shrink-0 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold text-navy text-[11px] font-black uppercase tracking-wider shadow-md">
                  IS NOW
                </span>
              </div>

              {/* New Brand */}
              <div className="flex-1 text-center sm:text-right">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gold block mb-0.5">
                  Our New Identity
                </span>
                <span className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-100 to-gold">
                  THE EUROPE TRANSFERS PVT LTD
                </span>
              </div>
            </div>

            {/* Brand Logo Display */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center">
              <div className="relative h-14 w-56 sm:h-16 sm:w-64 rounded-xl bg-white p-2.5 shadow-lg ring-1 ring-white/20">
                <Image
                  src="/logo-2.jpeg"
                  alt="The Europe Transfers"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
            </div>
          </div>

          {/* What's New Highlight Banner */}
          <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/15 via-amber-500/10 to-gold/5 p-4 sm:p-4.5 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gold/20 text-gold">
                <IconSparkles className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gold">
                What’s New?
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm font-semibold text-slate-100">
              <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 border border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <span>An easy reachout</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 border border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <span>Book online 24/7</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 border border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <span className="font-extrabold text-gold">The Europe Transfers PORTAL</span>
              </div>
            </div>
          </div>

          {/* Announcement Story Paragraphs */}
          <div className="space-y-2.5 text-xs sm:text-sm text-gray-300 leading-relaxed">
            <p>
              We are excited to announce the transformation of{" "}
              <strong className="text-white font-bold">GYF Holidays Pvt Ltd</strong> into{" "}
              <strong className="text-gold font-bold">The Europe Transfers Pvt Ltd</strong>.
            </p>
            <p>
              With years of experience in European travel, transfers and destination management, we are taking the next step with a new identity designed around our expertise in{" "}
              <span className="text-white font-semibold">Europe, UK & Scandinavia</span>.
            </p>
          </div>

          {/* What Remains The Same? Checklist Section */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-4.5 space-y-3">
            <div className="flex items-center gap-2">
              <IconShieldCheck className="h-4 w-4 text-gold" />
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                What remains the same?
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                "Our experienced team",
                "Our trusted European network",
                "Our commitment to service",
                "Our B2B travel partnerships",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 rounded-xl bg-black/20 px-3 py-2 border border-white/5 text-xs sm:text-sm text-gray-200"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
                    <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleExplore}
              className="w-full group relative flex items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-navy shadow-xl shadow-gold/25 transition-all duration-300 hover:shadow-gold/45 hover:scale-[1.01] hover:brightness-105 active:scale-[0.99]"
            >
              <span>EXPLORE THE EUROPE TRANSFERS</span>
              <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalPopIn {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
