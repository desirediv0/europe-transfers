"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { IconMapPin, IconRoute } from "@tabler/icons-react";

export interface FeaturedCity {
  city: string;
  locationCount: number;
  image?: string | null;
}

interface DestinationCardProps {
  city?: FeaturedCity;
  loading?: boolean;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000&auto=format&fit=crop";

export function DestinationCardSkeleton() {
  return (
    <div className="relative h-80 sm:h-96 w-full rounded-[1.8rem] sm:rounded-[2.2rem] overflow-hidden bg-slate-200 p-4 sm:p-6 flex flex-col justify-between">
      <Skeleton className="h-7 w-20 rounded-full self-end bg-slate-300" />
      <div className="space-y-2.5">
        <Skeleton className="h-7 w-3/4 rounded-lg bg-slate-300" />
        <Skeleton className="h-4 w-1/2 rounded-md bg-slate-300" />
        <Skeleton className="h-4 w-2/3 rounded-md bg-slate-300" />
      </div>
    </div>
  );
}

export default function DestinationCard({ city, loading }: DestinationCardProps) {
  if (loading || !city) {
    return <DestinationCardSkeleton />;
  }

  const imageSrc = city.image || FALLBACK_IMAGE;

  return (
    <Link href="/private-transfers" className="group block w-full h-80 sm:h-[26rem]">
      <div className="relative h-full w-full rounded-[1.6rem] sm:rounded-[2.2rem] overflow-hidden border border-gray-200/60 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-navy/20 hover:-translate-y-2">
        {/* Background Image */}
        <img
          src={imageSrc}
          alt={city.city}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient Overlay for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

        {/* Bottom Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-6 z-10 text-white">
          {/* City Name */}
          <h3 className="text-lg sm:text-3xl font-black tracking-tight text-white group-hover:text-gold transition-colors line-clamp-1">
            {city.city}
          </h3>

          {/* Location Count */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-gray-300 mt-1">
            <span className="flex items-center gap-1">
              <IconRoute className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold" />
              {city.locationCount} Pickup Location{city.locationCount === 1 ? "" : "s"}
            </span>
          </div>

          {/* Location Pin Line */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-gray-300 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/15">
            <IconMapPin className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
            <span className="truncate">Europe</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
