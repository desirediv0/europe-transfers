"use client";

import Link from "next/link";
import type { City } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { IconMapPin, IconStar } from "@tabler/icons-react";

interface DestinationCardProps {
  city?: City;
  loading?: boolean;
}

// High Quality Curated European City Photos Fallback Map
const CITY_IMAGE_MAP: Record<string, { image: string; tag: string; price: string; rating: string }> = {
  paris: {
    image: "/images/hero_paris_twilight.png",
    tag: "City of Lights",
    price: "€140",
    rating: "4.9 (1.8k)",
  },
  rome: {
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop",
    tag: "Historic Capital",
    price: "€120",
    rating: "4.9 (2.1k)",
  },
  milan: {
    image: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?q=80&w=1000&auto=format&fit=crop",
    tag: "Fashion & Business",
    price: "€110",
    rating: "4.8 (1.4k)",
  },
  barcelona: {
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=1000&auto=format&fit=crop",
    tag: "Coastal Charm",
    price: "€130",
    rating: "4.9 (1.6k)",
  },
  zurich: {
    image: "/images/hero_swiss_alps.png",
    tag: "Alpine Luxury",
    price: "€180",
    rating: "5.0 (2.4k)",
  },
  venice: {
    image: "/images/hero_amalfi_coast.png",
    tag: "Canal Romance",
    price: "€160",
    rating: "4.9 (1.9k)",
  },
};

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

  const slugKey = city.slug?.toLowerCase() || city.name?.toLowerCase() || "";
  const matched = CITY_IMAGE_MAP[slugKey] || {
    image: city.image || "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000&auto=format&fit=crop",
    tag: "Luxury Destination",
    price: "€120",
    rating: "4.9 (1.2k)",
  };

  const imageSrc = city.image || matched.image;
  const countryName = city.country?.name || "Europe";

  const priceText = (city as { basePrice?: string | number; startingPrice?: string | number }).basePrice 
    ? `€${(city as { basePrice?: string | number }).basePrice}`
    : (city as { startingPrice?: string | number }).startingPrice 
      ? `€${(city as { startingPrice?: string | number }).startingPrice}`
      : matched.price;

  return (
    <Link href={`/rates/${city.slug}`} className="group block w-full h-80 sm:h-[26rem]">
      <div className="relative h-full w-full rounded-[1.6rem] sm:rounded-[2.2rem] overflow-hidden border border-gray-200/60 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-navy/20 hover:-translate-y-2">
        {/* Background Image */}
        <img
          src={imageSrc}
          alt={city.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient Overlay for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

        {/* Top Right Starts-at Badge */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
          <div className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-black text-navy shadow-md border border-white/40">
            starts at <span className="text-gold font-extrabold">{priceText}</span>
          </div>
        </div>

        {/* Bottom Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-6 z-10 text-white">
          {/* City Name */}
          <h3 className="text-lg sm:text-3xl font-black tracking-tight text-white group-hover:text-gold transition-colors line-clamp-1">
            {city.name}
          </h3>

          {/* Subtag & Rating */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-gray-300 mt-1">
            <span className="truncate">{matched.tag}</span>
            <span className="text-gray-500 hidden sm:inline">•</span>
            <span className="flex items-center gap-0.5 text-gold font-bold">
              <IconStar className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-gold text-gold" />
              {matched.rating}
            </span>
          </div>

          {/* Location Pin Line */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-gray-300 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/15">
            <IconMapPin className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
            <span className="truncate">{countryName}, Europe</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
