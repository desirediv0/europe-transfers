"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Package, City } from "@/lib/types";
import TransferSearchWidget from "@/components/TransferSearchWidget";
import { IconCar, IconPackage, IconStar, IconArrowRight } from "@tabler/icons-react";

export default function HomePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ items: Package[] }>("/packages?limit=3"),
      api.get<{ items: City[] }>("/cities?limit=6"),
    ]).then(([p, c]) => {
      setPackages(p.items);
      setCities(c.items);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/90 to-navy/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="max-w-xl">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Travel Europe in <span className="text-gold">Comfort</span>
              </h1>
              <p className="mt-6 text-lg text-white/70">
                Premium airport transfers, city tours, and curated travel packages across Europe. Your journey begins with us.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/fleet">
                  <Button variant="gold" size="lg">
                    <IconCar className="mr-2 h-5 w-5" /> View Fleet
                  </Button>
                </Link>
                <Link href="/packages">
                  <Button size="lg" className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
                    <IconPackage className="mr-2 h-5 w-5" /> Tour Packages
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <TransferSearchWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">Featured Packages</h2>
            <p className="mt-2 text-muted-foreground">Curated travel experiences across Europe</p>
          </div>
          <Link href="/packages" className="text-sm font-medium text-gold hover:underline flex items-center gap-1">
            View All <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardContent className="p-0"><Skeleton className="h-48 w-full rounded-t-xl" /><div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></CardContent></Card>
              ))
            : packages.map((pkg) => (
                <Link key={pkg.id} href={`/packages/${pkg.slug}`}>
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative h-48 bg-muted">
                      {pkg.coverImage && <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover" />}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="gold">{pkg.durationDays} Days</Badge>
                        {pkg.country && <Badge variant="outline">{pkg.country.name}</Badge>}
                      </div>
                      <h3 className="mt-2 font-serif text-lg font-bold">{pkg.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{pkg.summary}</p>
                      {pkg.priceFrom && (
                        <div className="mt-3">
                          <span className="text-sm text-muted-foreground">From</span>
                          <span className="ml-1 text-lg font-bold text-gold">€{Number(pkg.priceFrom).toFixed(0)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </section>

      {/* Cities */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="font-serif text-2xl font-bold sm:text-3xl">Popular Destinations</h2>
          <p className="mt-2 text-muted-foreground">Explore our most popular cities</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
              : cities.map((city) => (
                  <Link key={city.id} href={`/rates/${city.slug}`}>
                    <div className="group relative h-40 overflow-hidden rounded-xl">
                      {city.image ? (
                        <Image src={city.image} alt={city.name} fill className="object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full bg-navy/10" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-serif text-lg font-bold">{city.name}</h3>
                        {city.country && <p className="text-sm text-white/70">{city.country.name}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center font-serif text-2xl font-bold sm:text-3xl">Why Choose Us</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { icon: IconCar, title: "Premium Fleet", desc: "Well-maintained vehicles for every group size" },
            { icon: IconStar, title: "Verified Drivers", desc: "Professional, licensed, and experienced" },
            { icon: IconPackage, title: "Custom Packages", desc: "Tailored itineraries for your perfect trip" },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                <item.icon className="h-6 w-6 text-gold" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
