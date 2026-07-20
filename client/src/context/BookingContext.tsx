"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchFormData {
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  pickupDate: Date | null;
  pickupTime: string;
  passengers: number;
}

interface BookingFormData {
  routeId: string;
  carTypeId: string;
  routePriceId: string;
  customerName: string;
  phone: string;
  email: string;
  pickupAddress: string;
  dropAddress: string;
  travelDate: string;
  travelTime: string;
  pax: number;
  luggageNotes: string;
  price: number;
  currency: string;
}

interface BookingContextType {
  search: SearchFormData;
  updateSearch: (data: Partial<SearchFormData>) => void;
  formData: BookingFormData;
  step: number;
  setStep: (step: number) => void;
  updateForm: (data: Partial<BookingFormData>) => void;
  resetForm: () => void;
}

const defaultSearch: SearchFormData = {
  fromLocationId: "",
  fromLocationName: "",
  toLocationId: "",
  toLocationName: "",
  pickupDate: null,
  pickupTime: "",
  passengers: 1,
};

const defaultForm: BookingFormData = {
  routeId: "",
  carTypeId: "",
  routePriceId: "",
  customerName: "",
  phone: "",
  email: "",
  pickupAddress: "",
  dropAddress: "",
  travelDate: "",
  travelTime: "",
  pax: 1,
  luggageNotes: "",
  price: 0,
  currency: "EUR",
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState<SearchFormData>(defaultSearch);
  const [formData, setFormData] = useState<BookingFormData>(defaultForm);
  const [step, setStep] = useState(0);

  const updateSearch = (data: Partial<SearchFormData>) => {
    setSearch((prev) => ({ ...prev, ...data }));
  };

  const updateForm = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setSearch(defaultSearch);
    setFormData(defaultForm);
    setStep(0);
  };

  return (
    <BookingContext.Provider value={{ search, updateSearch, formData, step, setStep, updateForm, resetForm }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

export type { SearchFormData };
