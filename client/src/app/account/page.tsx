"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
} from "@tabler/icons-react";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  ONGOING: "default",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

const paymentStatusColors: Record<string, "default" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  PAID: "success",
  PARTIAL: "default",
  FAILED: "destructive",
  REFUNDED: "default",
};

function ProfileSkeleton() {
  return (
    <Card className="border-border/40">
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
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

function BookingSkeleton() {
  return (
    <Card className="border-border/40">
      <CardContent className="p-0">
        <div className="p-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full max-w-sm" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AccountPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      api.get<{ items: Booking[] }>(`/bookings?limit=50`)
        .then((d) => setBookings(d.items))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-6">
        <Skeleton className="h-10 w-48" />
        <ProfileSkeleton />
        <BookingSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">My Account</h1>
      <p className="mt-2 text-muted-foreground">Manage your profile and bookings</p>

      {/* Profile Card */}
      <Card className="mt-8 border-border/40 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="w-fit">
              <IconLogout className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <IconMail className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <IconPhone className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <IconFile className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ID Document</p>
                <Badge variant={user.idDocumentStatus === "VERIFIED" ? "default" : user.idDocumentStatus === "REJECTED" ? "destructive" : "secondary"} className="mt-0.5">
                  {user.idDocumentStatus === "VERIFIED" && <IconCheck className="mr-1 h-3 w-3" />}
                  {user.idDocumentStatus === "REJECTED" && <IconX className="mr-1 h-3 w-3" />}
                  {user.idDocumentStatus}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Card */}
      <Card className="mt-6 border-border/40 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <IconCalendarCheck className="h-5 w-5 text-gold" /> My Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full max-w-sm" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <IconCalendarCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No bookings yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Start exploring our premium transfers and tours.</p>
              <Link href="/fleet">
                <Button variant="gold" className="mt-4 rounded-full">
                  Book a Transfer <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 hover:border-gold/20 hover:shadow-sm transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold flex items-center gap-1.5">
                        <IconCar className="h-4 w-4 text-gold" />
                        {b.carType?.name || "Transfer"}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <IconUsers className="h-3.5 w-3.5" /> {b.pax} pax
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-sm font-medium text-gold">€{Number(b.price).toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <IconMapPin className="h-3.5 w-3.5" />
                        {b.route?.fromLocation?.name} → {b.route?.toLocation?.name}
                      </span>
                      <span className="text-border">|</span>
                      <span className="flex items-center gap-1">
                        <IconClock className="h-3.5 w-3.5" />
                        {new Date(b.travelDate).toLocaleDateString()} · {b.travelTime || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={paymentStatusColors[b.paymentStatus]} className="rounded-full">
                      <IconCreditCard className="mr-1 h-3 w-3" />
                      {b.paymentStatus}
                    </Badge>
                    <Badge variant={statusColors[b.bookingStatus]} className="rounded-full">
                      {b.bookingStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
