"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { api } from "@/lib/api";

export type CurrencyCode = "EUR" | "USD" | "INR";

const SYMBOLS: Record<CurrencyCode, string> = {
  EUR: "€",
  USD: "$",
  INR: "₹",
};

const STORAGE_KEY = "et_currency";
const FALLBACK_RATES: Record<CurrencyCode, number> = { EUR: 1, USD: 1.08, INR: 98 };

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  symbol: string;
  convert: (amountEur: number) => number;
  format: (amountEur: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("EUR");
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "EUR" || stored === "USD" || stored === "INR") {
        setCurrencyState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    api
      .get<{ base: string; rates: { EUR: number; USD: number; INR: number } }>("/currency/rates")
      .then((data) => setRates(data.rates))
      .catch(() => {});
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // ignore
    }
  }, []);

  const convert = useCallback(
    (amountEur: number) => Math.round(amountEur * (rates[currency] ?? 1) * 100) / 100,
    [rates, currency]
  );

  const format = useCallback(
    (amountEur: number) => `${SYMBOLS[currency]}${convert(amountEur).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    [convert, currency]
  );

  const value = useMemo(
    () => ({ currency, setCurrency, rates, symbol: SYMBOLS[currency], convert, format }),
    [currency, setCurrency, rates, convert, format]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
