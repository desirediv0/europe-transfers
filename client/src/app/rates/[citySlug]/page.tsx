import { api } from "@/lib/api";
import type { Location, Route, RoutePrice } from "@/lib/types";
import { RatePageClient } from "./RatePageClient";

interface Props {
  params: Promise<{ citySlug: string }>;
}

export const dynamic = "force-dynamic";

export default async function RatePage({ params }: Props) {
  const { citySlug } = await params;

  let locations: Location[] = [];
  let routes: (Route & { routePrices: RoutePrice[] })[] = [];

  try {
    const locationsData = await api.get<Location[]>("/locations/all");
    locations = locationsData;

    const routesData = await api.get<{ items: (Route & { routePrices: RoutePrice[] })[] }>("/routes?limit=100");
    routes = routesData.items;
  } catch {
    // silent
  }

  return <RatePageClient locations={locations} routes={routes} citySlug={citySlug} />;
}
