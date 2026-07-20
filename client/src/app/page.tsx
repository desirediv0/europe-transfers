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
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import {
  IconCar,
  IconPackage,
  IconStar,
  IconArrowRight,
  IconShieldCheck,
  IconClock,
  IconCreditCard,
  IconHeadset,
  IconMapPin,
  IconBuildingBank,
  IconCheck,
} from "@tabler/icons-react";

const HERO_IMAGES = [
  "/images/hero_swiss_alps.png",
  "/images/hero_paris_twilight.png",
  "/images/hero_amalfi_coast.png",
];

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
  const index = Math.abs(hash) % gradientPairs.length;
  return gradientPairs[index];
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  icon?: React.ElementType;
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className={`flex items-center gap-2 mb-3 ${align === "center" ? "justify-center" : ""}`}>
        {Icon && (
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gold/10">
            <Icon className="h-3.5 w-3.5 text-gold" />
          </div>
        )}
        <span className="text-xs font-bold tracking-[0.15em] text-gold uppercase">{eyebrow}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export default function HomePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get<{ items: Package[] }>("/packages?limit=3"),
      api.get<{ items: City[] }>("/cities?limit=6"),
    ])
      .then(([p, c]) => {
        setPackages(p.items);
        setCities(c.items);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          {HERO_IMAGES.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            >
              <Image src={src} alt="Premium European Travel Background" fill priority={index === 0} className="object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/40" />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gold/5 blur-[100px]" />
          <div className="absolute bottom-20 right-10 h-[500px] w-[500px] rounded-full bg-navy-light/40 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 backdrop-blur-md px-4 py-2 text-sm font-semibold text-gold mb-6 border border-gold/20">
                <IconShieldCheck className="h-4 w-4" />
                Trusted by 10,000+ travelers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
                Travel Europe in{" "}
                <span className="text-gold relative inline-block">
                  Comfort
                  <span className="absolute -bottom-2 left-0 h-1.5 w-full bg-gradient-to-r from-gold to-gold-light rounded-full" />
                </span>
              </h1>
              <p className="mt-8 text-lg sm:text-xl text-white/65 leading-relaxed max-w-xl">
                Premium airport transfers, city tours, and curated travel packages across Europe. Your journey begins with us.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/fleet">
                  <Button
                    variant="gold"
                    size="lg"
                    className="rounded-full px-8 py-6 text-base font-semibold shadow-xl shadow-gold/20 hover:shadow-gold/40 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <IconCar className="mr-2 h-5 w-5" /> View Fleet
                  </Button>
                </Link>
                <Link href="/packages">
                  <Button
                    size="lg"
                    className="rounded-full px-8 py-6 text-base font-semibold bg-white/10 border border-white/20 text-white backdrop-blur-md hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <IconPackage className="mr-2 h-5 w-5" /> Tour Packages
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap items-center gap-4 text-sm text-white/70">
                {[
                  { icon: IconClock, text: "24/7 Support" },
                  { icon: IconCreditCard, text: "Secure Payment" },
                  { icon: IconStar, text: "4.9 Rating" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm"
                  >
                    <item.icon className="h-4 w-4 text-gold" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-navy/40 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-2xl">
                <TransferSearchWidget />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { icon: IconCar, label: "Premium Fleet", desc: "Luxury vehicles" },
              { icon: IconShieldCheck, label: "Verified Drivers", desc: "Licensed & insured" },
              { icon: IconCreditCard, label: "Easy Payment", desc: "Secure checkout" },
              { icon: IconHeadset, label: "24/7 Support", desc: "Always available" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center text-center gap-3 py-8 px-4 border-b sm:border-b-0 lg:border-r last:border-r-0 border-border"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/8">
                  <item.icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Explore"
            title="Featured Packages"
            subtitle="Hand-picked travel experiences across Europe, crafted for comfort and adventure."
            icon={IconPackage}
          />
          <Link
            href="/packages"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold hover:text-navy transition-colors"
          >
            View All <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-2xl border-border/50">
                  <CardContent className="p-0">
                    <Skeleton className="h-60 w-full" />
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))
            : packages.map((pkg) => {
                const fallback = hashGradient(pkg.title);
                return (
                  <Link key={pkg.id} href={`/packages/${pkg.slug}`}>
                    <Card className="group overflow-hidden rounded-2xl border border-border/40 bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-black/8 hover:-translate-y-1 hover:border-gold/30">
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
                              <span className="text-5xl font-bold text-white/30 uppercase">
                                {pkg.title.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <Badge variant="gold" className="rounded-md px-2.5 py-1 text-xs font-bold">
                              {pkg.durationDays} Days
                            </Badge>
                            {pkg.country && (
                              <Badge variant="outline" className="rounded-md bg-white/95 text-foreground border-0 px-2.5 py-1 text-xs font-semibold">
                                {pkg.country.name}
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
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold"
          >
            View All Packages <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Cities */}
      <section className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-light/30" />
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <SectionHeading
            eyebrow="Destinations"
            title="Popular Destinations"
            subtitle="Explore Europe's most sought-after cities with our premium transfer services."
            align="center"
            icon={IconMapPin}
          />

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-3xl bg-white/5" />
                ))
              : cities.map((city) => {
                  const fallback = hashGradient(city.name);
                  return (
                    <Link key={city.id} href={`/rates/${city.slug}`}>
                      <div className="group relative h-64 overflow-hidden rounded-3xl border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/10 hover:border-gold/30">
                        {city.image ? (
                          <Image
                            src={city.image}
                            alt={city.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div
                            className={`h-full w-full bg-gradient-to-br ${fallback[0]} ${fallback[1]} flex items-center justify-center`}
                          >
                            <span className="text-6xl font-bold text-white/20">{city.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-2xl font-bold text-white">{city.name}</h3>
                          {city.country && <p className="text-sm text-white/60 mt-1">{city.country.name}</p>}
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white">
                            <IconArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <SectionHeading
          eyebrow="Why Us"
          title="Why Choose Us"
          subtitle="We combine premium service, safety, and flexibility to deliver unforgettable European journeys."
          align="center"
          icon={IconCheck}
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: IconCar,
              title: "Premium Fleet",
              desc: "Luxury vehicles for every group size, maintained to the highest standards.",
            },
            {
              icon: IconStar,
              title: "Verified Drivers",
              desc: "Professional, licensed chauffeurs with deep local knowledge.",
            },
            {
              icon: IconPackage,
              title: "Custom Packages",
              desc: "Tailored itineraries designed around your interests and schedule.",
            },
            {
              icon: IconBuildingBank,
              title: "Safe & Secure",
              desc: "Fully insured transfers with round-the-clock customer support.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-white p-8 text-center transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 hover:border-gold/30"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 transition-all duration-300 group-hover:scale-110 group-hover:from-gold/20">
                <item.icon className="h-10 w-10 text-gold" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 text-lg font-bold">{item.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* CTA */}
      <section className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy to-navy-light/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Ready to Start Your Journey?</h2>
          <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto">
            Book your premium transfer today or explore our curated tour packages across Europe.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/fleet">
              <Button
                variant="gold"
                size="lg"
                className="rounded-full px-10 py-6 text-base font-semibold shadow-xl shadow-gold/20 hover:shadow-gold/40 hover:-translate-y-0.5 transition-all"
              >
                Book a Transfer
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                className="rounded-full px-10 py-6 text-base font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:-translate-y-0.5 transition-all"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
