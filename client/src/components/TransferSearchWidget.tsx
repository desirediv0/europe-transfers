"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBooking } from "@/context/BookingContext";
import { api } from "@/lib/api";
import type { Location } from "@/lib/types";
import {
  IconMapPin,
  IconCalendar,
  IconClock,
  IconSearch,
  IconMinus,
  IconPlus,
  IconUsers,
  IconArrowsDownUp,
  IconStar,
  IconChevronDown,
} from "@tabler/icons-react";

function LocationPicker({
  value,
  name,
  placeholder,
  locations,
  excludeId,
  onChange,
}: {
  value: string;
  name: string;
  placeholder: string;
  locations: Location[];
  excludeId?: string;
  onChange: (id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = locations.find((l) => l.id === value);
  const filtered = locations.filter((l) => {
    if (l.id === excludeId) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q);
  });

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <IconMapPin className="h-4 w-4 shrink-0 text-[#C9A227]" />
              <span className="truncate">{selected.name} ({selected.city})</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <IconSearch className="h-4 w-4 shrink-0" />
              {placeholder}
            </span>
          )}
          <IconChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start" side="bottom" sideOffset={4}>
        <div className="max-h-64 overflow-auto">
          <div className="sticky top-0 bg-popover p-2 border-b">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${name}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
            </div>
          </div>
          <div className="p-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No location found.</div>
            ) : (
              filtered.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onChange(loc.id, loc.name);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-start rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left ${value === loc.id ? "bg-accent" : ""}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{loc.name}</span>
                    <span className="text-xs text-muted-foreground">{loc.city}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hr = h % 12 || 12;
      const ampm = h < 12 ? "AM" : "PM";
      const min = m.toString().padStart(2, "0");
      times.push(`${hr}:${min} ${ampm}`);
    }
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11">
        <IconClock className="mr-2 h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        {times.map((t) => (
          <SelectItem key={t} value={t}>{t}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function TransferSearchWidget() {
  const router = useRouter();
  const { search, updateSearch } = useBooking();
  const [locations, setLocations] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    api.get<Location[]>("/search/locations").then(setLocations).catch(() => { });
  }, []);

  const handleSubmit = async () => {
    if (!search.fromLocationId || !search.toLocationId || !search.pickupDate || !search.pickupTime) return;
    setSearching(true);
    try {
      await api.post("/search", {
        fromLocationId: search.fromLocationId,
        toLocationId: search.toLocationId,
        passengers: search.passengers,
      });
      router.push(
        `/results?from=${encodeURIComponent(search.fromLocationName || "")}&to=${encodeURIComponent(search.toLocationName || "")}&fromId=${search.fromLocationId}&toId=${search.toLocationId}&date=${format(search.pickupDate, "yyyy-MM-dd")}&time=${search.pickupTime}&pax=${search.passengers}`
      );
    } catch {
      // error handled by api wrapper
    } finally {
      setSearching(false);
    }
  };

  const swapLocations = () => {
    const tempId = search.fromLocationId;
    const tempName = search.fromLocationName;
    updateSearch({
      fromLocationId: search.toLocationId,
      fromLocationName: search.toLocationName,
      toLocationId: tempId,
      toLocationName: tempName,
    });
  };

  return (
    <Card className="w-full max-w-md p-5 shadow-xl border-0 overflow-visible">
      <div className="flex items-center gap-2 mb-5">
        <Badge className="bg-[#1B2A4A] text-white px-3 py-1 text-sm font-medium rounded-full">
          <IconArrowsDownUp className="mr-1.5 h-3.5 w-3.5" />
          Transfer
        </Badge>
      </div>

      <div className="space-y-4">
        {/* From & To with Swap */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <IconMapPin className="h-4 w-4 text-[#C9A227]" />
            From
          </Label>
          <LocationPicker
            value={search.fromLocationId}
            name="pickup"
            placeholder="Select pickup location"
            locations={locations}
            excludeId={search.toLocationId}
            onChange={(id, name) => updateSearch({ fromLocationId: id, fromLocationName: name })}
          />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={swapLocations}
            disabled={!search.fromLocationId || !search.toLocationId}
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted transition-colors disabled:opacity-40"
          >
            <IconArrowsDownUp className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <IconMapPin className="h-4 w-4 text-[#C9A227]" />
            To
          </Label>
          <LocationPicker
            value={search.toLocationId}
            name="drop-off"
            placeholder="Select drop location"
            locations={locations}
            excludeId={search.fromLocationId}
            onChange={(id, name) => updateSearch({ toLocationId: id, toLocationName: name })}
          />
        </div>

        {/* Pickup Date */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <IconCalendar className="h-4 w-4 text-[#C9A227]" />
            Pickup Date
          </Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-11 justify-start text-left font-normal">
                {search.pickupDate ? format(search.pickupDate, "EEE, dd MMM yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="end" side="bottom" sideOffset={4} collisionPadding={16}>
              <Calendar
                mode="single"
                selected={search.pickupDate || undefined}
                onSelect={(date) => { updateSearch({ pickupDate: date || null }); setCalendarOpen(false); }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Pickup Time */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <IconClock className="h-4 w-4 text-[#C9A227]" />
            Pickup Time
          </Label>
          <TimePicker value={search.pickupTime} onChange={(v) => updateSearch({ pickupTime: v })} />
        </div>

        {/* Passengers */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <IconUsers className="h-4 w-4 text-[#C9A227]" />
            Passengers
          </Label>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3 h-11">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconUsers className="h-4 w-4" />
              <span>{search.passengers} {search.passengers === 1 ? "passenger" : "passengers"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateSearch({ passengers: Math.max(1, search.passengers - 1) })}
                disabled={search.passengers <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B2A4A] text-white disabled:opacity-40 hover:bg-[#1B2A4A]/90 transition-colors"
              >
                <IconMinus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-lg font-semibold">{search.passengers}</span>
              <button
                type="button"
                onClick={() => updateSearch({ passengers: search.passengers + 1 })}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B2A4A] text-white hover:bg-[#1B2A4A]/90 transition-colors"
              >
                <IconPlus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* See Prices */}
        <Button
          className="w-full h-12 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white font-semibold text-base"
          onClick={handleSubmit}
          disabled={searching || !search.fromLocationId || !search.toLocationId || !search.pickupDate || !search.pickupTime}
        >
          {searching ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Searching...
            </span>
          ) : (
            <>
              <IconSearch className="mr-2 h-5 w-5" />
              See Prices
            </>
          )}
        </Button>

        {/* Trustpilot Row */}
        <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <IconStar key={i} className="h-4 w-4 fill-[#00b67a] text-[#00b67a]" />
            ))}
          </div>
          <span className="font-medium text-foreground">Excellent</span>

        </div>
      </div>
    </Card>
  );
}
