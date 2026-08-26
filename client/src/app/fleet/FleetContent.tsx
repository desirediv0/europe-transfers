"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls, MapRoute } from "@/components/ui/map";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import TransferSearchWidget from "@/components/TransferSearchWidget";
import maplibregl from "maplibre-gl";
import type { SearchResult, SearchData } from "./page";
import type { CarType } from "@/lib/types";
import {
  IconUsers,
  IconSearch,
  IconArrowLeft,
  IconRoute,
  IconShieldCheck,
  IconRefresh,
  IconX,
  IconSnowflake,
  IconClock,
  IconRoad,
  IconSun,
  IconMoon,
  IconCar,
  IconMapPin,
  IconCalendar,
  IconArrowRight,
  IconLuggage,
  IconCheck,
  IconLock,
  IconFile,
  IconWifi,
  IconBabyCarriage,
  IconCrown,
  IconPaw,
  IconCreditCard,
  IconChecklist,
  IconSparkles,
} from "@tabler/icons-react";

interface FleetContentProps {
  demoData?: SearchData;
  realData?: SearchData | null;
  error?: string | null;
  isLoggedIn?: boolean;
  searchParams?: {
    from: string;
    to: string;
    fromId: string;
    toId: string;
    date: string;
    time: string;
    pax: number;
  };
}

const processSteps = [
  { step: "01", title: "Search Engine", desc: "Select pickup, drop & date", icon: IconSearch },
  { step: "02", title: "Product / Fleet", desc: "Choose Mercedes S-Class or V-Class", icon: IconCar },
  { step: "03", title: "Booking Engine", desc: "Enter passenger & flight info", icon: IconChecklist },
  { step: "04", title: "Payment / Inquiry", desc: "All-inclusive fixed rate", icon: IconCreditCard },
  { step: "05", title: "Once Booked", desc: "Instant voucher & driver info", icon: IconShieldCheck },
];

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

const CAR_IMAGE_FALLBACKS: Record<string, string> = {
  sedan: "/images/about_luxury_chauffeur.png",
  suv: "/images/hero_swiss_alps.png",
  minivan: "/images/why_choose_us_chauffeur.png",
  van: "/images/why_choose_us_chauffeur.png",
  coach: "/images/hero_amalfi_coast.png",
};

