"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { initRazorpay, type RazorpayResponse } from "@/lib/razorpay";
import type { Booking } from "@/lib/types";
import {
  IconArrowLeft,
  IconCreditCard,
  IconCheck,
  IconLoader2,
  IconAlertTriangle,
  IconMapPin,
  IconCalendar,
  IconClock,
  IconUsers,
  IconCar,
  IconShieldCheck,
} from "@tabler/icons-react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const routeId = searchParams.get("routeId") || "";
  const carTypeId = searchParams.get("carTypeId") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const pax = searchParams.get("pax") || "1";
  const price = searchParams.get("price") || "0";

  const [form, setForm] = useState({
    customerName: searchParams.get("name") || "",
    phone: searchParams.get("phone") || "",
    email: searchParams.get("email") || "",
    pickupAddress: "",
    dropAddress: "",
    luggageNotes: "",
  });

  const [step, setStep] = useState<"form" | "paying" | "success" | "failed">("form");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePay = async () => {
    if (!form.customerName || !form.phone) {
      toast.error("Name and phone are required");
      return;
    }

    setStep("paying");
    setErrorMessage("");

    try {
      const newBooking = await api.post<Booking>("/bookings", {
        routeId,
        carTypeId,
        customerName: form.customerName,
        phone: form.phone,
        email: form.email || undefined,
        pickupAddress: form.pickupAddress || undefined,
        dropAddress: form.dropAddress || undefined,
        travelDate: date,
        travelTime: time,
        pax: parseInt(pax),
        luggageNotes: form.luggageNotes || undefined,
      });

      const orderData = await api.post<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        description: string;
      }>("/payments/create-order", { bookingId: newBooking.id });

      await initRazorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Europe Transfers",
        description: orderData.description,
        order_id: orderData.orderId,
        prefill: {
          name: form.customerName,
          email: form.email || undefined,
          contact: form.phone || undefined,
        },
        theme: { color: "#C9A227" },
        handler: async (response: RazorpayResponse) => {
          try {
            const verified = await api.post<Booking>("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: newBooking.id,
            });
            setBooking(verified);
            setStep("success");
            toast.success("Payment successful!");
          } catch {
            setBooking({ ...newBooking, paymentStatus: "PENDING" } as Booking);
            setStep("success");
            toast.success("Booking confirmed! Payment is being verified.");
          }
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setErrorMessage(msg);
      setStep("failed");
      toast.error(msg);
    }
  };

  if (step === "success" && booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="border-border/40 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <IconCheck className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="mt-6 text-2xl sm:text-3xl font-bold">Booking Confirmed!</h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
              Your booking has been confirmed. Save your booking ID for reference.
            </p>

            <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
              <div className="rounded-2xl border border-border/50 p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono font-bold text-gold">{booking.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-medium">{from} → {to}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">{date} at {time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Passengers</span>
                  <span className="font-medium">{pax}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total Paid</span>
                  <span className="text-gold">€{parseFloat(price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment</span>
                  <Badge variant={booking.paymentStatus === "PAID" ? "success" : "warning"} className="rounded-full">
                    {booking.paymentStatus}
                  </Badge>
                </div>
              </div>

              {booking.paymentStatus === "PENDING" && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <IconAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>Your payment is being verified. This usually takes a few seconds.</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                We&apos;ll send a confirmation to your phone. You can also find your booking using your phone number and booking ID.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/")} className="rounded-full">
                Return to Home
              </Button>
              <Button onClick={() => router.push("/account")} className="rounded-full bg-navy hover:bg-navy/90 text-white">
                Find My Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="border-border/40 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-400 to-red-600" />
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <IconAlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="mt-6 text-2xl sm:text-3xl font-bold">Payment Failed</h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              {errorMessage || "Something went wrong. Please try again."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button variant="outline" onClick={() => router.back()} className="rounded-full">
                <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
              <Button
                onClick={() => { setStep("form"); setErrorMessage(""); }}
                variant="gold"
                className="rounded-full font-semibold"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-2" disabled={step === "paying"}>
        <IconArrowLeft className="mr-2 h-4 w-4" />
        Back to results
      </Button>

      <div className="grid gap-8 lg:grid-cols-5 lg:items-start">
        {/* Form */}
        <div className="lg:col-span-3">
          <Card className="border-border/40 overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Complete Your Booking</h1>
                <p className="mt-1 text-muted-foreground">Fill in your details and pay securely with Razorpay</p>
              </div>

              <div className="space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <IconShieldCheck className="h-5 w-5 text-gold" /> Your Details
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      placeholder="John Doe"
                      disabled={step === "paying"}
                      className="h-12 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+39 123 456 7890"
                      disabled={step === "paying"}
                      className="h-12 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email (for receipt)</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    disabled={step === "paying"}
                    className="h-12 rounded-lg"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <IconMapPin className="h-5 w-5 text-gold" /> Pickup & Drop Details
                </h2>
                <div className="space-y-2">
                  <Label>Pickup Address</Label>
                  <Input
                    value={form.pickupAddress}
                    onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                    placeholder="Terminal 1, Gate 5"
                    disabled={step === "paying"}
                    className="h-12 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Drop Address</Label>
                  <Input
                    value={form.dropAddress}
                    onChange={(e) => setForm({ ...form, dropAddress: e.target.value })}
                    placeholder="Hotel name, address"
                    disabled={step === "paying"}
                    className="h-12 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Luggage Notes</Label>
                  <Input
                    value={form.luggageNotes}
                    onChange={(e) => setForm({ ...form, luggageNotes: e.target.value })}
                    placeholder="e.g. 2 large suitcases, 1 carry-on"
                    disabled={step === "paying"}
                    className="h-12 rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <Card className="border-border/40 overflow-hidden lg:sticky lg:top-24">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-bold">Trip Summary</h2>

              <div className="rounded-xl bg-muted/40 p-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <IconMapPin className="h-4 w-4 text-gold" /> Route
                  </span>
                  <span className="font-medium text-right">{from} → {to}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <IconCalendar className="h-4 w-4 text-gold" /> Date
                  </span>
                  <span className="font-medium">{date || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <IconClock className="h-4 w-4 text-gold" /> Time
                  </span>
                  <span className="font-medium">{time || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <IconUsers className="h-4 w-4 text-gold" /> Passengers
                  </span>
                  <span className="font-medium">{pax}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <IconCar className="h-4 w-4 text-gold" /> Vehicle
                  </span>
                  <span className="font-medium">{carTypeId ? carTypeId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "—"}</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-2xl font-bold text-gold">€{parseFloat(price).toFixed(2)}</span>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <IconAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <Button
                className="w-full h-12 text-base font-semibold rounded-full"
                variant="gold"
                onClick={handlePay}
                disabled={step === "paying" || !form.customerName || !form.phone || !routeId || !carTypeId}
              >
                {step === "paying" ? (
                  <span className="flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    Processing Payment...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IconCreditCard className="h-4 w-4" />
                    Pay €{parseFloat(price).toFixed(2)}
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <IconShieldCheck className="h-3 w-3" />
                Secure payment powered by Razorpay
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="h-8 w-32 bg-muted animate-pulse rounded mb-6" />
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 h-96 bg-muted animate-pulse rounded-2xl" />
            <div className="lg:col-span-2 h-80 bg-muted animate-pulse rounded-2xl" />
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
