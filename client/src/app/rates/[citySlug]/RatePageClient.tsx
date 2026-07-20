"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Location, Route, RoutePrice } from "@/lib/types";
import { IconRoute } from "@tabler/icons-react";

interface Props {
  locations: Location[];
  routes: (Route & { routePrices: RoutePrice[] })[];
  citySlug: string;
}

export function RatePageClient({ locations, routes, citySlug }: Props) {
  const cityLocations = locations.filter((l) => l.city.toLowerCase().replace(/\s+/g, "-") === citySlug);
  const cityName = cityLocations[0]?.city || citySlug;

  const cityRoutes = routes.filter(
    (r) =>
      r.fromLocation &&
      cityLocations.some((l) => l.id === r.fromLocationId) &&
      r.isActive
  );

  if (cityLocations.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <h1 className="font-serif text-3xl font-bold">City Not Found</h1>
        <p className="mt-2 text-muted-foreground">No routes found for {citySlug}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold">Routes — {cityName}</h1>
      <p className="mt-1 text-muted-foreground">Available transfers from {cityName} locations</p>

      <div className="mt-8 space-y-6">
        {cityRoutes.length === 0 ? (
          <p className="text-muted-foreground">No routes available for {cityName}.</p>
        ) : (
          cityRoutes.map((route) => (
            <Card key={route.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <IconRoute className="h-4 w-4 text-[#C9A227]" />
                    {route.fromLocation?.name} → {route.toLocation?.name}
                  </CardTitle>
                  <Badge variant="outline">{route.routePrices.length} cars</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {route.routePrices.map((rp) => (
                    <div key={rp.routePriceId} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{rp.carType?.name || "Car"}</p>
                        <p className="text-xs text-muted-foreground">{rp.carType?.seats} seats</p>
                      </div>
                      <div className="text-lg font-bold text-[#C9A227]">
                        €{Number(rp.price).toFixed(2)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">{rp.currency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
