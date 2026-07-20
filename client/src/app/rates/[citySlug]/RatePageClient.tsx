"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Location, Route, RoutePrice } from "@/lib/types";
import {
  IconArrowLeft,
  IconArrowRight,
  IconMapPin,
  IconRoute,
  IconLuggage,
  IconSnowflake,
  IconWifi,
  IconBabyCarriage,
  IconCrown,
  IconPaw,
  IconCheck,
  IconCalendar,
  IconPhone,
  IconInfoCircle,
  IconCar,
  IconClock,
  IconUsers,
  IconTag,
} from "@tabler/icons-react";

interface Props {
  locations: Location[];
  routes: (Route & { routePrices: RoutePrice[] })[];
  citySlug: string;
}

const gradientPairs = [
  ["from-blue-500", "to-cyan-500"],
  ["from-violet-500", "to-purple-500"],
  ["from-emerald-500", "to-teal-500"],
  ["from-amber-500", "to-orange-500"],
  ["from-rose-500", "to-pink-500"],
  ["from-indigo-500", "to-blue-500"],
];

function hashGradient(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  return gradientPairs[Math.abs(hash) % gradientPairs.length];
}

function FeatureBadge({ active, icon: Icon, label }: { active: boolean; icon: React.ElementType; label: string }) {
  return (
    <div
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
        active
          ? "bg-navy/5 border-navy/10 text-navy"
          : "bg-muted/50 border-transparent text-muted-foreground/60 line-through"
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

function VehicleCard({
  rp,
  route,
}: {
  rp: RoutePrice;
  route: Route & { routePrices: RoutePrice[] };
}) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-white transition-all hover:shadow-xl hover:shadow-black/5 hover:border-gold/40 hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 shrink-0">
            <IconCar className="h-5 w-5 text-gold" strokeWidth={1.5} />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-navy">€{Number(rp.price).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Fixed total price</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="font-semibold text-base">{rp.carType?.name || "Standard Car"}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Up to {rp.carType?.seats || "—"} passengers
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <FeatureBadge active={rp.carType?.isAC || false} icon={IconSnowflake} label="AC" />
          <FeatureBadge active={rp.carType?.isWiFi || false} icon={IconWifi} label="WiFi" />
          <FeatureBadge active={rp.carType?.isLuggage || false} icon={IconLuggage} label="Luggage" />
          <FeatureBadge active={rp.carType?.isChildSeat || false} icon={IconBabyCarriage} label="Child Seat" />
          <FeatureBadge active={rp.carType?.isVIP || false} icon={IconCrown} label="VIP" />
          <FeatureBadge active={rp.carType?.isPetFriendly || false} icon={IconPaw} label="Pets" />
        </div>

        <Link
          href={`/checkout?routeId=${route.id}&carTypeId=${rp.carType?.id}&routePriceId=${rp.routePriceId}&from=${encodeURIComponent(
            route.fromLocation?.name || ""
          )}&to=${encodeURIComponent(route.toLocation?.name || "")}`}
        >
          <Button variant="gold" className="w-full mt-5 rounded-full group-hover:shadow-md transition-all">
            Book Now <IconArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function RatePageClient({ locations, routes, citySlug }: Props) {
  const cityLocations = locations.filter((l) => l.city.toLowerCase().replace(/\s+/g, "-") === citySlug);
  const cityName = cityLocations[0]?.city || citySlug;

  const cityRoutes = routes.filter(
    (r) => r.fromLocation && cityLocations.some((l) => l.id === r.fromLocationId) && r.isActive
  );

  const heroGradient = hashGradient(cityName);

  if (cityLocations.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <IconMapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">City Not Found</h1>
        <p className="mt-3 text-muted-foreground">No routes found for {citySlug}. Please explore our home page.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button variant="gold">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-light/30" />
        <div className={`absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br ${heroGradient[0]} ${heroGradient[1]} opacity-10 blur-[120px]`} />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors mb-6"
          >
            <IconArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold mb-4">
                <IconMapPin className="h-4 w-4" />
                {cityLocations.length} pickup location{cityLocations.length > 1 ? "s" : ""} in {cityName}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                Transfers from <span className="text-gold">{cityName}</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-white/50 max-w-xl leading-relaxed">
                Premium private transfers from {cityName} to top destinations. Fixed prices, professional drivers, and instant booking.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 text-white/70">
                <IconRoute className="h-4 w-4 text-gold" />
                <span>{cityRoutes.length} routes available</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 text-white/70">
                <IconTag className="h-4 w-4 text-gold" />
                <span>No hidden fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pickup Locations */}
      <section className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <IconMapPin className="h-4 w-4 text-gold" />
            <span className="font-medium text-foreground">Pickup locations in {cityName}:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {cityLocations.map((loc) => (
              <Badge key={loc.id} variant="outline" className="rounded-full px-4 py-1.5 text-sm font-medium border-gold/20 text-foreground bg-gold/5 hover:bg-gold/10">
                {loc.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Routes */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="mb-10">
          <span className="text-xs font-bold tracking-[0.15em] text-gold uppercase">Pricing</span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">Available Routes from {cityName}</h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Choose your destination and vehicle. All prices are fixed with no hidden fees and include meet & greet, luggage, and waiting time.
          </p>
        </div>

        <div className="space-y-8">
          {cityRoutes.length === 0 ? (
            <Card className="border-dashed border-2 border-border/50">
              <CardContent className="py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <IconRoute className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No routes available</h3>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  We don&apos;t have any active routes from {cityName} yet. Contact us for a custom quote.
                </p>
                <Link href="/contact" className="mt-6 inline-block">
                  <Button variant="gold">Request a Route</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            cityRoutes.map((route) => (
              <Card
                key={route.id}
                className="overflow-hidden border-border/40 bg-white transition-all hover:shadow-xl hover:shadow-black/5 hover:border-gold/20"
              >
                <CardContent className="p-0">
                  {/* Route Header */}
                  <div className="bg-muted/30 px-5 sm:px-6 py-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 shrink-0">
                        <IconRoute className="h-5 w-5 text-gold" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold">
                          {route.fromLocation?.name} <span className="text-gold mx-1">→</span> {route.toLocation?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{route.routePrices.length} vehicle options</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-fit rounded-full px-3 py-1 border-gold/20 text-gold bg-gold/5">
                        Fixed Price
                      </Badge>
                    </div>
                  </div>

                  {/* Vehicle Options */}
                  <div className="p-5 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {route.routePrices.map((rp, idx) => (
                        <VehicleCard key={`${route.id}-${rp.routePriceId || idx}`} rp={rp} route={route} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: IconCheck, title: "Fixed Pricing", desc: "No surprise charges. The price you see is the price you pay." },
              { icon: IconUsers, title: "Professional Drivers", desc: "Licensed, insured, and punctual chauffeurs." },
              { icon: IconClock, title: "Free Waiting Time", desc: "Airport pickups include complimentary waiting time." },
              { icon: IconCalendar, title: "24/7 Availability", desc: "Book anytime, day or night, with instant confirmation." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 shrink-0">
                  <item.icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-white border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-3xl bg-navy px-6 sm:px-10 py-8 sm:py-10">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Need a custom route?</h3>
              <p className="mt-2 text-sm sm:text-base text-white/60 max-w-lg">
                Can&apos;t find your destination? Reach out and we&apos;ll prepare a personalized quote for your trip from {cityName}.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contact">
                <Button variant="gold" className="rounded-full">
                  <IconInfoCircle className="mr-2 h-4 w-4" /> Request a Quote
                </Button>
              </Link>
              <Link href="tel:+49123456789">
                <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white">
                  <IconPhone className="mr-2 h-4 w-4" /> Call Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
