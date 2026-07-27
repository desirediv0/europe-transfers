"use client";

import Link from "next/link";
import type { Package } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconMapPin,
  IconCalendar,
  IconStar,
  IconCar,
} from "@tabler/icons-react";

interface PackageCardProps {
  package?: Package;
  loading?: boolean;
}

const gradientPairs = [
  ["from-rose-400", "to-orange-400"],
  ["from-violet-500", "to-purple-500"],
  ["from-blue-400", "to-cyan-400"],
  ["from-emerald-400", "to-teal-500"],
  ["from-amber-400", "to-yellow-500"],
  ["from-pink-400", "to-rose-500"],
];

function hashGradient(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  return gradientPairs[Math.abs(hash) % gradientPairs.length];
}

export function PackageCardSkeleton() {
  return (
    <div className="rounded-[1.5rem] sm:rounded-[2.2rem] border border-gray-200/80 bg-white p-2.5 sm:p-4 shadow-sm space-y-3 sm:space-y-4">
      <Skeleton className="h-36 sm:h-56 w-full rounded-[1.2rem] sm:rounded-[1.8rem]" />
      <div className="px-1 space-y-2">
        <Skeleton className="h-5 sm:h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-3 sm:h-4 w-1/2 rounded-md" />
        <Skeleton className="h-8 sm:h-10 w-full rounded-xl" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 sm:h-8 w-1/3 rounded-lg" />
          <Skeleton className="h-8 w-8 sm:h-11 sm:w-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function PackageCard({ package: pkg, loading }: PackageCardProps) {
  if (loading || !pkg) {
    return <PackageCardSkeleton />;
  }

  const fallback = hashGradient(pkg.title);
  const locationText = pkg.country?.name ? `${pkg.country.name}, Europe` : "Europe";

  return (
    <Link href={`/packages/${pkg.slug}`} className="group block h-full">
      <div className="relative h-full bg-white rounded-[1.5rem] sm:rounded-[2.2rem] border border-gray-200/80 p-2.5 sm:p-4 shadow-md transition-all duration-300 hover:shadow-2xl hover:shadow-navy/10 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
        
        {/* Top Media Container */}
        <div>
          <div className="relative h-36 sm:h-60 w-full overflow-hidden rounded-[1.2rem] sm:rounded-[1.8rem] bg-slate-100">
            {pkg.coverImage ? (
              <img
                src={pkg.coverImage}
                alt={pkg.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${fallback[0]} ${fallback[1]} flex items-center justify-center`}>
                <span className="text-3xl sm:text-5xl font-black text-white/30 uppercase">{pkg.title.charAt(0)}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 flex flex-wrap gap-1 sm:gap-2">
              <Badge className="rounded-full bg-black/50 border border-white/20 text-white backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold shadow-md">
                <IconCalendar className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold" />
                {pkg.durationDays}D
              </Badge>
              {pkg.country && (
                <Badge className="rounded-full bg-gold text-navy border-0 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-extrabold shadow-md hidden sm:inline-flex">
                  {pkg.country.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Card Content Header */}
          <div className="pt-2 sm:pt-4 px-1 sm:px-2">
            <h3 className="text-xs sm:text-2xl font-black text-navy tracking-tight leading-tight group-hover:text-gold transition-colors line-clamp-2">
              {pkg.title}
            </h3>
            
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">
              <IconMapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold flex-shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>

            {/* Description Section */}
            {pkg.summary && (
              <div className="mt-2 sm:mt-3.5 hidden sm:block">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Description
                </p>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-normal">
                  {pkg.summary}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Metrics Bar + Price */}
        <div className="pt-2 sm:pt-4 px-1 sm:px-2 mt-2 sm:mt-4 border-t border-gray-100/80">
          {/* Key Stats Row */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 bg-slate-50/80 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border border-gray-100 text-center mb-2 sm:mb-4">
            <div>
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Days</p>
              <p className="text-[10px] sm:text-xs font-extrabold text-cyan-600 mt-0.5">{pkg.durationDays}D</p>
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transfer</p>
              <p className="text-[10px] sm:text-xs font-extrabold text-blue-600 mt-0.5 truncate">VIP</p>
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rating</p>
              <p className="text-[10px] sm:text-xs font-extrabold text-amber-500 mt-0.5 flex items-center justify-center gap-0.5">
                4.9 <IconStar className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-amber-400 text-amber-400" />
              </p>
            </div>
          </div>

          {/* Price & Floating Action Icon Button */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Price</p>
              <p className="text-sm sm:text-2xl font-black text-navy tracking-tight">
                €{pkg.priceFrom ? Number(pkg.priceFrom).toFixed(0) : "1,195"}
              </p>
            </div>

            {/* Floating Action Button */}
            <div className="flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-navy text-white shadow-md group-hover:bg-gold group-hover:text-navy transition-all duration-300 group-hover:scale-110 group-hover:shadow-gold/40">
              <IconCar className="h-4 w-4 sm:h-5 sm:w-5 transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
