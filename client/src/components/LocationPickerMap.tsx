"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from "@/components/ui/map";
import { toast } from "sonner";
import { IconMapPin, IconCrosshair, IconNavigation, IconCheck, IconX } from "@tabler/icons-react";
import type { Location } from "@/lib/types";

interface LocationPickerMapProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: Location[];
  excludeId?: string;
  title: string;
  onSelect: (location: Location) => void;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LocationPickerMap({
  open,
  onOpenChange,
  locations,
  excludeId,
  title,
  onSelect,
}: LocationPickerMapProps) {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const availableLocations = useMemo(() => locations.filter((l) => l.id !== excludeId && l.latitude && l.longitude), [locations, excludeId]);

  const defaultCenter: [number, number] = useMemo(() => {
    if (currentLocation) return [currentLocation.longitude, currentLocation.latitude];
    if (availableLocations.length > 0) {
      const l = availableLocations[0];
      return [l.longitude || 0, l.latitude || 0];
    }
    return [9, 48];
  }, [currentLocation, availableLocations]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setCurrentLocation(coords);
        setDetecting(false);

        // Find nearest location
        const nearest = availableLocations
          .map((l) => ({
            ...l,
            distance: haversine(coords.latitude, coords.longitude, l.latitude || 0, l.longitude || 0),
          }))
          .sort((a, b) => a.distance - b.distance)[0];

        if (nearest) {
          setSelectedId(nearest.id);
          toast.success(`Nearest location: ${nearest.name} (${nearest.distance.toFixed(1)} km away)`);
        } else {
          toast.success("Current location detected");
        }
      },
      () => {
        setDetecting(false);
        toast.error("Unable to detect your location. Please enable location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelect = () => {
    const loc = availableLocations.find((l) => l.id === selectedId);
    if (loc) {
      onSelect(loc);
      onOpenChange(false);
      setSelectedId(null);
      setCurrentLocation(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5 text-gold" /> {title}
          </DialogTitle>
        </DialogHeader>
        <div className="relative h-[450px] sm:h-[500px]">
          <Map center={defaultCenter} zoom={currentLocation ? 12 : 6}>
            <MapControls showZoom={true} showLocate={true} position="bottom-right" />

            {currentLocation && (
              <MapMarker longitude={currentLocation.longitude} latitude={currentLocation.latitude}>
                <MarkerContent>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg ring-4 ring-white">
                    <IconCrosshair className="h-4 w-4" />
                  </div>
                </MarkerContent>
                <MarkerTooltip>Your current location</MarkerTooltip>
              </MapMarker>
            )}

            {availableLocations.map((loc) => {
              const isSelected = selectedId === loc.id;
              return (
                <MapMarker
                  key={loc.id}
                  longitude={loc.longitude || 0}
                  latitude={loc.latitude || 0}
                  onClick={() => setSelectedId(loc.id)}
                >
                  <MarkerContent>
                    <button
                      onClick={() => setSelectedId(loc.id)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full shadow-lg ring-4 transition-all ${
                        isSelected ? "bg-gold text-navy ring-gold/30 scale-110" : "bg-navy text-white ring-white hover:bg-navy/90"
                      }`}
                    >
                      {isSelected ? <IconCheck className="h-5 w-5" /> : <IconMapPin className="h-4 w-4" />}
                    </button>
                  </MarkerContent>
                  <MarkerTooltip>
                    <div className="text-center">
                      <p className="font-semibold">{loc.name}</p>
                      <p className="text-xs opacity-80">{loc.city}</p>
                    </div>
                  </MarkerTooltip>
                </MapMarker>
              );
            })}
          </Map>

          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={detectLocation}
              disabled={detecting}
              className="bg-white shadow-md hover:bg-white/90"
            >
              {detecting ? (
                <IconNavigation className="h-4 w-4 animate-pulse mr-2" />
              ) : (
                <IconCrosshair className="h-4 w-4 mr-2" />
              )}
              {detecting ? "Detecting..." : "Use my location"}
            </Button>
          </div>

          {selectedId && (
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-white rounded-xl border border-border/40 shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{availableLocations.find((l) => l.id === selectedId)?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {availableLocations.find((l) => l.id === selectedId)?.city}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                    <IconX className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="gold" onClick={handleSelect}>
                    <IconCheck className="h-4 w-4 mr-1" /> Select
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
