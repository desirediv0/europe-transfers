"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Package } from "@/lib/types";
import { IconArrowRight, IconPackage, IconCalendar, IconMapPin } from "@tabler/icons-react";

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

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ items: Package[] }>("/packages?limit=50")
      .then((d) => setPackages(d.items))
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
            <IconPackage className="h-4 w-4" />
            Curated Experiences
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Tour <span className="text-gold">Packages</span>
          </h1>
          <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto">
            Hand-picked travel packages across Europe, designed for comfort, adventure, and unforgettable memories.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-2xl">
                  <Skeleton className="h-60 w-full" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))
            : packages.map((pkg) => {
                const fallback = hashGradient(pkg.title);
                return (
                  <Link key={pkg.id} href={`/packages/${pkg.slug}`}>
                    <Card className="group overflow-hidden rounded-2xl border-border/40 bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 hover:border-gold/20">
                      <CardContent className="p-0">
                        <div className="relative h-60 overflow-hidden">
                          {pkg.coverImage ? (
                            <Image
                              src={pkg.coverImage}
                              alt={pkg.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div
                              className={`h-full w-full bg-gradient-to-br ${fallback[0]} ${fallback[1]} flex items-center justify-center`}
                            >
                              <span className="text-6xl font-bold text-white/30 uppercase">{pkg.title.charAt(0)}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <Badge variant="gold" className="rounded-md px-2.5 py-1 text-xs font-bold">
                              <IconCalendar className="mr-1 h-3 w-3" /> {pkg.durationDays} Days
                            </Badge>
                            {pkg.country && (
                              <Badge
                                variant="outline"
                                className="rounded-md bg-white/95 text-foreground border-0 px-2.5 py-1 text-xs font-semibold"
                              >
                                <IconMapPin className="mr-1 h-3 w-3" /> {pkg.country.name}
                              </Badge>
                            )}
                          </div>
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-navy shadow-lg">
                              <IconArrowRight className="h-5 w-5" />
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold group-hover:text-gold transition-colors">{pkg.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{pkg.summary}</p>
                          {pkg.priceFrom && (
                            <div className="mt-5 pt-5 border-t border-border/50 flex items-baseline justify-between">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-sm text-muted-foreground">From</span>
                                <span className="text-2xl font-bold text-gold">€{Number(pkg.priceFrom).toFixed(0)}</span>
                                <span className="text-xs text-muted-foreground">/person</span>
                              </div>
                              <span className="text-xs font-medium text-gold group-hover:underline">View details</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
        </div>
      </section>
    </div>
  );
}
