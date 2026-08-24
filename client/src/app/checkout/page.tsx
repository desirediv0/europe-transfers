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
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
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
  IconLock,
  IconArrowRight,
} from "@tabler/icons-react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading, verificationStep } = useAuth();
  const { format } = useCurrency();

  const routeId = searchParams.get("routeId") || "";
  const carTypeId = searchParams.get("carTypeId") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const pax = searchParams.get("pax") || "1";
  const price = searchParams.get("price") || "0";

  const isVerified = verificationStep === "VERIFIED";

  const [form, setForm] = useState({
    customerName: searchParams.get("name") || "",
    countryCode: "+39",
    phone: searchParams.get("phone") || "",
    email: searchParams.get("email") || "",
    pickupAddress: "",
    dropAddress: "",
    luggageNotes: "",
  });

  const fullPhone = `${form.countryCode}${form.phone.replace(/^\+/, "").replace(/\s/g, "")}`;

  const [step, setStep] = useState<"form" | "paying" | "success" | "failed">("form");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePay = async () => {
    if (!form.customerName || !form.phone) {
      toast.error("Name and phone are required");
      return;
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 7) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setStep("paying");
    setErrorMessage("");

    try {
      const newBooking = await api.post<Booking>("/bookings", {
        routeId,
        carTypeId,
        customerName: form.customerName,
        phone: fullPhone,
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
          contact: fullPhone || undefined,
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
      <div className="min-h-screen bg-slate-50/70 font-sans py-12 px-4">
        <Card className="max-w-2xl mx-auto border border-gray-200 bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
          <CardContent className="p-6 sm:p-10 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm">
              <IconCheck className="h-8 w-8 stroke-[3]" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-3.5 py-1 rounded-lg border border-emerald-200">
                <IconShieldCheck className="h-3.5 w-3.5" /> Official Transfer Voucher Issued
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-black text-navy tracking-tight">Booking Confirmed!</h1>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 font-semibold max-w-md mx-auto">
                Thank you for booking with Europe Transfers. Your chauffeured transfer voucher is ready.
              </p>
            </div>

            <div className="space-y-4 text-left max-w-lg mx-auto pt-2">
              <div className="rounded-xl border border-gray-200 bg-slate-50/80 p-5 space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between gap-3 border-b border-gray-200/80 pb-3">
                  <span className="text-gray-500 font-extrabold flex items-center gap-1.5">
                    <IconLock className="h-4 w-4 text-gold" /> Booking Reference ID
                  </span>
                  <span className="font-mono font-black text-navy bg-gold/15 px-3 py-1 rounded-md text-xs border border-gold/30">
                    {booking.id}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500 font-extrabold flex items-center gap-1.5 shrink-0">
                    <IconMapPin className="h-4 w-4 text-gold" /> Transfer Route
                  </span>
                  <span className="font-extrabold text-navy text-right">{from} → {to}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-extrabold flex items-center gap-1.5">
                    <IconCalendar className="h-4 w-4 text-gold" /> Date & Time
                  </span>
                  <span className="font-black text-navy">{date} at {time}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-extrabold flex items-center gap-1.5">
                    <IconUsers className="h-4 w-4 text-gold" /> Passengers
                  </span>
                  <span className="font-black text-navy">{pax} Passengers</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-extrabold flex items-center gap-1.5">
                    <IconCar className="h-4 w-4 text-gold" /> Vehicle Category
                  </span>
                  <span className="font-black text-navy uppercase">{carTypeId ? carTypeId.replace("ct-", "") : "Chauffeur"}</span>
                </div>

                <Separator className="bg-gray-200" />

                <div className="flex items-center justify-between text-base pt-1">
                  <span className="font-black text-navy">Total Amount Paid</span>
                  <span className="font-black text-emerald-600 text-xl">{format(parseFloat(price))}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-500 font-bold">Payment Status</span>
                  <Badge className={`rounded-md font-black text-xs px-3 py-1 ${booking.paymentStatus === "PAID" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}`}>
                    {booking.paymentStatus}
                  </Badge>
                </div>
              </div>

              {booking.paymentStatus === "PENDING" && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-bold text-amber-800">
                  <IconAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>Your payment verification is in progress. Driver voucher details will update shortly.</p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center font-medium leading-relaxed">
                Confirmation SMS and email voucher sent to your phone. Access your live itinerary anytime under your Account.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button variant="outline" onClick={() => router.push("/")} className="w-full sm:w-auto rounded-xl font-black text-xs h-11 px-6 border-gray-300 text-navy hover:bg-slate-100 cursor-pointer">
                <IconArrowLeft className="mr-2 h-4 w-4" /> Return to Home
              </Button>
              <Button onClick={() => router.push("/account")} className="w-full sm:w-auto rounded-xl font-black text-xs h-11 px-6 bg-navy hover:bg-navy-light text-white shadow-md cursor-pointer">
                View My Booking <IconArrowRight className="ml-2 h-4 w-4" />
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

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-6" />
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 h-96 bg-muted animate-pulse rounded-2xl" />
          <div className="lg:col-span-2 h-80 bg-muted animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="border-border/40 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600" />
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <IconLock className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="mt-6 text-2xl sm:text-3xl font-bold">Login Required</h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
              Please login to complete your booking. Your trip details will be saved.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button variant="outline" onClick={() => router.back()} className="rounded-full">
                <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
              <Button onClick={() => router.push("/auth/login")} variant="gold" className="rounded-full font-semibold">
                Login to Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="border-border/40 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600" />
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <IconShieldCheck className="h-10 w-10 text-amber-600" />
            </div>
            <h1 className="mt-6 text-2xl sm:text-3xl font-bold">Verification Required</h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
              Your account needs to be verified before you can book. Please upload your government ID and wait for admin approval.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button variant="outline" onClick={() => router.back()} className="rounded-full">
                <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
              <Button onClick={() => router.push("/account")} variant="gold" className="rounded-full font-semibold">
                Go to Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 font-sans pb-20">
      {/* Top Header Hero Bar */}
      <div className="bg-gradient-to-r from-navy via-[#0B1528] to-navy text-white border-b border-white/10 shadow-xl mb-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            disabled={step === "paying"}
            className="mb-5 text-white/80 hover:text-navy hover:bg-gold rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-sm"
          >
            <IconArrowLeft className="mr-2 h-4 w-4 stroke-[3]" />
            Back to Vehicle Selection
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-gold uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-md border border-gold/20 backdrop-blur-md">
                <IconShieldCheck className="h-3.5 w-3.5" /> Step 04: Secure Review & Payment
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-2.5">
                Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-200 to-gold">Chauffeured Transfer</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-md px-4 py-2.5 border border-white/15 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20 text-gold border border-gold/30 shrink-0">
                <IconLock className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">256-Bit SSL Encrypted</span>
                <span className="text-[10px] text-gray-300 font-medium">Bank-Grade Payment Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5 lg:items-start">
          {/* Form Left Side */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-gold via-amber-300 to-gold" />
              <CardContent className="p-5 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-navy tracking-tight">Passenger & Trip Details</h2>
                  <p className="mt-1 text-xs text-gray-500 font-medium">Review passenger information for voucher generation and driver meet & greet.</p>
                </div>

                {/* Section 1 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <h3 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-navy text-gold font-black text-[11px]">
                        01
                      </div>
                      Passenger Contact Info
                    </h3>
                    <span className="text-[10px] font-black text-gold bg-gold/10 px-2 py-0.5 rounded-md border border-gold/20">Required</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-black text-navy">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        value={form.customerName}
                        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                        placeholder="e.g. John Doe"
                        disabled={step === "paying"}
                        className="h-11 rounded-xl border-gray-200 bg-slate-50/70 text-xs font-bold text-navy focus:bg-white focus:border-gold transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-black text-navy">Phone Number <span className="text-red-500">*</span></Label>
                      <div className="flex h-11 rounded-xl border border-gray-200 bg-slate-50/70 overflow-hidden focus-within:border-gold focus-within:bg-white transition-all">
                        <select
                          value={form.countryCode}
                          onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                          disabled={step === "paying"}
                          className="h-full appearance-none border-0 bg-slate-100/90 pl-3 pr-7 text-xs font-extrabold text-navy focus:outline-none cursor-pointer"
                        >
                          <option value="+39">+39 (IT)</option>
                          <option value="+33">+33 (FR)</option>
                          <option value="+49">+49 (DE)</option>
                          <option value="+34">+34 (ES)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+41">+41 (CH)</option>
                          <option value="+31">+31 (NL)</option>
                          <option value="+43">+43 (AT)</option>
                          <option value="+91">+91 (IN)</option>
                          <option value="+1">+1 (US)</option>
                        </select>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="123 456 7890"
                          disabled={step === "paying"}
                          className="h-full flex-1 border-0 bg-transparent px-3 py-2 text-xs font-bold text-navy placeholder:text-gray-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-black text-navy">Email Address (for Receipt & Booking Voucher)</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. codeshorts007@gmail.com"
                      disabled={step === "paying"}
                      className="h-11 rounded-xl border-gray-200 bg-slate-50/70 text-xs font-bold text-navy focus:bg-white focus:border-gold transition-all"
                    />
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <h3 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gold text-navy font-black text-[11px]">
                        02
                      </div>
                      Chauffeur Directions & Flight Info
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400">Optional</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-black text-navy">Pickup Location Details / Flight Number</Label>
                    <Input
                      value={form.pickupAddress}
                      onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                      placeholder="e.g. Milan Malpensa Terminal 1, Arrival Hall / Flight LX142"
                      disabled={step === "paying"}
                      className="h-11 rounded-xl border-gray-200 bg-slate-50/70 text-xs font-bold text-navy focus:bg-white focus:border-gold transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black text-navy">Drop-off Destination Address</Label>
                    <Input
                      value={form.dropAddress}
                      onChange={(e) => setForm({ ...form, dropAddress: e.target.value })}
                      placeholder="e.g. Hotel Armani, Via Alessandro Manzoni 31, Milan"
                      disabled={step === "paying"}
                      className="h-11 rounded-xl border-gray-200 bg-slate-50/70 text-xs font-bold text-navy focus:bg-white focus:border-gold transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black text-navy">Luggage & Special Instructions</Label>
                    <Input
                      value={form.luggageNotes}
                      onChange={(e) => setForm({ ...form, luggageNotes: e.target.value })}
                      placeholder="e.g. 2 large suit cases + 1 child seat needed"
                      disabled={step === "paying"}
                      className="h-11 rounded-xl border-gray-200 bg-slate-50/70 text-xs font-bold text-navy focus:bg-white focus:border-gold transition-all"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Guarantee Card */}
            <div className="rounded-xl bg-slate-900 text-white p-5 shadow-sm border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/20 text-gold border border-gold/30 shrink-0">
                  <IconShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">All-Inclusive Transparent Rate</h4>
                  <p className="text-xs text-gray-300 mt-0.5 leading-relaxed font-medium">
                    Taxes, tolls, driver gratuity, meet & greet, and 60-min wait time are 100% included.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Summary Right Side */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden lg:sticky lg:top-24">
              <CardContent className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-black text-navy tracking-tight">Trip Summary</h3>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    Instant Voucher
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 border border-gray-200/80 p-4 space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-500 font-extrabold flex items-center gap-1.5 shrink-0">
                      <IconMapPin className="h-4 w-4 text-gold" /> Route
                    </span>
                    <span className="font-black text-navy text-right leading-tight">{from} → {to}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-extrabold flex items-center gap-1.5">
                      <IconCalendar className="h-4 w-4 text-gold" /> Travel Date
                    </span>
                    <span className="font-black text-navy">{date || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-extrabold flex items-center gap-1.5">
                      <IconClock className="h-4 w-4 text-gold" /> Time
                    </span>
                    <span className="font-black text-navy">{time || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-extrabold flex items-center gap-1.5">
                      <IconUsers className="h-4 w-4 text-gold" /> Passengers
                    </span>
                    <span className="font-black text-navy">{pax}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-gray-200/70">
                    <span className="text-gray-500 font-extrabold flex items-center gap-1.5">
                      <IconCar className="h-4 w-4 text-gold" /> Chauffeur Vehicle
                    </span>
                    <span className="font-black text-navy bg-navy/10 border border-navy/20 px-2.5 py-0.5 rounded-md text-[11px]">
                      {carTypeId ? carTypeId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "—"}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-navy uppercase tracking-wider block">Total Fare</span>
                    <span className="text-[10px] text-emerald-600 font-bold">No Hidden Fees</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-navy tracking-tight">{format(parseFloat(price))}</span>
                </div>

                {errorMessage && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                    <IconAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                <Button
                  className="w-full h-12 text-xs font-black rounded-xl bg-gold hover:bg-gold-light text-navy shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  onClick={handlePay}
                  disabled={step === "paying" || !form.customerName || !form.phone || !routeId || !carTypeId}
                >
                  {step === "paying" ? (
                    <span className="flex items-center gap-2">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Securing Booking...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <IconCreditCard className="h-4 w-4 stroke-[2.5]" />
                      Pay {format(parseFloat(price))} Securely
                    </span>
                  )}
                </Button>

                <div className="text-center pt-0.5">
                  <p className="text-[10px] font-bold text-gray-500 flex items-center justify-center gap-1">
                    <IconLock className="h-3.5 w-3.5 text-emerald-600" />
                    Encrypted payment via Razorpay Payment Gateway
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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
