import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { Country, City } from "@/lib/types";

interface DataContextType {
  countries: Country[];
  cities: City[];
  loading: boolean;
  refreshCountries: () => Promise<void>;
  refreshCities: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCountries = useCallback(async () => {
    try {
      const data = await api.get<{ items: Country[] }>("/countries?limit=100");
      setCountries(data.items);
    } catch {
      // silent
    }
  }, []);

  const refreshCities = useCallback(async () => {
    try {
      const data = await api.get<{ items: City[] }>("/cities?limit=100");
      setCities(data.items);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    Promise.all([refreshCountries(), refreshCities()]).finally(() => setLoading(false));
  }, [refreshCountries, refreshCities]);

  return (
    <DataContext.Provider value={{ countries, cities, loading, refreshCountries, refreshCities }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
