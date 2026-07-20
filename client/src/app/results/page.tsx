import { redirect } from "next/navigation";
import env from "@/config/env.config";
import ResultsClient from "./ResultsClient";

export interface SearchResult {
  routePriceId: string;
  carType: {
    id: string;
    name: string;
    seats: number;
    image?: string;
    isAC: boolean;
  };
  price: number;
  currency: string;
}

export interface SearchData {
  route: {
    id: string;
    from: { id: string; name: string; city: string; latitude: number | null; longitude: number | null };
    to: { id: string; name: string; city: string; latitude: number | null; longitude: number | null };
  };
  cars: SearchResult[];
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

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const fromId = typeof sp.fromId === "string" ? sp.fromId : "";
  const toId = typeof sp.toId === "string" ? sp.toId : "";

  if (!fromId || !toId) {
    redirect("/");
  }

  const from = typeof sp.from === "string" ? sp.from : "";
  const to = typeof sp.to === "string" ? sp.to : "";
  const date = typeof sp.date === "string" ? sp.date : "";
  const time = typeof sp.time === "string" ? sp.time : "";
  const pax = sp.pax ? Number(sp.pax) : 1;

  let searchData: SearchData | null = null;
  let error: string | null = null;

  try {
    searchData = await fetchSearchResults({
      fromLocationId: fromId,
      toLocationId: toId,
      passengers: pax,
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load results";
  }

  return (
    <ResultsClient
      searchData={searchData}
      error={error}
      searchParams={{ from, to, fromId, toId, date, time, pax }}
    />
  );
}
