"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { HeroSearchBar } from "@/components/HeroSearchBar";
import { DropdownPickerField, DatePickerField } from "@/components/SearchFields";
import type { Location } from "@/lib/types";
import {
  IconClock,
  IconMapPin,
  IconLoader2,
  IconUsers,
  IconCar,
  IconShieldCheck,
} from "@tabler/icons-react";

const FLEET_FEATURES = [
  { icon: IconShieldCheck, title: "Licensed & Insured", desc: "Fully authorized European transport operator" },
  { icon: IconClock, title: "60 Min Free Wait", desc: "Complimentary waiting time at airports" },
  { icon: IconCar, title: "Luxury Fleet", desc: "Late-model Mercedes-Benz vehicles" },
  { icon: IconUsers, title: "English Speaking", desc: "Professional multilingual chauffeurs" },
];

function VanCoachSearchContent() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const [hours, setHours] = useState("8");
  const [pickupDate, setPickupDate] = useState<Date | null>(new Date());
  const [pickupTime, setPickupTime] = useState("09:00 AM");

  useEffect(() => {
    api.get<Location[]>("/search/locations").then(setLocations).catch(() => {});
  }, []);

  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hr = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      const min = m.toString().padStart(2, "0");
      const hrStr = hr.toString().padStart(2, "0");
      times.push(`${hrStr}:${min} ${ampm}`);
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLocationName) params.set("location", selectedLocationName);
    params.set("hours", hours);
    if (pickupDate) params.set("date", pickupDate.toISOString().split("T")[0]);
    params.set("time", pickupTime);
    router.push(`/van-coach/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Banner + Search */}
      <section className="relative bg-[#060C17] text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0B1426]/90 to-black/80 z-10" />
        <div className="absolute top-10 right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-black text-gold uppercase tracking-wider mb-6 border border-gold/30">
            <IconCar className="h-4 w-4 text-gold" />
            First-Class European Fleet
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Van & Coach <span className="text-gold">Disposal</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal mb-8">
            Hire a private Mercedes-Benz vehicle with dedicated English-speaking chauffeur by the hour for business roadshows, shopping, or custom European itineraries.
          </p>

          <div className="max-w-4xl mx-auto text-left">
            <HeroSearchBar
              fieldCount={4}
              submitLabel="Browse Fleet"
              onSubmit={handleSearch}
              fields={
                <>
                  <DropdownPickerField
                    label="Location"
                    icon={IconMapPin}
                    value={selectedLocationName}
                    placeholder="e.g. Milan, Zurich, Paris"
                    options={locations.map((l) => ({ id: l.id, label: l.name, sublabel: l.city }))}
                    onChange={(_id, name) => setSelectedLocationName(name)}
                  />
                  <DropdownPickerField
                    label="Duration"
                    icon={IconClock}
                    value={hours}
                    placeholder="Select duration"
                    options={[
                      { id: "4", label: "4 Hours Half-Day" },
                      { id: "5", label: "5 Hours" },
                      { id: "6", label: "6 Hours" },
                      { id: "7", label: "7 Hours" },
                      { id: "8", label: "8 Hours Full-Day" },
                      { id: "9", label: "9 Hours" },
                      { id: "10", label: "10 Hours Extended Day" },
                      { id: "11", label: "11 Hours" },
                      { id: "12", label: "12 Hours Grand Day" },
                      { id: "24", label: "24 Hours Multi-Day" },
                    ]}
                    onChange={(id) => setHours(id)}
                  />
                  <DatePickerField date={pickupDate} onChange={setPickupDate} />
                  <DropdownPickerField
                    label="Pickup Time"
                    icon={IconClock}
                    value={pickupTime}
                    placeholder="Select time"
                    options={times.map((t) => ({ id: t, label: t }))}
                    onChange={(id) => setPickupTime(id)}
                    divider={false}
                  />
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-white py-6 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FLEET_FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 flex-shrink-0">
                  <f.icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-navy leading-snug">{f.title}</h4>
                  <p className="text-[10px] text-gray-500 font-medium leading-tight">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function VanCoachFleetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><IconLoader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <VanCoachSearchContent />
    </Suspense>
  );
}
