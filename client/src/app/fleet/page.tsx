"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { CarType } from "@/lib/types";
import { IconUsers, IconSnowflake, IconWifi, IconLuggage, IconBabyCarriage, IconCrown, IconPaw } from "@tabler/icons-react";

const featureMap = [
  { key: "isAC", label: "AC", icon: IconSnowflake },
  { key: "isWiFi", label: "WiFi", icon: IconWifi },
  { key: "isLuggage", label: "Luggage", icon: IconLuggage },
  { key: "isChildSeat", label: "Child Seat", icon: IconBabyCarriage },
  { key: "isVIP", label: "VIP", icon: IconCrown },
  { key: "isPetFriendly", label: "Pets", icon: IconPaw },
];

export default function FleetPage() {
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ items: CarType[] }>("/car-types?limit=100").then((d) => {
      setCarTypes(d.items);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div>
        <h1 className="font-serif text-3xl font-bold">Our Fleet</h1>
        <p className="mt-1 text-muted-foreground">Choose from our range of premium vehicles</p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
          : carTypes.map((ct) => (
              <Card key={ct.id} className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  {ct.image && <Image src={ct.image} alt={ct.name} fill className="object-cover" />}
                  <Badge className="absolute top-3 right-3 bg-[#1B2A4A]">{ct.name}</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-serif text-lg font-bold">{ct.name}</h3>
                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <IconUsers className="h-4 w-4" /> Up to {ct.seats} seats
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {featureMap.map(({ key, label, icon: Icon }) => (
                      ct[key as keyof CarType] ? (
                        <Badge key={key} variant="secondary" className="gap-1 text-xs">
                          <Icon className="h-3 w-3" /> {label}
                        </Badge>
                      ) : null
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
