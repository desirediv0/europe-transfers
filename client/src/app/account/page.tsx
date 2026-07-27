"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";
import {
  IconMail,
  IconPhone,
  IconFile,
  IconCheck,
  IconX,
  IconLogout,
  IconCalendarCheck,
  IconClock,
  IconMapPin,
  IconCar,
  IconUsers,
  IconArrowRight,
  IconCreditCard,
  IconUpload,
  IconAlertTriangle,
  IconShieldCheck,
  IconSparkles,
  IconUser,
} from "@tabler/icons-react";

function ProfileSkeleton() {
  return (
    <Card className="border-gray-200/80 rounded-3xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

function BookingSkeleton() {
  return (
    <Card className="border-gray-200/80 rounded-3xl">
      <CardContent className="p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function AccountPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Dialog & Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Change of travel plans");
  const [cancelNotes, setCancelNotes] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = () => {
    if (user) {
      api.get<{ items: Booking[] }>(`/bookings/my`)
        .then((d) => setBookings(d.items))
        .catch(() => setBookings([]))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    fetchBookings();
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleOpenCancel = (b: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBooking(b);
    setCancelReason("Change of travel plans");
    setCancelNotes("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setCancelling(true);
    try {
      await api.post(`/bookings/${selectedBooking.id}/cancel`, {
        reason: cancelReason,
        notes: cancelNotes,
      });
      setShowCancelModal(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch {
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-6 font-sans">
        <Skeleton className="h-10 w-48" />
        <ProfileSkeleton />
        <BookingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans py-8 sm:py-12 pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-gold uppercase tracking-wider bg-gold/10 px-3 py-0.5 rounded-md border border-gold/20">
                Client Account Dashboard
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-navy tracking-tight">
              Welcome back, <span className="text-gold">{user.name || "Valued Client"}</span>
            </h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-xl border-gray-300 text-navy font-black text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer self-start sm:self-auto px-4 py-2"
          >
            <IconLogout className="mr-1.5 h-4 w-4" /> Sign Out
          </Button>
        </div>

        {/* Verification Status Banner */}
        {user.idDocumentStatus !== "VERIFIED" && (
          <Card className={`overflow-hidden rounded-xl border ${
            user.idDocumentStatus === "REJECTED" ? "bg-red-50 border-red-200 text-red-900" :
            user.idDocumentUrl ? "bg-blue-50 border-blue-200 text-blue-900" :
            "bg-amber-50 border-amber-200 text-amber-900"
          }`}>
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  {user.idDocumentStatus === "REJECTED" ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600 shrink-0">
                      <IconAlertTriangle className="h-5 w-5" />
                    </div>
                  ) : user.idDocumentUrl ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
                      <IconClock className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0">
                      <IconUpload className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-black text-navy">
                      {user.idDocumentStatus === "REJECTED" && "ID Verification Rejected"}
                      {user.idDocumentStatus === "PENDING" && "Government ID Verification in Progress"}
                      {!user.idDocumentUrl && "Government ID Required for Direct Booking Access"}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">
                      {user.idDocumentStatus === "REJECTED" && (user.rejectionReason ? `Reason: ${user.rejectionReason}` : "Please upload a clear photo of your passport or driving license.")}
                      {user.idDocumentStatus === "PENDING" && "Our compliance team is reviewing your document. Approval completes within 12-24 hours."}
                      {!user.idDocumentUrl && "Upload a clear passport or driving license image to complete client verification."}
                    </p>
                  </div>
                </div>

                <Link href="/account/upload-id">
                  <Button className="rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs px-4 py-2 shadow-sm shrink-0 cursor-pointer">
                    <IconUpload className="mr-1.5 h-4 w-4" />
                    {user.idDocumentUrl ? "Re-upload ID" : "Upload ID"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client Account Details Card */}
        <Card className="border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-slate-50/70 py-3.5 px-5">
            <CardTitle className="text-sm font-black text-navy flex items-center gap-2">
              <IconUser className="h-4 w-4 text-gold" /> Personal Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-navy shrink-0">
                  <IconMail className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-xs font-black text-navy">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-navy shrink-0">
                  <IconPhone className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-xs font-black text-navy">{user.phone || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-navy shrink-0">
                  <IconFile className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">ID Document Status</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={`rounded-md text-[10px] font-black border-0 px-2 py-0.5 ${
                      user.idDocumentStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-800" :
                      user.idDocumentStatus === "REJECTED" ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {user.idDocumentStatus === "VERIFIED" && <IconCheck className="mr-1 h-3 w-3 stroke-[3]" />}
                      {user.idDocumentStatus === "REJECTED" && <IconX className="mr-1 h-3 w-3 stroke-[3]" />}
                      {user.idDocumentStatus === "PENDING" && <IconClock className="mr-1 h-3 w-3 stroke-[3]" />}
                      {user.idDocumentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Bookings History Card */}
        <Card className="border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-slate-50/70 py-3.5 px-5">
            <CardTitle className="text-sm font-black text-navy flex items-center justify-between">
              <span className="flex items-center gap-2">
                <IconCalendarCheck className="h-4 w-4 text-gold" /> My Chauffeured Journeys
              </span>
              <Badge className="rounded-md bg-navy text-gold text-[10px] font-black px-2.5 py-0.5">
                {bookings.length} {bookings.length === 1 ? "Trip" : "Trips"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-100 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <IconCar className="h-7 w-7 text-navy" />
                </div>
                <div>
                  <h3 className="text-base font-black text-navy">No Private Transfers Booked Yet</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto font-medium">
                    Explore our luxury Mercedes fleet and book fixed rate transfers across Europe.
                  </p>
                </div>
                <Link href="/fleet">
                  <Button className="rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs px-5 py-2.5 shadow-sm cursor-pointer">
                    Book Transfer Now <IconArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => { setSelectedBooking(b); setShowDetails(true); }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border border-gray-200 hover:border-gold/60 hover:shadow-md transition-all bg-white cursor-pointer group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-navy flex items-center gap-1.5 group-hover:text-gold transition-colors">
                          <IconCar className="h-4 w-4 text-gold" />
                          {b.carType?.name || "Luxury Chauffeur Transfer"}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                          <IconUsers className="h-3.5 w-3.5 text-gold" /> {b.pax} pax
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm font-black text-navy">€{Number(b.price).toFixed(0)}</span>
                      </div>

                      <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2 font-medium">
                        <span className="flex items-center gap-1 text-navy font-black">
                          <IconMapPin className="h-3.5 w-3.5 text-gold" />
                          {b.route?.fromLocation?.name} → {b.route?.toLocation?.name}
                        </span>
                        <span className="text-gray-200">|</span>
                        <span className="flex items-center gap-1 font-semibold text-gray-600">
                          <IconClock className="h-3.5 w-3.5 text-gold" />
                          {b.travelDate ? new Date(b.travelDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} · {b.travelTime || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap sm:flex-nowrap pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex items-center gap-1.5">
                        <Badge className="rounded-md bg-slate-100 text-navy border-0 text-[10px] font-black px-2.5 py-1">
                          <IconCreditCard className="mr-1 h-3 w-3 text-gold" />
                          {b.paymentStatus}
                        </Badge>
                        <Badge className={`rounded-md border-0 text-[10px] font-black px-2.5 py-1 ${
                          b.bookingStatus === "CONFIRMED" ? "bg-emerald-100 text-emerald-800" :
                          b.bookingStatus === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                          b.bookingStatus === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {b.bookingStatus}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {b.paymentStatus === "PENDING" && b.bookingStatus !== "CANCELLED" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/checkout?routeId=${b.routeId}&carTypeId=${b.carTypeId}&from=${encodeURIComponent(b.route?.fromLocation?.name || "")}&to=${encodeURIComponent(b.route?.toLocation?.name || "")}&date=${b.travelDate ? new Date(b.travelDate).toISOString().split("T")[0] : ""}&time=${encodeURIComponent(b.travelTime || "")}&pax=${b.pax}&price=${b.price}&currency=${b.currency}&name=${encodeURIComponent(b.customerName)}&phone=${encodeURIComponent(b.phone)}&email=${encodeURIComponent(b.email || "")}`);
                            }}
                            className="h-8 rounded-lg px-3 text-[11px] font-black bg-gold hover:bg-gold-light text-navy shadow-sm cursor-pointer flex items-center gap-1"
                          >
                            <IconCreditCard className="h-3.5 w-3.5" /> Pay Now
                          </Button>
                        )}

                        {b.bookingStatus !== "CANCELLED" && b.bookingStatus !== "COMPLETED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleOpenCancel(b, e)}
                            className="h-8 rounded-lg px-2.5 text-[11px] font-bold text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 cursor-pointer"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Details Modal Dialog */}
        {showDetails && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-lg border-0 bg-white rounded-3xl shadow-2xl overflow-hidden font-sans">
              <div className="h-2 bg-gradient-to-r from-navy via-gold to-navy" />
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black text-gold uppercase tracking-wider">Official Transfer Voucher</span>
                    <h3 className="text-xl font-black text-navy mt-0.5">Booking Details</h3>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-navy transition-colors cursor-pointer"
                  >
                    <IconX className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Booking Reference</span>
                      <span className="font-mono font-black text-navy bg-gold/15 px-2.5 py-0.5 rounded border border-gold/30">{selectedBooking.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Vehicle Category</span>
                      <span className="font-extrabold text-navy">{selectedBooking.carType?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Route</span>
                      <span className="font-extrabold text-navy">{selectedBooking.route?.fromLocation?.name} → {selectedBooking.route?.toLocation?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Date & Time</span>
                      <span className="font-extrabold text-navy">
                        {selectedBooking.travelDate ? new Date(selectedBooking.travelDate).toLocaleDateString() : "—"} · {selectedBooking.travelTime || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Passengers</span>
                      <span className="font-extrabold text-navy">{selectedBooking.pax} Passengers</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Total Price</span>
                      <span className="font-black text-navy text-sm">€{Number(selectedBooking.price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status</span>
                      <div className="flex gap-1.5">
                        <Badge className="rounded-full bg-slate-200 text-navy text-[10px] font-bold">{selectedBooking.paymentStatus}</Badge>
                        <Badge className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">{selectedBooking.bookingStatus}</Badge>
                      </div>
                    </div>
                  </div>

                  {selectedBooking.pickupAddress && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200/80">
                      <span className="text-gray-400 font-bold block text-[10px] uppercase">Pickup Address / Flight</span>
                      <p className="text-navy font-bold mt-0.5">{selectedBooking.pickupAddress}</p>
                    </div>
                  )}

                  {selectedBooking.dropAddress && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200/80">
                      <span className="text-gray-400 font-bold block text-[10px] uppercase">Drop Address / Hotel</span>
                      <p className="text-navy font-bold mt-0.5">{selectedBooking.dropAddress}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  {selectedBooking.paymentStatus === "PENDING" && selectedBooking.bookingStatus !== "CANCELLED" && (
                    <Button
                      onClick={() => {
                        setShowDetails(false);
                        router.push(`/checkout?routeId=${selectedBooking.routeId}&carTypeId=${selectedBooking.carTypeId}&from=${encodeURIComponent(selectedBooking.route?.fromLocation?.name || "")}&to=${encodeURIComponent(selectedBooking.route?.toLocation?.name || "")}&date=${selectedBooking.travelDate ? new Date(selectedBooking.travelDate).toISOString().split("T")[0] : ""}&time=${encodeURIComponent(selectedBooking.travelTime || "")}&pax=${selectedBooking.pax}&price=${selectedBooking.price}&currency=${selectedBooking.currency}&name=${encodeURIComponent(selectedBooking.customerName)}&phone=${encodeURIComponent(selectedBooking.phone)}&email=${encodeURIComponent(selectedBooking.email || "")}`);
                      }}
                      className="flex-1 rounded-2xl bg-gold hover:bg-gold-light text-navy font-black text-xs h-11 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <IconCreditCard className="h-4 w-4" /> Complete Payment Now
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowDetails(false)}
                    variant="outline"
                    className="flex-1 rounded-2xl border-gray-200 text-navy font-extrabold text-xs h-11 cursor-pointer"
                  >
                    Close Voucher
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cancellation Reason Modal Dialog */}
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md border-0 bg-white rounded-3xl shadow-2xl overflow-hidden font-sans">
              <div className="h-2 bg-gradient-to-r from-red-500 via-rose-500 to-red-600" />
              <CardContent className="p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-0.5 rounded-md">Cancel Booking Request</span>
                    <h3 className="text-xl font-black text-navy mt-1">Reason for Cancellation</h3>
                  </div>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-navy transition-colors cursor-pointer"
                  >
                    <IconX className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 font-medium">
                  Please select why you are cancelling booking <span className="font-mono font-bold text-navy">#{selectedBooking.id}</span>. A notification email will be dispatched to our dispatch team.
                </p>

                {/* Radio Options */}
                <div className="space-y-2.5 pt-1">
                  {[
                    "Change of travel plans",
                    "Flight schedule modified/cancelled",
                    "Booked by mistake",
                    "Found alternative transport",
                    "Other reason",
                  ].map((r) => (
                    <label
                      key={r}
                      onClick={() => setCancelReason(r)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        cancelReason === r ? "border-red-500 bg-red-50/40 font-black text-navy" : "border-gray-200 hover:bg-slate-50 font-bold text-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        checked={cancelReason === r}
                        onChange={() => setCancelReason(r)}
                        className="h-4 w-4 accent-red-600 cursor-pointer"
                      />
                      <span className="text-xs">{r}</span>
                    </label>
                  ))}
                </div>

                {/* Optional Textarea */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-black text-navy">Additional Details / Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Provide any additional comments for admin..."
                    value={cancelNotes}
                    onChange={(e) => setCancelNotes(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50/60 p-3 text-xs font-medium text-navy focus:bg-white focus:border-red-500 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelModal(false)}
                    disabled={cancelling}
                    className="flex-1 rounded-2xl border-gray-200 text-xs font-bold h-12 cursor-pointer"
                  >
                    Keep Booking
                  </Button>
                  <Button
                    onClick={handleConfirmCancel}
                    disabled={cancelling}
                    className="flex-1 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs h-12 shadow-lg shadow-red-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
