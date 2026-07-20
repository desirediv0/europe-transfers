"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { CarType } from "@/lib/types";
import {
  IconUsers,
  IconSnowflake,
  IconWifi,
  IconLuggage,
  IconBabyCarriage,
  IconCrown,
  IconPaw,
  IconCar,
  IconCheck,
} from "@tabler/icons-react";

const featureMap = [
  { key: "isAC", label: "Air Conditioning", icon: IconSnowflake },
  { key: "isWiFi", label: "Free WiFi", icon: IconWifi },
  { key: "isLuggage", label: "Luggage Space", icon: IconLuggage },
  { key: "isChildSeat", label: "Child Seat", icon: IconBabyCarriage },
  { key: "isVIP", label: "VIP Service", icon: IconCrown },
  { key: "isPetFriendly", label: "Pet Friendly", icon: IconPaw },
];

const fleetBenefits = [
  "Late-model luxury vehicles",
  "Professional English-speaking drivers",
  "Complimentary bottled water",
  "Flight tracking for airport pickups",
  "Free cancellation up to 24h",
];

export default function FleetPage() {
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ items: CarType[] }>("/car-types?limit=100")
      .then((d) => setCarTypes(d.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-light/30" />
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gold/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold mb-6">
            <IconCar className="h-4 w-4" />
            Premium Fleet
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Travel in <span className="text-gold">Style & Comfort</span>
          </h1>
          <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto">
            Choose from our carefully maintained fleet of premium vehicles, each designed to deliver a first-class travel experience across Europe.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {fleetBenefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 flex-shrink-0">
                  <IconCheck className="h-4 w-4 text-gold" />
                </div>
                <span className="text-sm font-medium text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-[0.15em] text-gold uppercase">Our Vehicles</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Choose Your Ride</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            From executive sedans to spacious vans, we have the perfect vehicle for every journey.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-2xl">
                  <Skeleton className="h-56 w-full" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))
            : carTypes.map((ct) => (
                <Card
                  key={ct.id}
                  className="group overflow-hidden rounded-2xl border-border/40 bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 hover:border-gold/20"
                >
                  <CardContent className="p-0">
                    <div className="relative h-56 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                      {ct.image ? (
                        <Image
                          src={ct.image}
                          alt={ct.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <IconCar className="h-24 w-24 text-muted-foreground/20" strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge className="rounded-full bg-navy text-white border-0 px-3 py-1 font-semibold">
                          {ct.name}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">{ct.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          <IconUsers className="h-4 w-4" />
                          <span>{ct.seats} seats</span>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {featureMap.map(({ key, label, icon: Icon }) =>
                          ct[key as keyof CarType] ? (
                            <div
                              key={key}
                              className="flex items-center gap-1.5 rounded-lg bg-gold/5 border border-gold/10 px-3 py-1.5 text-xs font-medium text-gold"
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {label}
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>
    </div>
  );
}
