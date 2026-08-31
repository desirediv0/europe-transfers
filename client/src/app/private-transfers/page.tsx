import { cookies } from "next/headers";
import env from "@/config/env.config";
import FleetContent from "../fleet/FleetContent";
import type { SearchData } from "../fleet/page";

function getDemoData(from: string, to: string): SearchData {
  return {
    route: {
      id: "demo-route",
      from: { id: "demo-from", name: from, city: "Milan", latitude: 45.63, longitude: 8.72 },
      to: { id: "demo-to", name: to, city: "Milan", latitude: 45.464, longitude: 9.19 },
    },
    cars: [
      { routePriceId: "demo-1", carType: { id: "sedan", name: "Sedan", seats: 4, isAC: true }, price: 45, currency: "EUR" },
      { routePriceId: "demo-2", carType: { id: "suv", name: "SUV", seats: 6, isAC: true }, price: 65, currency: "EUR" },
      { routePriceId: "demo-3", carType: { id: "van", name: "Van", seats: 8, isAC: true }, price: 85, currency: "EUR" },
      { routePriceId: "demo-4", carType: { id: "minivan", name: "Minivan", seats: 7, isAC: true }, price: 75, currency: "EUR" },
    ],
  };
}

async function fetchSearchResults(params: {
  fromLocationId: string;
  toLocationId: string;
  passengers: number;
}): Promise<SearchData> {
  const res = await fetch(`${env.API_URL}/search`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "Search failed");
  }

  return json.data;
}

export default async function PrivateTransfersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const fromId = typeof sp.fromId === "string" ? sp.fromId : "";
  const toId = typeof sp.toId === "string" ? sp.toId : "";

  const hasSearch = !!fromId && !!toId;

  if (!hasSearch) {
    return <FleetContent />;
  }

  const from = typeof sp.from === "string" ? sp.from : "";
  const to = typeof sp.to === "string" ? sp.to : "";
  const date = typeof sp.date === "string" ? sp.date : "";
  const time = typeof sp.time === "string" ? sp.time : "";
  const pax = sp.pax ? Number(sp.pax) : 1;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const isLoggedIn = !!accessToken;

  let realData: SearchData | null = null;
  let error: string | null = null;

  try {
    realData = await fetchSearchResults({
      fromLocationId: fromId,
      toLocationId: toId,
      passengers: pax,
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load results";
  }

  // demoData is only a last-resort placeholder if the real route has no
  // data at all (e.g. no route between these two locations yet) - it is
  // never shown when realData is available, logged in or not.
  const demoData = realData ? undefined : getDemoData(from, to);

  return (
    <FleetContent
      demoData={demoData}
      realData={realData}
      error={error}
      isLoggedIn={isLoggedIn}
      searchParams={{ from, to, fromId, toId, date, time, pax }}
    />
  );
}