function VehicleCard({
  item,
  selected,
  onSelect,
  index,
  isLocked,
}: {
  item: SearchResult;
  selected: boolean;
  onSelect: () => void;
  index: number;
  isLocked?: boolean;
}) {
  const { format } = useCurrency();
  const fallbackImg = CAR_IMAGE_FALLBACKS[item.carType.id.toLowerCase()] || CAR_IMAGE_FALLBACKS.sedan;
  const imgSrc = item.carType.image || fallbackImg;

  return (
    <Card
      onClick={onSelect}
      className={`group overflow-hidden transition-all duration-300 cursor-pointer rounded-3xl border ${isLocked
        ? "border-blue-200 bg-blue-50/20 opacity-85"
        : selected
          ? "ring-2 ring-gold border-gold bg-gradient-to-r from-amber-50/30 to-white shadow-2xl scale-[1.01]"
          : "border-gray-200/80 bg-white hover:shadow-2xl hover:border-gold/50 hover:-translate-y-1"
        }`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-48 sm:h-auto sm:w-64 bg-slate-900 shrink-0 overflow-hidden">
            <img
              src={imgSrc}
              alt={item.carType.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden" />
            <div className="absolute top-3 left-3">
              <Badge className={`rounded-full font-black text-xs px-3 py-1 border-0 shadow-md ${isLocked ? "bg-blue-600 text-white" : "bg-navy text-gold"}`}>
                #{index + 1}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3 sm:hidden text-white font-extrabold text-lg">
              {item.carType.name}
            </div>
          </div>

          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="hidden sm:block text-xl font-black text-navy tracking-tight">{item.carType.name}</h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-xl text-xs font-bold gap-1.5 px-3 py-1 bg-slate-50 border-gray-200 text-navy">
                      <IconUsers className="h-3.5 w-3.5 text-gold" /> {item.carType.seats} Passengers
                    </Badge>
                    {item.carType.isAC && (
                      <Badge variant="outline" className="rounded-xl text-xs font-bold gap-1.5 px-3 py-1 bg-slate-50 border-gray-200 text-navy">
                        <IconSnowflake className="h-3.5 w-3.5 text-sky-500" /> Climate Control
                      </Badge>
                    )}
                    <Badge variant="outline" className="rounded-xl text-xs font-bold gap-1.5 px-3 py-1 bg-slate-50 border-gray-200 text-navy">
                      <IconLuggage className="h-3.5 w-3.5 text-gold" /> Standard Luggage
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-black text-navy tracking-tight">{format(item.price)}</div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{item.currency} Total · All-Inclusive</p>
                </div>
              </div>
              <p className="mt-3.5 text-xs text-gray-500 font-medium leading-relaxed">
                Premium luxury chauffeur service with meet & greet, flight tracking, and complimentary bottled water.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span>Free cancellation up to 24h</span>
              </div>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className={`rounded-xl px-5 py-2.5 text-xs font-black transition-all cursor-pointer shadow-md ${isLocked
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                  : selected
                    ? "bg-navy text-gold ring-2 ring-gold shadow-navy/20"
                    : "bg-gold text-navy hover:bg-gold-light hover:scale-105 shadow-gold/20"
                  }`}
              >
                {isLocked ? "Login to Book" : selected ? <span className="flex items-center gap-1.5"><IconCheck className="h-4 w-4 stroke-[3]" /> Selected</span> : "Select Vehicle"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-4 w-96 mb-8" />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function AuthOverlay({ type, onLogin, onVerify }: { type: "login" | "verify"; onLogin: () => void; onVerify: () => void }) {
  if (type === "login") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <Card className="w-full max-w-md border-0 overflow-hidden shadow-2xl rounded-md bg-white font-sans">
          <div className="h-2 bg-gradient-to-r from-gold via-amber-300 to-gold" />
          <CardContent className="py-10 px-6 sm:px-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-gold/15 text-navy border border-gold/30 shadow-sm">
              <IconLock className="h-8 w-8 text-gold" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gold uppercase tracking-widest">Authentication Required</span>
              <h2 className="mt-1 text-2xl font-black text-navy">Sign In to Continue</h2>
              <p className="mt-2 text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Please sign in to your account to view live fixed route prices and complete your transfer booking.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2.5">
              <Button onClick={onLogin} className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light font-black text-navy text-xs shadow-lg shadow-gold/20 cursor-pointer">
                Sign In to View Prices <IconArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button onClick={onVerify} variant="ghost" className="w-full h-11 rounded-xl text-xs font-bold text-gray-500 hover:text-navy hover:bg-slate-100">
                Browse Fleet Only
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-0 overflow-hidden shadow-2xl rounded-md bg-white font-sans">
        <div className="h-2 bg-gradient-to-r from-gold via-amber-300 to-gold" />
        <CardContent className="py-10 px-6 sm:px-8 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-navy border border-gold/30 shadow-sm">
            <IconFile className="h-8 w-8 text-gold" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gold uppercase tracking-widest">Document Verification</span>
            <h2 className="mt-1 text-2xl font-black text-navy">Verify Government ID</h2>
            <p className="mt-2 text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              Upload your passport or driving license to complete client verification and unlock direct instant bookings.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Button onClick={onVerify} className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light font-black text-navy text-xs shadow-lg shadow-gold/20 cursor-pointer">
              Upload Government ID Now <IconArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button onClick={onLogin} variant="ghost" className="w-full h-11 rounded-xl text-xs font-bold text-gray-500 hover:text-navy hover:bg-slate-100">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FleetGallery({ carTypes, loading, basePath }: { carTypes: CarType[]; loading: boolean; basePath: string }) {
  const isPrivateTransfers = basePath === "/private-transfers";

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-[#060C17] text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0B1426]/90 to-black/80 z-10" />
        <div className="absolute top-10 right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />

        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-black text-gold uppercase tracking-wider mb-4 border border-gold/30">
            <IconCar className="h-4 w-4 text-gold" />
            First-Class European Fleet
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            PRIVATE TRANSFERS
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal mb-8">
            Select your pickup & drop-off locations across 120+ European cities for instant all-inclusive fixed pricing.
          </p>

          <div className="max-w-4xl mx-auto text-left">
            <TransferSearchWidget />
          </div>
        </div>
      </section>

      {!isPrivateTransfers && (
        <>
          {/* Client Handwritten Process Flow Steps Bar */}
          <section className="bg-white border-b border-gray-200/80 py-8 shadow-xs">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {processSteps.map((s) => (
                  <div key={s.step} className="p-4 rounded-2xl bg-slate-50 border border-gray-100 space-y-2 hover:border-gold/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gold uppercase tracking-widest">{s.step}</span>
                      <s.icon className="h-4 w-4 text-navy" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-navy leading-snug">{s.title}</h4>
                    <p className="text-[10px] text-gray-500 font-medium leading-tight">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Step 01: Process Flow & Highlights */}
          <section className="bg-slate-50 border-b border-gray-200/80 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[380px] group border border-gray-200/80">
                <img
                  src="/images/about_luxury_chauffeur.png"
                  alt="Luxury Chauffeured Transfer Europe"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                <div className="absolute top-6 right-6 z-10">
                  <Badge className="rounded-full bg-gold text-navy border-0 px-4 py-1.5 text-xs font-black shadow-md">
                    All-Inclusive Fixed Rates
                  </Badge>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white z-10 space-y-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white border border-white/30">
                    <IconSparkles className="h-3.5 w-3.5 text-gold" /> Guaranteed Mercedes-Benz Fleet
                  </div>

                  <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                    First-Class Chauffeured Journeys
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-semibold text-gray-200">
                    <div className="flex items-center gap-2">
                      <IconCheck className="h-4 w-4 text-gold flex-shrink-0" />
                      <span>60 Min Free Airport Wait</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconCheck className="h-4 w-4 text-gold flex-shrink-0" />
                      <span>Real-Time Flight Tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconCheck className="h-4 w-4 text-gold flex-shrink-0" />
                      <span>Non-Smoking Luxury Fleet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconCheck className="h-4 w-4 text-gold flex-shrink-0" />
                      <span>24/7 Live Concierge Team</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Vehicle Benefits Bar */}
          <section className="bg-white border-b border-gray-200/80 py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {fleetBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-gold flex-shrink-0">
                      <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold text-navy">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Step 02: Vehicle Fleet Cards Grid */}
          <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="text-center mb-10 sm:mb-14">
              <span className="text-xs font-bold tracking-widest text-gold uppercase">Step 02: Product Selection</span>
              <h2 className="mt-1 text-2xl sm:text-4xl font-black text-navy">Choose Your Luxury Ride</h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
                All rates include meet & greet, flight tracking, luggage assistance, and 60 minutes free wait time.
              </p>
            </div>

            {/* 2-Column Mobile Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-3xl">
                    <Skeleton className="h-44 sm:h-56 w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))
                : carTypes.map((ct) => {
                  const fallbackImg = CAR_IMAGE_FALLBACKS[ct.id.toLowerCase()] || CAR_IMAGE_FALLBACKS.sedan;
                  const imgSrc = ct.image || fallbackImg;

                  return (
                    <Card key={ct.id} className="group overflow-hidden rounded-3xl border-gray-200/80 bg-white transition-all duration-300 hover:shadow-xl hover:border-gold/40 hover:-translate-y-1 flex flex-col justify-between">
                      <CardContent className="p-0">
                        <div className="relative h-36 sm:h-56 bg-slate-100 overflow-hidden">
                          <img src={imgSrc} alt={ct.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute top-3 right-3 z-10">
                            <Badge className="rounded-full bg-navy text-gold border-0 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold">{ct.name}</Badge>
                          </div>
                        </div>
                        <div className="p-3.5 sm:p-6 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm sm:text-xl font-black text-navy">{ct.name}</h3>
                            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-500 bg-slate-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                              <IconUsers className="h-3 w-3 text-gold" />
                              <span>{ct.seats} seats</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {featureMap.map(({ key, label, icon: Icon }) =>
                              ct[key as keyof CarType] ? (
                                <div key={key} className="flex items-center gap-1 rounded-md bg-gold/10 px-2 py-0.5 text-[9px] sm:text-xs font-bold text-navy">
                                  <Icon className="h-3 w-3 text-gold" />
                                  <span className="hidden sm:inline">{label}</span>
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      </CardContent>

                      <div className="p-3.5 sm:p-6 pt-0 mt-auto">
                        <Link href={`/contact?service=${encodeURIComponent(ct.name)}`} className="block">
                          <Button className="w-full rounded-xl py-2.5 text-xs font-extrabold bg-gold hover:bg-gold-light text-navy shadow-md cursor-pointer">
                            Book {ct.name} <IconArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </section>
        </>
      )}
    </>
  );
}

export default function FleetContent({
  demoData,
  realData,
  error: initialError,
  isLoggedIn = false,
  searchParams: sp,
}: FleetContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/private-transfers") ? "/private-transfers" : "/fleet";
  const { user, verificationStep, loading: authLoading } = useAuth();
  const { format } = useCurrency();
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [passenger, setPassenger] = useState({ name: user?.name || "", phone: user?.phone || "", email: user?.email || "" });
  const [error, setError] = useState(initialError);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");

  const isSearchMode = !!sp;

  useEffect(() => {
    if (user) {
      setPassenger({ name: user.name || "", phone: user.phone || "", email: user.email || "" });
    }
  }, [user]);

  useEffect(() => {
    api.get<{ items: CarType[] }>("/car-types?limit=100")
      .then((d) => setCarTypes(d.items))
      .catch(() => setCarTypes([]))
      .finally(() => setLoadingCars(false));
  }, []);

  const isVerified = verificationStep === "VERIFIED";
  const showRealData = isLoggedIn && isVerified && realData;
  const searchData = showRealData ? realData! : demoData || null;
  const isLocked = isSearchMode && !showRealData;

  const fetchData = useCallback(async () => {
    if (!sp) return;
    setError(null);
    try {
      await api.post<SearchData>("/search", {
        fromLocationId: sp.fromId,
        toLocationId: sp.toId,
        passengers: sp.pax,
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load results");
    }
  }, [sp, router]);

  useEffect(() => {
    if (!searchData?.route) return;
    const from = searchData.route.from;
    const to = searchData.route.to;
    if (!from.latitude || !from.longitude || !to.latitude || !to.longitude) return;

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.routes?.[0]) {
          setRouteCoords(data.routes[0].geometry.coordinates);
          setRouteInfo({ distance: data.routes[0].distance, duration: data.routes[0].duration });
        }
      })
      .catch(() => { });
  }, [searchData]);

  useEffect(() => {
    if (!mapRef.current || routeCoords.length < 2) return;
    const bounds = new maplibregl.LngLatBounds();
    routeCoords.forEach((coord) => bounds.extend(coord));
    mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 0 });
  }, [routeCoords]);

  const handleCarSelect = (idx: number) => {
    if (isLocked) return;
    setSelectedIdx(idx);
  };

  const handleContinue = () => {
    if (isLocked) return;
    if (!selected) { return; }
    if (!passenger.name || !passenger.phone) { return; }

    router.push(
      `/checkout?routeId=${searchData?.route.id}&carTypeId=${selected.carType.id}&routePriceId=${selected.routePriceId}&from=${encodeURIComponent(sp!.from)}&to=${encodeURIComponent(sp!.to)}&date=${sp!.date}&time=${sp!.time}&pax=${sp!.pax}&price=${selected.price}&currency=${selected.currency}&name=${encodeURIComponent(passenger.name)}&phone=${encodeURIComponent(passenger.phone)}&email=${encodeURIComponent(passenger.email)}`
    );
  };

  const selected = selectedIdx !== null && searchData ? searchData.cars[selectedIdx] : null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try { return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); } catch { return dateStr; }
  };

  const formatDistance = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);
  const formatDuration = (s: number) => {
    const mins = Math.round(s / 60);
    return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  if (!isSearchMode) {
    return <FleetGallery carTypes={carTypes} loading={loadingCars} basePath={basePath} />;
  }

  if (!searchData && !error) return <ResultsSkeleton />;
  if (error && !searchData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 font-sans">
        <Card className="max-w-lg mx-auto border-gray-200/80 rounded-3xl">
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <IconX className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="mt-6 text-xl font-bold">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="outline" onClick={() => router.push(basePath)} className="rounded-xl"><IconArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
              <Button onClick={fetchData} variant="gold" className="rounded-xl"><IconRefresh className="mr-2 h-4 w-4" /> Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (searchData && searchData.cars.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 font-sans">
        <Card className="max-w-xl mx-auto border-gray-100 rounded-3xl overflow-hidden shadow-2xl bg-white">
          <CardContent className="py-14 px-8 text-center flex flex-col items-center">
            <div className="w-full max-w-sm h-56 relative mb-6">
              <img
                src="/images/no_vehicles_route_found.png"
                alt="No vehicles available for this route"
                className="w-full h-full object-contain mx-auto drop-shadow-md"
              />
            </div>
            <h2 className="text-2xl font-black text-navy tracking-tight">No vehicles available for this route</h2>
            <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              We currently do not have active transfer vehicles assigned for this specific route. Please select a different pickup or destination location, or contact customer support.
            </p>
            <Button onClick={() => router.push(basePath)} variant="gold" className="mt-8 rounded-2xl font-black text-sm px-8 py-3.5 shadow-lg shadow-gold/20 hover:scale-105 transition-all">
              <IconArrowLeft className="mr-2 h-4 w-4 stroke-[3]" /> Back to Fleet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!searchData?.route) return null;

  const hasCoords = searchData.route.from.latitude && searchData.route.from.longitude && searchData.route.to.latitude && searchData.route.to.longitude;
  const mapCenter: [number, number] = hasCoords
    ? [(searchData.route.from.longitude! + searchData.route.to.longitude!) / 2, (searchData.route.from.latitude! + searchData.route.to.latitude!) / 2]
    : [9, 48];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      {!authLoading && isLocked && !isLoggedIn && (
        <AuthOverlay type="login" onLogin={() => router.push("/auth/login")} onVerify={() => router.back()} />
      )}
      {!authLoading && isLocked && isLoggedIn && !isVerified && (
        <AuthOverlay type="verify" onLogin={() => router.back()} onVerify={() => router.push("/account")} />
      )}

      <div className="bg-gradient-to-r from-navy via-[#0B1528] to-navy text-white border-b border-white/10 shadow-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              onClick={() => router.push(basePath)}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-gold hover:text-navy px-4 py-2 text-xs font-black text-white/90 backdrop-blur-md border border-white/10 transition-all shadow-md cursor-pointer"
            >
              <IconArrowLeft className="h-4 w-4 stroke-[3]" /> Back to Fleet Search
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
              <IconSparkles className="h-3.5 w-3.5" /> Instant Confirmation
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-300 to-gold">Transfer Vehicle</span>
          </h1>

          {/* Route Summary Badges Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-extrabold">
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2.5 border border-white/15 shadow-sm text-white">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-gold">
                <IconMapPin className="h-3.5 w-3.5" />
              </div>
              <span className="tracking-wide">{searchData.route.from.name}</span>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/30">
              <IconArrowRight className="h-4 w-4 stroke-[3]" />
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2.5 border border-white/15 shadow-sm text-white">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-gold">
                <IconMapPin className="h-3.5 w-3.5" />
              </div>
              <span className="tracking-wide">{searchData.route.to.name}</span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2.5 border border-white/15 shadow-sm text-white">
              <IconCalendar className="h-4 w-4 text-gold" />
              <span>{formatDate(sp.date)} · {sp.time || "—"}</span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2.5 border border-white/15 shadow-sm text-white">
              <IconUsers className="h-4 w-4 text-gold" />
              <span>{sp.pax} {sp.pax === 1 ? "Passenger" : "Passengers"}</span>
            </div>
          </div>
        </div>
      </div>

      {hasCoords && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          <Card className="overflow-hidden rounded-3xl border-gray-200/80 shadow-md">
            <div className="h-[300px] sm:h-[400px] relative">
              <Map ref={mapRef} center={mapCenter} zoom={routeCoords.length > 0 ? undefined : 7} theme={mapTheme}>
                <MapControls showZoom={true} position="bottom-right" />
                {routeCoords.length > 0 && <MapRoute coordinates={routeCoords} color="#C9A227" width={5} opacity={1} />}
                <MapMarker longitude={searchData.route.from.longitude!} latitude={searchData.route.from.latitude!}>
                  <MarkerContent>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-sm font-bold text-white shadow-xl ring-4 ring-white"><IconMapPin className="h-5 w-5" /></div>
                  </MarkerContent>
                  <MarkerTooltip>{searchData.route.from.name} - Pickup</MarkerTooltip>
                </MapMarker>
                <MapMarker longitude={searchData.route.to.longitude!} latitude={searchData.route.to.latitude!}>
                  <MarkerContent>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-sm font-bold text-navy shadow-xl ring-4 ring-white"><IconMapPin className="h-5 w-5" /></div>
                  </MarkerContent>
                  <MarkerTooltip>{searchData.route.to.name} - Drop-off</MarkerTooltip>
                </MapMarker>
              </Map>
              <button onClick={() => setMapTheme(mapTheme === "light" ? "dark" : "light")} className="absolute top-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border bg-white shadow-sm backdrop-blur transition-colors hover:bg-slate-100 cursor-pointer">
                {mapTheme === "light" ? <IconMoon className="h-4 w-4" /> : <IconSun className="h-4 w-4" />}
              </button>
            </div>
            {routeInfo && (
              <div className="flex items-center gap-6 border-t bg-white px-5 py-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-navy"><IconRoad className="h-4 w-4 text-gold" /><span>{formatDistance(routeInfo.distance)}</span></div>
                <div className="flex items-center gap-1.5 text-navy"><IconClock className="h-4 w-4 text-gold" /><span>{formatDuration(routeInfo.duration)}</span></div>
                <div className="ml-auto flex items-center gap-1.5 text-[11px] text-gray-500"><IconRoute className="h-3.5 w-3.5" /> Estimated driving time</div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Vehicle Selection & Passenger Booking Engine Form */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="space-y-4">
            {searchData.cars.map((item, idx) => (
              <VehicleCard
                key={item.routePriceId}
                item={item}
                selected={selectedIdx === idx}
                onSelect={() => handleCarSelect(idx)}
                index={idx}
                isLocked={isLocked}
              />
            ))}
          </div>

          {/* Step 03: Booking Engine Form Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <Card className="border-gray-200/80 bg-white rounded-3xl shadow-xl overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <div className="border-b border-gray-100 pb-4">
                  <span className="text-[10px] font-black text-gold uppercase tracking-widest bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">Step 03: Booking Engine</span>
                  <h3 className="text-xl font-black text-navy mt-2.5 tracking-tight">Passenger Details</h3>
                  <p className="text-xs text-gray-500 mt-1">Enter your details to confirm your chauffeured journey.</p>
                </div>

                {selected ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-gold/15 to-amber-500/5 border border-gold/30 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] font-extrabold text-gold-dark uppercase tracking-wider">Selected Vehicle</p>
                      <p className="text-lg font-black text-navy">{selected.carType.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-navy">{format(selected.price)}</p>
                      <p className="text-[10px] font-bold text-emerald-600">Fixed Rate · All-Inclusive</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-gray-200 text-center text-xs font-bold text-gray-500">
                    👈 Select a vehicle on the left to proceed with booking.
                  </div>
                )}

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="text-xs font-extrabold text-navy">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={passenger.name}
                      onChange={(e) => setPassenger((p) => ({ ...p, name: e.target.value }))}
                      className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-slate-50/50 p-3.5 text-xs font-semibold text-navy placeholder:text-gray-400 focus:outline-none focus:border-gold focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-navy">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      placeholder="e.g. +41 44 123 4567"
                      value={passenger.phone}
                      onChange={(e) => setPassenger((p) => ({ ...p, phone: e.target.value }))}
                      className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-slate-50/50 p-3.5 text-xs font-semibold text-navy placeholder:text-gray-400 focus:outline-none focus:border-gold focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-navy">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. codeshorts007@gmail.com"
                      value={passenger.email}
                      onChange={(e) => setPassenger((p) => ({ ...p, email: e.target.value }))}
                      className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-slate-50/50 p-3.5 text-xs font-semibold text-navy placeholder:text-gray-400 focus:outline-none focus:border-gold focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!selected || !passenger.name || !passenger.phone}
                  className="mt-4 w-full h-13 rounded-2xl bg-gold hover:bg-gold-light text-navy font-black text-sm shadow-xl shadow-gold/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <IconArrowRight className="h-4 w-4 stroke-[3]" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
