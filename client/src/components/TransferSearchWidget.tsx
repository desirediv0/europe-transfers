"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useBooking } from "@/context/BookingContext";
import { api } from "@/lib/api";
import type { Location } from "@/lib/types";
import { HeroSearchBar } from "@/components/HeroSearchBar";
import { DropdownPickerField, DateTimePickerField, StepperField } from "@/components/SearchFields";
import { IconMapPin, IconArrowsLeftRight } from "@tabler/icons-react";

function TransferSearchWidgetInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = pathname?.startsWith("/private-transfers") ? "/private-transfers" : "/fleet";
  const { search, updateSearch } = useBooking();
  const [locations, setLocations] = useState<Location[]>([]);
  const [destinations, setDestinations] = useState<Location[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    api.get<Location[]>("/search/locations").then(setLocations).catch(() => {});
  }, []);

  // A city can have several same-named locations that are each paired
  // one-to-one with a different destination (e.g. many "Paris City Center"
  // rows - one routed only to the airport, another only to Disneyland...)
  // instead of one shared location reused everywhere. So "To" should list
  // every destination that city serves overall, not just what this one
  // "From" row happens to reach directly.
  useEffect(() => {
    if (!search.fromLocationName) {
      setDestinations(null);
      return;
    }
    let cancelled = false;
    api
      .get<Location[]>(`/search/destinations?fromName=${encodeURIComponent(search.fromLocationName)}`)
      .then((dests) => {
        if (!cancelled) setDestinations(dests);
      })
      .catch(() => setDestinations(null));
    return () => {
      cancelled = true;
    };
  }, [search.fromLocationName]);

  // The specific "From" row currently selected may not be the one that
  // actually routes to the chosen "To" name (see above), so resolve the
  // real pair and snap "From" to the matching row - the visible names
  // never change, only which underlying row/id is used for each.
  const resolvePair = async (fromName: string, toName: string) => {
    setResolving(true);
    try {
      const result = await api.get<{ route: { from: Location; to: Location } | null }>(
        `/search/resolve-pair?fromName=${encodeURIComponent(fromName)}&toName=${encodeURIComponent(toName)}`
      );
      if (result.route) {
        updateSearch({
          fromLocationId: result.route.from.id,
          fromLocationName: result.route.from.name,
          toLocationId: result.route.to.id,
          toLocationName: result.route.to.name,
        });
      }
    } catch {
      // leave the plain selection in place; search will surface "no route"
    } finally {
      setResolving(false);
    }
  };

  const handleToChange = async (toId: string, toName: string) => {
    updateSearch({ toLocationId: toId, toLocationName: toName });
    if (!search.fromLocationName) return;
    await resolvePair(search.fromLocationName, toName);
  };

  // "Top Destinations" cards on the homepage link here with ?city=<name>
  // so the picked city is pre-filled as the "From" location instead of
  // landing on a blank search bar - prefer that city's Airport location
  // (the most common starting point), falling back to any location in it.
  useEffect(() => {
    const city = searchParams.get("city");
    if (!city || locations.length === 0 || search.fromLocationId) return;
    const cityLocations = locations.filter((l) => l.city.toLowerCase() === city.toLowerCase());
    if (cityLocations.length === 0) return;
    const preferred = cityLocations.find((l) => l.name.toLowerCase().includes("airport")) || cityLocations[0];
    updateSearch({ fromLocationId: preferred.id, fromLocationName: preferred.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, searchParams]);

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

  const swapLocations = async () => {
    const newFromName = search.toLocationName;
    const newToName = search.fromLocationName;
    updateSearch({
      fromLocationId: search.toLocationId,
      fromLocationName: newFromName,
      toLocationId: search.fromLocationId,
      toLocationName: newToName,
    });
    // Re-resolve to the row that actually routes newFromName -> newToName -
    // same as picking "To" normally, so a swap can't carry over a mismatch.
    if (newFromName && newToName) {
      await resolvePair(newFromName, newToName);
    }
  };

  const locationOptions = locations.map((l) => ({ id: l.id, label: l.name, sublabel: l.city }));
  // Once "From" is picked, "To" shows every destination that city serves
  // (see the destinations effect above) rather than every location on the
  // platform; selecting one resolves the real row via handleToChange.
  const toOptions = destinations
    ? destinations.map((l) => ({ id: l.id, label: l.name, sublabel: l.city }))
    : locationOptions.filter((o) => o.id !== search.fromLocationId);

  const canSubmit = !!(search.fromLocationId && search.toLocationId && search.pickupDate && search.pickupTime && !resolving);

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
              placeholder={search.fromLocationId ? "Select a destination" : "Pick a \"From\" location first"}
              options={toOptions}
              onChange={handleToChange}
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

export default function TransferSearchWidget() {
  return (
    <Suspense fallback={<div className="w-full h-20" />}>
      <TransferSearchWidgetInner />
    </Suspense>
  );
}
