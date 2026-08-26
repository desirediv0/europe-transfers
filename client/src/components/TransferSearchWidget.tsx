"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { useBooking } from "@/context/BookingContext";
import { api } from "@/lib/api";
import type { Location } from "@/lib/types";
import { HeroSearchBar } from "@/components/HeroSearchBar";
import { DropdownPickerField, DateTimePickerField, StepperField } from "@/components/SearchFields";
import { IconMapPin, IconArrowsLeftRight } from "@tabler/icons-react";

export default function TransferSearchWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/private-transfers") ? "/private-transfers" : "/fleet";
  const { search, updateSearch } = useBooking();
  const [locations, setLocations] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.get<Location[]>("/search/locations").then(setLocations).catch(() => {});
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
        `${basePath}?from=${encodeURIComponent(search.fromLocationName || "")}&to=${encodeURIComponent(search.toLocationName || "")}&fromId=${search.fromLocationId}&toId=${search.toLocationId}&date=${format(search.pickupDate, "yyyy-MM-dd")}&time=${search.pickupTime}&pax=${search.passengers}`
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

  const locationOptions = locations.map((l) => ({ id: l.id, label: l.name, sublabel: l.city }));

  const canSubmit = !!(search.fromLocationId && search.toLocationId && search.pickupDate && search.pickupTime);

  return (
    <div className="w-full">
      <HeroSearchBar
        fieldCount={4}
        submitting={searching}
        disabled={!canSubmit}
        onSubmit={handleSubmit}
        fields={
          <>
            <div className="relative">
              <DropdownPickerField
                label="From"
                icon={IconMapPin}
                value={search.fromLocationId}
                placeholder="Address, airport, hotel, ..."
                options={locationOptions.filter((o) => o.id !== search.toLocationId)}
                onChange={(id, name) => updateSearch({ fromLocationId: id, fromLocationName: name })}
              />
              <button
                type="button"
                onClick={swapLocations}
                disabled={!search.fromLocationId && !search.toLocationId}
                aria-label="Swap locations"
                className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:text-navy hover:border-gray-300 transition-colors disabled:opacity-30 cursor-pointer"
              >
                <IconArrowsLeftRight className="h-3 w-3" />
              </button>
            </div>
            <DropdownPickerField
              label="To"
              icon={IconMapPin}
              value={search.toLocationId}
              placeholder="Address, airport, hotel, ..."
              options={locationOptions.filter((o) => o.id !== search.fromLocationId)}
              onChange={(id, name) => updateSearch({ toLocationId: id, toLocationName: name })}
            />
            <DateTimePickerField
              date={search.pickupDate}
              time={search.pickupTime}
              onDateChange={(d) => updateSearch({ pickupDate: d })}
              onTimeChange={(t) => updateSearch({ pickupTime: t })}
            />
            <StepperField
              label="Passengers"
              value={search.passengers}
              onChange={(n) => updateSearch({ passengers: n })}
            />
          </>
        }
      />
      <p className="mt-4 text-center text-xs text-gray-300 font-medium">
        100+ countries · Fixed price · Free cancellation
      </p>
    </div>
  );
}
