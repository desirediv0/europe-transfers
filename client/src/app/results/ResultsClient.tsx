"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls, MapRoute } from "@/components/ui/map";
import { api } from "@/lib/api";
import type { SearchResult, SearchData } from "./page";
import {
  IconUsers,
  IconSearch,
  IconArrowLeft,
  IconRoute,
  IconShieldCheck,
  IconDoorEnter,
  IconUserStar,
  IconPlane,
  IconLicense,
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
  IconCreditCard,
  IconCheck,
} from "@tabler/icons-react";

interface ResultsClientProps {
  searchData: SearchData | null;
  error: string | null;
  searchParams: {
    from: string;
    to: string;
    fromId: string;
    toId: string;
    date: string;
    time: string;
    pax: number;
  };
}

const FEATURES = [
  { icon: IconShieldCheck, label: "Free cancellation up to 24h" },
  { icon: IconDoorEnter, label: "Door-to-door service" },
  { icon: IconUserStar, label: "Meet & Greet at pickup" },
  { icon: IconPlane, label: "Flight tracking included" },
  { icon: IconLicense, label: "Licensed & insured chauffeurs" },
];

function VehicleCard({
  item,
  selected,
  onSelect,
  index,
}: {
  item: SearchResult;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <Card
      onClick={onSelect}
      className={`group overflow-hidden transition-all duration-300 cursor-pointer border-border/40 ${
        selected
          ? "ring-2 ring-gold shadow-xl shadow-gold/10 border-gold"
          : "hover:shadow-xl hover:shadow-black/5 hover:border-gold/30 hover:-translate-y-0.5"
      }`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-48 sm:h-auto sm:w-56 bg-muted shrink-0 overflow-hidden">
            {item.carType.image ? (
              <Image
                src={item.carType.image}
                alt={item.carType.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZTBlNWVkIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIvPjwvc3ZnPg=="
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy to-navy-light">
                <IconCar className="h-16 w-16 text-white/20" strokeWidth={1} />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Badge className="rounded-full bg-white/95 text-navy font-semibold border-0 shadow-sm">
                #{index + 1}
              </Badge>
            </div>
          </div>

          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{item.carType.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full text-xs gap-1">
                      <IconUsers className="h-3 w-3" /> {item.carType.seats} seats
                    </Badge>
                    {item.carType.isAC && (
                      <Badge variant="outline" className="rounded-full text-xs gap-1">
                        <IconSnowflake className="h-3 w-3" /> AC
                      </Badge>
                    )}
                    <Badge variant="outline" className="rounded-full text-xs gap-1">
                      <IconLuggage className="h-3 w-3" /> Luggage
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-bold text-gold">€{item.price.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">{item.currency} total</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Up to {item.carType.seats} passengers · Fixed price · No hidden fees
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <IconCheck className="h-4 w-4" />
                <span className="font-medium">Free cancellation up to 24h</span>
              </div>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className={`rounded-full px-5 ${
                  selected
                    ? "bg-navy text-white hover:bg-navy/90"
                    : "bg-gold text-navy hover:bg-gold-light font-semibold"
                }`}
              >
                {selected ? (
                  <span className="flex items-center gap-1">
                    <IconCheck className="h-4 w-4" /> Selected
                  </span>
                ) : (
                  "Select"
                )}
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

function EmptyState({ onGoBack }: { onGoBack: () => void }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <Card className="max-w-lg mx-auto border-border/40 rounded-2xl">
        <CardContent className="py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <IconSearch className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-xl font-bold">No vehicles available for this route</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We don&apos;t service this route yet. Try a different route or contact us for assistance.
          </p>
          <Button onClick={onGoBack} variant="gold" className="mt-6 rounded-full">
            <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ message, onRetry, onGoBack }: { message: string; onRetry: () => void; onGoBack: () => void }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <Card className="max-w-lg mx-auto border-border/40 rounded-2xl">
        <CardContent className="py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <IconX className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="mt-6 text-xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={onGoBack} className="rounded-full">
              <IconArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={onRetry} variant="gold" className="rounded-full">
              <IconRefresh className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResultsClient({
  searchData: initialData,
  error: initialError,
  searchParams: sp,
}: ResultsClientProps) {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [searchData, setSearchData] = useState(initialData);
  const [error, setError] = useState(initialError);
  const [passenger, setPassenger] = useState({ name: "", phone: "", email: "" });

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const data = await api.post<SearchData>("/search", {
        fromLocationId: sp.fromId,
        toLocationId: sp.toId,
        passengers: sp.pax,
      });
      setSearchData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load results");
      toast.error("Could not load results. Please try again.");
    }
  }, [sp]);

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");

  const selected = selectedIdx !== null && searchData ? searchData.cars[selectedIdx] : null;

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
      .catch(() => {});
  }, [searchData]);

  const handleContinue = () => {
    if (!selected) {
      toast.error("Please select a vehicle first");
      return;
    }
    if (!passenger.name || !passenger.phone) {
      toast.error("Please enter your name and phone to continue");
      return;
    }

    router.push(
      `/checkout?routeId=${searchData?.route.id}&carTypeId=${selected.carType.id}&routePriceId=${selected.routePriceId}&from=${encodeURIComponent(
        sp.from
      )}&to=${encodeURIComponent(sp.to)}&date=${sp.date}&time=${sp.time}&pax=${sp.pax}&price=${selected.price}&currency=${selected.currency}&name=${encodeURIComponent(
        passenger.name
      )}&phone=${encodeURIComponent(passenger.phone)}&email=${encodeURIComponent(passenger.email)}`
    );
  };

  if (!searchData && !error) return <ResultsSkeleton />;
  if (error && !searchData) return <ErrorState message={error} onRetry={fetchData} onGoBack={() => router.push("/")} />;
  if (searchData && searchData.cars.length === 0) return <EmptyState onGoBack={() => router.push("/")} />;
  if (!searchData?.route) return <ErrorState message="Route data not found. Please try again." onRetry={fetchData} onGoBack={() => router.push("/")} />;

  const hasCoords = searchData.route.from.latitude && searchData.route.from.longitude && searchData.route.to.latitude && searchData.route.to.longitude;

  const mapCenter: [number, number] = hasCoords
    ? [(searchData.route.from.longitude! + searchData.route.to.longitude!) / 2, (searchData.route.from.latitude! + searchData.route.to.latitude!) / 2]
    : [9, 48];

  const formatDistance = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);
  const formatDuration = (s: number) => {
    const mins = Math.round(s / 60);
    return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push("/")}
            className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/70 hover:bg-white/20 hover:text-white transition-colors"
          >
            <IconArrowLeft className="h-4 w-4" /> New search
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Choose Your <span className="text-gold">Transfer</span>
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/70">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
              <IconMapPin className="h-4 w-4 text-gold" />
              <span>{searchData.route.from.name}</span>
            </div>
            <IconArrowRight className="h-4 w-4 text-gold hidden sm:block" />
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
              <IconMapPin className="h-4 w-4 text-gold" />
              <span>{searchData.route.to.name}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
              <IconCalendar className="h-4 w-4 text-gold" />
              <span>{formatDate(sp.date)} · {sp.time || "—"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
              <IconUsers className="h-4 w-4 text-gold" />
              <span>{sp.pax} {sp.pax === 1 ? "passenger" : "passengers"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      {hasCoords && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          <Card className="overflow-hidden rounded-2xl border-border/40">
            <div className="h-[300px] sm:h-[400px] relative">
              <Map center={mapCenter} zoom={routeCoords.length > 0 ? undefined : 7} theme={mapTheme}>
                <MapControls showZoom={true} position="bottom-right" />

                {routeCoords.length > 0 && <MapRoute coordinates={routeCoords} color="#C9A227" width={5} opacity={1} />}

                <MapMarker longitude={searchData.route.from.longitude!} latitude={searchData.route.from.latitude!}>
                  <MarkerContent>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white shadow-lg ring-4 ring-white">
                      A
                    </div>
                  </MarkerContent>
                  <MarkerTooltip>{searchData.route.from.name} - Pickup</MarkerTooltip>
                </MapMarker>
                <MapMarker longitude={searchData.route.to.longitude!} latitude={searchData.route.to.latitude!}>
                  <MarkerContent>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sm font-bold text-navy shadow-lg ring-4 ring-white">
                      B
                    </div>
                  </MarkerContent>
                  <MarkerTooltip>{searchData.route.to.name} - Drop-off</MarkerTooltip>
                </MapMarker>
              </Map>

              <button
                onClick={() => setMapTheme(mapTheme === "light" ? "dark" : "light")}
                className="absolute top-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg border bg-white/95 shadow-sm backdrop-blur transition-colors hover:bg-accent"
              >
                {mapTheme === "light" ? <IconMoon className="h-4 w-4" /> : <IconSun className="h-4 w-4" />}
              </button>
            </div>
            {routeInfo && (
              <div className="flex items-center gap-6 border-t bg-white px-5 py-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IconRoad className="h-4 w-4 text-gold" />
                  <span className="font-medium text-foreground">{formatDistance(routeInfo.distance)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IconClock className="h-4 w-4 text-gold" />
                  <span className="font-medium text-foreground">{formatDuration(routeInfo.duration)}</span>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconRoute className="h-3.5 w-3.5" /> Estimated driving time
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
          {/* LEFT - Cars */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 rounded-xl bg-white border border-border/40 px-4 py-4 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">A</span>
              <div>
                <p className="font-semibold leading-tight">{searchData.route.from.name}</p>
                <p className="text-xs text-muted-foreground">{searchData.route.from.city}</p>
              </div>
              <IconArrowRight className="h-5 w-5 text-gold mx-2" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">B</span>
              <div>
                <p className="font-semibold leading-tight">{searchData.route.to.name}</p>
                <p className="text-xs text-muted-foreground">{searchData.route.to.city}</p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconRoute className="h-3.5 w-3.5" /> Transfer
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Available Cars ({searchData.cars.length})</h2>
                <span className="text-sm text-muted-foreground">Sorted by price</span>
              </div>
              <div className="space-y-4">
                {searchData.cars.map((car, idx) => (
                  <VehicleCard
                    key={car.routePriceId}
                    item={car}
                    selected={selectedIdx === idx}
                    onSelect={() => setSelectedIdx(idx)}
                    index={idx}
                  />
                ))}
              </div>
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 rounded-2xl bg-white border border-border/40 py-5 px-4 text-sm text-muted-foreground shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="h-4 w-4 fill-emerald-500 text-emerald-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-medium text-foreground">Excellent</span>
              </div>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span>2,847 verified reviews</span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span className="flex items-center gap-1">
                <IconShieldCheck className="h-4 w-4 text-emerald-500" /> 24/7 support
              </span>
            </div>
          </div>

          {/* RIGHT - Booking summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden rounded-2xl border-border/40 shadow-lg shadow-black/5">
              <div className="bg-navy px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <IconCreditCard className="h-5 w-5 text-gold" /> Your Booking
                </h2>
              </div>
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="rounded-full text-xs gap-1">
                    <IconRoute className="h-3 w-3" /> One way
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-xs gap-1">
                    <IconUsers className="h-3 w-3" /> {sp.pax} pax
                  </Badge>
                  {selected && (
                    <Badge variant="outline" className="rounded-full text-xs gap-1 border-gold/30 text-gold bg-gold/5">
                      <IconCar className="h-3 w-3" /> {selected.carType.name}
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy text-[9px] font-bold text-white">A</span>
                    <div>
                      <p className="font-medium">{searchData.route.from.name}</p>
                      <p className="text-xs text-muted-foreground">{sp.time || "Pickup time"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-navy">B</span>
                    <div>
                      <p className="font-medium">{searchData.route.to.name}</p>
                      <p className="text-xs text-muted-foreground">Drop-off</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {selected ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{selected.carType.name}</span>
                      <span className="font-semibold">€{selected.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span className="text-gold">€{selected.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Fixed price in {selected.currency}</p>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-2">Select a car to see the price</p>
                )}

                <Separator />

                {/* Passenger Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <IconUserStar className="h-4 w-4 text-gold" /> Passenger Details
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-xs">Full Name *</Label>
                    <Input
                      value={passenger.name}
                      onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                      placeholder="John Doe"
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Phone *</Label>
                    <Input
                      value={passenger.phone}
                      onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                      placeholder="+39 123 456 7890"
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={passenger.email}
                      onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                      placeholder="john@example.com"
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2.5 text-sm text-muted-foreground">
                  {FEATURES.map((feature) => (
                    <div key={feature.label} className="flex items-center gap-2">
                      <feature.icon className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold rounded-full"
                  variant="gold"
                  disabled={!selected}
                  onClick={handleContinue}
                >
                  {selected ? (
                    <span className="flex items-center gap-2">
                      Continue <IconArrowRight className="h-4 w-4" />
                    </span>
                  ) : (
                    "Select a car to continue"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <IconShieldCheck className="h-3 w-3" /> Secure booking · No hidden fees
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
