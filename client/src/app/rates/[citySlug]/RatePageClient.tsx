"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
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
  IconSparkles,
} from "@tabler/icons-react";

interface Props {
  locations: Location[];
  routes: (Route & { routePrices: RoutePrice[] })[];
  citySlug: string;
}

function FeatureBadge({ active, icon: Icon, label }: { active: boolean; icon: React.ElementType; label: string }) {
  return (
    <div
      className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
        active
          ? "bg-navy/5 border-navy/15 text-navy font-semibold"
          : "bg-slate-100/70 border-transparent text-gray-400 line-through"
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
  const { format } = useCurrency();
  return (
    <Card className="group overflow-hidden border border-gray-200/80 bg-white rounded-2xl transition-all hover:shadow-xl hover:shadow-navy/10 hover:border-gold/50 hover:-translate-y-1">
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-navy shrink-0 group-hover:bg-navy group-hover:text-gold transition-colors">
              <IconCar className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-navy tracking-tight">{format(Number(rp.price))}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fixed Total Price</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-extrabold text-base text-navy">{rp.carType?.name || "Standard Luxury Sedan"}</h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Up to {rp.carType?.seats || "4"} passengers
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <FeatureBadge active={rp.carType?.isAC ?? true} icon={IconSnowflake} label="AC" />
            <FeatureBadge active={rp.carType?.isWiFi ?? true} icon={IconWifi} label="WiFi" />
            <FeatureBadge active={rp.carType?.isLuggage ?? true} icon={IconLuggage} label="Luggage" />
            <FeatureBadge active={rp.carType?.isChildSeat ?? false} icon={IconBabyCarriage} label="Child Seat" />
            <FeatureBadge active={rp.carType?.isVIP ?? false} icon={IconCrown} label="VIP" />
            <FeatureBadge active={rp.carType?.isPetFriendly ?? false} icon={IconPaw} label="Pets" />
          </div>
        </div>

        <Link
          href={`/checkout?routeId=${route.id}&carTypeId=${rp.carType?.id}&routePriceId=${rp.routePriceId}&from=${encodeURIComponent(
            route.fromLocation?.name || ""
          )}&to=${encodeURIComponent(route.toLocation?.name || "")}`}
          className="block pt-2"
        >
          <Button variant="gold" className="w-full rounded-xl py-3 text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2">
            Book Now <IconArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function RatePageClient({ locations, routes, citySlug }: Props) {
  const formattedSlug = citySlug.replace(/-/g, " ");
  const capitalizedCity = formattedSlug.charAt(0).toUpperCase() + formattedSlug.slice(1);

  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
  const targetSlugNorm = normalize(citySlug);

  const cityLocations = locations.filter(
    (l) =>
      normalize(l.city).includes(targetSlugNorm) ||
      normalize(l.name).includes(targetSlugNorm)
  );

  const cityName = cityLocations[0]?.city || capitalizedCity;

  const cityRoutes = routes.filter(
    (r) =>
      r.fromLocation &&
      (cityLocations.some((l) => l.id === r.fromLocationId) ||
        normalize(r.fromLocation.city).includes(targetSlugNorm) ||
        normalize(r.fromLocation.name).includes(targetSlugNorm)) &&
      r.isActive
  );

  const CITY_IMAGES: Record<string, string> = {
    barcelona: "https://images.unsplash.com/photo-1583422409516-2895a771deda?q=80&w=1200&auto=format&fit=crop",
    rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1200&auto=format&fit=crop",
    milan: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?q=80&w=1200&auto=format&fit=crop",
    paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop",
    zurich: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop",
    nice: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop",
  };

  const bgImage = CITY_IMAGES[targetSlugNorm] || "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="bg-slate-50/50 min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-navy overflow-hidden">
        <img
          src={bgImage}
          alt={cityName}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-navy/90 to-black/75" />
        <div className="absolute top-10 right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 text-xs font-semibold text-white/90 hover:bg-gold hover:text-navy transition-all duration-300 mb-8 cursor-pointer shadow-md"
          >
            <IconArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-black text-gold uppercase tracking-wider mb-4 border border-gold/30">
                <IconMapPin className="h-3.5 w-3.5 text-gold" />
                {cityLocations.length > 0
                  ? `${cityLocations.length} Pickup Locations in ${cityName}`
                  : `Chauffeured Transfers in ${cityName}`}
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Transfers & Chauffeuring from <span className="text-gold">{cityName}</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed font-normal">
                First-class private chauffeured transfers from {cityName} to airports, luxury hotels, and top European cities. Fixed pricing with professional English-speaking drivers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-white shadow-sm">
                <IconRoute className="h-4 w-4 text-gold" />
                <span>{cityRoutes.length} Direct Routes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-white shadow-sm">
                <IconTag className="h-4 w-4 text-gold" />
                <span>Zero Hidden Fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pickup Locations Bar */}
      {cityLocations.length > 0 && (
        <section className="bg-white border-b border-gray-200/80 shadow-xs">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              <IconMapPin className="h-4 w-4 text-gold" />
              <span>Verified Pickup Locations in {cityName}:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cityLocations.map((loc) => (
                <Badge
                  key={loc.id}
                  className="rounded-xl px-4 py-2 text-xs font-extrabold border border-gold/30 text-navy bg-gold/10 hover:bg-gold hover:text-navy transition-all cursor-pointer"
                >
                  {loc.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Routes & Rates Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3.5 py-1 text-xs font-extrabold text-gold uppercase tracking-widest mb-3">
            <IconSparkles className="h-3.5 w-3.5" />
            Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-navy tracking-tight">Available Routes from {cityName}</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
            Select your destination and vehicle class. All rates are fixed with complimentary waiting time, luggage assistance, and flight tracking included.
          </p>
        </div>

        <div className="space-y-8">
          {cityRoutes.length === 0 ? (
            <Card className="border border-dashed border-gray-300 bg-white rounded-3xl p-8 sm:p-12 text-center shadow-sm">
              <CardContent className="p-0 max-w-md mx-auto space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <IconRoute className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-navy">Custom Transfers for {cityName}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  We provide bespoke chauffeured transfers to and from any airport, hotel, or city in {cityName}. Contact our concierge for an instant quote.
                </p>
                <div className="pt-2">
                  <Link href={`/contact?city=${encodeURIComponent(cityName)}`}>
                    <Button variant="gold" size="lg" className="rounded-xl px-8 py-3.5 text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg cursor-pointer">
                      Request Custom Quote for {cityName}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            cityRoutes.map((route) => (
              <Card
                key={route.id}
                className="overflow-hidden border border-gray-200/80 bg-white rounded-3xl shadow-md transition-all hover:shadow-xl hover:border-gold/30"
              >
                <CardContent className="p-0">
                  {/* Route Header */}
                  <div className="bg-slate-50 px-6 py-5 border-b border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-gold shrink-0 shadow-sm">
                        <IconRoute className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-navy">
                          {route.fromLocation?.name} <span className="text-gold mx-1.5">→</span> {route.toLocation?.name}
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 mt-0.5">
                          {route.routePrices.length} Luxury Fleet Options
                        </p>
                      </div>
                    </div>
                    <Badge className="w-fit rounded-full px-4 py-1.5 border border-gold/30 text-navy bg-gold/15 font-extrabold text-xs">
                      Fixed All-Inclusive Rate
                    </Badge>
                  </div>

                  {/* Vehicle Grid */}
                  <div className="p-6 sm:p-8">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Trust & Guarantee Highlights */}
      <section className="bg-white border-t border-gray-200/80 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: IconCheck, title: "Fixed All-Inclusive Rates", desc: "No surprise charges or meter surge pricing. The quote you see is what you pay." },
              { icon: IconUsers, title: "Licensed Chauffeurs", desc: "Professional, English-speaking, fully vetted local drivers." },
              { icon: IconClock, title: "Free Airport Waiting", desc: "Includes 60 minutes complimentary wait time for flight arrivals." },
              { icon: IconCalendar, title: "24/7 Concierge Support", desc: "Book anytime online or speak with our live travel support desk." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-gray-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-navy shrink-0">
                  <item.icon className="h-5.5 w-5.5 text-navy" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-navy">{item.title}</h4>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed font-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Quote CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 rounded-3xl bg-navy p-8 sm:p-12 border border-gold/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-block rounded-full bg-gold/20 text-gold px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              Need a Custom Route?
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Travelling Beyond {cityName}?</h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed font-normal">
              Our concierge team arranges custom intercity routes, hourly chauffeuring, and multi-day travel itineraries.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3.5 flex-shrink-0">
            <Link href={`/contact?city=${encodeURIComponent(cityName)}`}>
              <Button variant="gold" size="lg" className="rounded-xl px-7 py-3.5 text-xs sm:text-sm font-extrabold shadow-md cursor-pointer">
                <IconInfoCircle className="mr-2 h-4 w-4" /> Request Custom Quote
              </Button>
            </Link>
            <Link href="tel:+41441234567">
              <Button variant="outline" size="lg" className="rounded-xl border-white/20 text-white hover:bg-white/10 hover:text-white px-7 py-3.5 text-xs sm:text-sm font-bold cursor-pointer">
                <IconPhone className="mr-2 h-4 w-4" /> Speak with Concierge
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
