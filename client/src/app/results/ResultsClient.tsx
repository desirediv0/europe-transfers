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

function VehicleCard({
  item,
  selected,
  onSelect,
}: {
  item: SearchResult;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={`overflow-hidden transition-all ${selected ? "ring-2 ring-[#C9A227] shadow-lg" : "hover:shadow-md"
        }`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-44 sm:h-auto sm:w-52 bg-muted shrink-0">
            {item.carType.image ? (
              <Image
                src={item.carType.image}
                alt={item.carType.name}
                fill
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZTBlNWVkIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIvPjwvc3ZnPg=="
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#1B2A4A]/5">
                <IconSearch className="h-10 w-10 text-muted-foreground/30" />
              </div>
            )}
          </div>

          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold">{item.carType.name}</h3>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.carType.seats} seats
                    </Badge>
                    {item.carType.isAC && (
                      <Badge variant="outline" className="text-xs">
                        <IconSnowflake className="mr-1 h-3 w-3" />
                        AC
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-[#C9A227]">
                    €{item.price.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.currency}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <IconUsers className="h-4 w-4 text-[#1B2A4A]" />
                  Up to {item.carType.seats} passengers
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#00b67a]">
                <IconShieldCheck className="h-4 w-4" />
                Free cancellation up to 24h
              </div>
              <Button
                size="sm"
                onClick={onSelect}
                className={
                  selected
                    ? "bg-[#1B2A4A] text-white"
                    : "bg-[#C9A227] text-[#1B2A4A] hover:bg-[#C9A227]/90"
                }
              >
                {selected ? "Selected" : "Select"}
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
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

function EmptyState({ onGoBack }: { onGoBack: () => void }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <Card className="max-w-lg mx-auto">
        <CardContent className="py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1B2A4A]/5">
            <IconSearch className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="mt-6 font-serif text-xl font-bold">No vehicles available for this route</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We don&apos;t service this route yet. Try a different route or contact us for assistance.
          </p>
          <Button onClick={onGoBack} className="mt-6 bg-[#1B2A4A] text-white hover:bg-[#1B2A4A]/90">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ message, onRetry, onGoBack }: { message: string; onRetry: () => void; onGoBack: () => void }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <Card className="max-w-lg mx-auto">
        <CardContent className="py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <IconX className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="mt-6 font-serif text-xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={onGoBack}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={onRetry} className="bg-[#1B2A4A] text-white hover:bg-[#1B2A4A]/90">
              <IconRefresh className="mr-2 h-4 w-4" />
              Try Again
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

    fetch(`https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => {
        if (data.routes?.[0]) {
          setRouteCoords(data.routes[0].geometry.coordinates);
          setRouteInfo({ distance: data.routes[0].distance, duration: data.routes[0].duration });
        }
      })
      .catch(() => {});
  }, [searchData]);

  if (!searchData && !error) return <ResultsSkeleton />;
  if (error && !searchData) return <ErrorState message={error} onRetry={fetchData} onGoBack={() => router.push("/")} />;
  if (searchData && searchData.cars.length === 0) return <EmptyState onGoBack={() => router.push("/")} />;
  if (!searchData?.route) return <ErrorState message="Route data not found. Please try again." onRetry={fetchData} onGoBack={() => router.push("/")} />;

  const hasCoords = searchData.route.from.latitude && searchData.route.from.longitude && searchData.route.to.latitude && searchData.route.to.longitude;

  const mapCenter: [number, number] = hasCoords
    ? [(searchData.route.from.longitude! + searchData.route.to.longitude!) / 2, (searchData.route.from.latitude! + searchData.route.to.latitude!) / 2]
    : [9, 48];

  const formatDistance = (m: number) => m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  const formatDuration = (s: number) => { const mins = Math.round(s / 60); return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`; };

  return (
    <>
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <button
            onClick={() => router.push("/")}
            className="mb-2 flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <IconArrowLeft className="h-4 w-4" />
            New search
          </button>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">Choose Your Transfer</h1>
          <p className="mt-1 text-sm text-white/60">
            {searchData.route.from.name} → {searchData.route.to.name} · {sp.date} at {sp.time} · {sp.pax}{" "}
            {sp.pax === 1 ? "passenger" : "passengers"}
          </p>
        </div>
      </div>

      {/* Map */}
      {hasCoords && (
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <Card className="overflow-hidden">
            <div className="h-[300px] sm:h-[400px] relative">
              <Map
                center={mapCenter}
                zoom={routeCoords.length > 0 ? undefined : 7}
                theme={mapTheme}
              >
                <MapControls showZoom={false} position="bottom-right" />

                {routeCoords.length > 0 && (
                  <MapRoute coordinates={routeCoords} color="#2563EB" width={5} opacity={1} />
                )}

                <MapMarker
                  longitude={searchData.route.from.longitude!}
                  latitude={searchData.route.from.latitude!}
                >
                  <MarkerContent>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B2A4A] text-[12px] font-bold text-white shadow-lg ring-3 ring-white">
                      A
                    </div>
                  </MarkerContent>
                  <MarkerTooltip>{searchData.route.from.name} - Pickup</MarkerTooltip>
                </MapMarker>
                <MapMarker
                  longitude={searchData.route.to.longitude!}
                  latitude={searchData.route.to.latitude!}
                >
                  <MarkerContent>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A227] text-[12px] font-bold text-[#1B2A4A] shadow-lg ring-3 ring-white">
                      B
                    </div>
                  </MarkerContent>
                  <MarkerTooltip>{searchData.route.to.name} - Drop-off</MarkerTooltip>
                </MapMarker>
              </Map>

              {/* Light/Dark toggle */}
              <button
                onClick={() => setMapTheme(mapTheme === "light" ? "dark" : "light")}
                className="absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-md border bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-accent"
              >
                {mapTheme === "light" ? (
                  <IconMoon className="h-4 w-4" />
                ) : (
                  <IconSun className="h-4 w-4" />
                )}
              </button>
            </div>
            {routeInfo && (
              <div className="flex items-center gap-4 border-t bg-muted/30 px-4 py-2.5 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IconRoad className="h-4 w-4" />
                  <span className="font-medium">{formatDistance(routeInfo.distance)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IconClock className="h-4 w-4" />
                  <span className="font-medium">{formatDuration(routeInfo.duration)}</span>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconRoute className="h-3.5 w-3.5" />
                  Driving route
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* LEFT - Cars */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-muted/50 px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B2A4A] text-[10px] font-bold text-white">A</span>
                <div>
                  <p className="font-medium leading-tight">{searchData.route.from.name}</p>
                  <p className="text-xs text-muted-foreground">{searchData.route.from.city}</p>
                </div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A227] text-[10px] font-bold text-[#1B2A4A]">B</span>
                <div>
                  <p className="font-medium leading-tight">{searchData.route.to.name}</p>
                  <p className="text-xs text-muted-foreground">{searchData.route.to.city}</p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-muted-foreground">
                <IconRoute className="h-4 w-4" />
                Transfer
              </div>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold mb-4">Available Cars ({searchData.cars.length})</h2>
              <div className="space-y-4">
                {searchData.cars.map((car, idx) => (
                  <VehicleCard
                    key={car.routePriceId}
                    item={car}
                    selected={selectedIdx === idx}
                    onSelect={() => setSelectedIdx(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl bg-muted/30 py-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="h-4 w-4 fill-[#00b67a] text-[#00b67a]" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-medium text-foreground">Excellent</span>

              </div>
              <Separator orientation="vertical" className="h-4" />
              <span>2,847 verified reviews</span>
            </div>
          </div>

          {/* RIGHT - Booking summary */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <Card className="overflow-hidden">
              <div className="bg-[#1B2A4A] px-5 py-4">
                <h2 className="font-serif text-lg font-bold text-white">Your Booking</h2>
              </div>
              <CardContent className="space-y-5 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">One way</Badge>
                  <Badge variant="outline" className="text-xs">
                    <IconUsers className="mr-1 h-3 w-3" />
                    {sp.pax} pax
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B2A4A] text-[9px] font-bold text-white">A</span>
                    <div>
                      <p className="font-medium">{searchData.route.from.name}</p>
                      <p className="text-xs text-muted-foreground">{sp.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C9A227] text-[9px] font-bold text-[#1B2A4A]">B</span>
                    <div>
                      <p className="font-medium">{searchData.route.to.name}</p>
                      <p className="text-xs text-muted-foreground">Drop-off</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {selected && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{selected.carType.name}</span>
                      <span className="font-semibold">€{selected.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2 text-base font-bold">
                      <span>Total</span>
                      <span className="text-[#C9A227]">€{selected.price.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {!selected && (
                  <p className="text-center text-sm text-muted-foreground">Select a car to see the price</p>
                )}

                <Separator />

                <div className="space-y-2.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <IconShieldCheck className="h-4 w-4 text-[#00b67a] shrink-0" />
                    <span>Free cancellation up to 24h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconDoorEnter className="h-4 w-4 text-[#00b67a] shrink-0" />
                    <span>Door-to-door service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconUserStar className="h-4 w-4 text-[#00b67a] shrink-0" />
                    <span>Meet &amp; Greet at pickup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconPlane className="h-4 w-4 text-[#00b67a] shrink-0" />
                    <span>Flight tracking included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconLicense className="h-4 w-4 text-[#00b67a] shrink-0" />
                    <span>Licensed &amp; insured chauffeurs</span>
                  </div>
                </div>

                <Separator />

                <Button
                  className="w-full bg-[#C9A227] text-[#1B2A4A] hover:bg-[#C9A227]/90 font-semibold h-12 text-base"
                  disabled={!selected}
                  onClick={() => {
                    if (!selected) return;
                    router.push(
                      `/checkout?routeId=${searchData.route.id}&carTypeId=${selected.carType.id}&routePriceId=${selected.routePriceId}&from=${encodeURIComponent(sp.from)}&to=${encodeURIComponent(sp.to)}&date=${sp.date}&time=${sp.time}&pax=${sp.pax}&price=${selected.price}&currency=${selected.currency}`
                    );
                  }}
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
