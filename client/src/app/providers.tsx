"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <BookingProvider>
          <Header />
          <main className="pt-16">{children}</main>
          <Footer />
          <Toaster position="top-right" richColors />
        </BookingProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
