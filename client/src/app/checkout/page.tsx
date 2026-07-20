"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { initRazorpay, type RazorpayResponse } from "@/lib/razorpay";
import type { Booking } from "@/lib/types";
import { IconArrowLeft, IconCreditCard, IconCheck, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";

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
    customerName: "",
    phone: "",
    email: "",
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
      // 1. Create booking
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

      // 2. Create Razorpay order
      const orderData = await api.post<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        description: string;
      }>("/payments/create-order", { bookingId: newBooking.id });

      // 3. Open Razorpay modal
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
        theme: {
          color: "#C9A227",
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // 4. Verify payment on server
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
            // Verification failed but payment may have gone through
            // Webhook will handle it, but show user a warning
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

  // SUCCESS VIEW
  if (step === "success" && booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00b67a]/10">
              <IconCheck className="h-8 w-8 text-[#00b67a]" />
            </div>
            <h1 className="mt-6 font-serif text-2xl font-bold">Booking Confirmed!</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Payment received successfully. Save your booking ID for reference.
            </p>

            <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono font-bold text-[#C9A227]">{booking.id}</span>
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
                  <span className="text-[#C9A227]">€{parseFloat(price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment</span>
                  <span className={`font-medium ${booking.paymentStatus === "PAID" ? "text-[#00b67a]" : "text-amber-600"}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>

              {booking.paymentStatus === "PENDING" && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <IconAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>Your payment is being verified. This usually takes a few seconds. If it doesn&apos;t update, contact support.</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                We&apos;ll send a confirmation to your phone. You can also find your booking using your phone number and booking ID.
              </p>
            </div>

            <div className="mt-8 flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/")}>
                Return to Home
              </Button>
              <Button onClick={() => router.push("/account")} className="bg-[#1B2A4A] text-white hover:bg-[#1B2A4A]/90">
                Find My Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // FAILED VIEW
  if (step === "failed") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <IconAlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="mt-6 font-serif text-2xl font-bold">Payment Failed</h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              {errorMessage || "Something went wrong. Please try again."}
            </p>
            <div className="mt-8 flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
              <Button onClick={() => { setStep("form"); setErrorMessage(""); }} className="bg-[#C9A227] text-[#1B2A4A] hover:bg-[#C9A227]/90 font-semibold">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // FORM / PAYING VIEW
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6" disabled={step === "paying"}>
        <IconArrowLeft className="mr-2 h-4 w-4" />
        Back to results
      </Button>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A227]/10">
              <IconCreditCard className="h-8 w-8 text-[#C9A227]" />
            </div>
            <h1 className="mt-4 font-serif text-2xl font-bold">Complete Your Booking</h1>
            <p className="mt-1 text-sm text-muted-foreground">Fill in your details and pay securely with Razorpay</p>
          </div>

          {/* Trip summary */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route</span>
              <span className="font-medium">{from} → {to}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Passengers</span>
              <span className="font-medium">{pax}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-[#C9A227]">€{parseFloat(price).toFixed(2)}</span>
            </div>
          </div>

          {/* Contact details */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold">Your Details</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="John Doe"
                  disabled={step === "paying"}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+39 123 456 7890"
                  disabled={step === "paying"}
                />
              </div>
              <div className="space-y-2">
                <Label>Email (for receipt)</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                  disabled={step === "paying"}
                />
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold">Pickup & Drop Details</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Pickup Address</Label>
                <Input
                  value={form.pickupAddress}
                  onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                  placeholder="Terminal 1, Gate 5"
                  disabled={step === "paying"}
                />
              </div>
              <div className="space-y-2">
                <Label>Drop Address</Label>
                <Input
                  value={form.dropAddress}
                  onChange={(e) => setForm({ ...form, dropAddress: e.target.value })}
                  placeholder="Hotel name, address"
                  disabled={step === "paying"}
                />
              </div>
              <div className="space-y-2">
                <Label>Luggage Notes</Label>
                <Input
                  value={form.luggageNotes}
                  onChange={(e) => setForm({ ...form, luggageNotes: e.target.value })}
                  placeholder="e.g. 2 large suitcases, 1 carry-on"
                  disabled={step === "paying"}
                />
              </div>
            </div>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <IconAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          <Button
            className="w-full bg-[#C9A227] text-[#1B2A4A] hover:bg-[#C9A227]/90 font-semibold h-12 text-base"
            onClick={handlePay}
            disabled={step === "paying" || !form.customerName || !form.phone}
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

          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by Razorpay. We never store your card details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-6" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
