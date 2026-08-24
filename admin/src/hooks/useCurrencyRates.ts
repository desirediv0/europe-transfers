import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export type ViewCurrency = "EUR" | "USD" | "INR";

const FALLBACK_RATES: Record<ViewCurrency, number> = { EUR: 1, USD: 1.08, INR: 98 };

export function useCurrencyRates() {
  const [rates, setRates] = useState<Record<ViewCurrency, number>>(FALLBACK_RATES);

  useEffect(() => {
    api
      .get<{ base: string; rates: Record<ViewCurrency, number> }>("/currency/rates")
      .then((data) => setRates(data.rates))
      .catch(() => {});
  }, []);

  const convert = (amountEur: number, target: ViewCurrency) =>
    Math.round(amountEur * (rates[target] ?? 1) * 100) / 100;

  return { rates, convert };
}
