"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { IconUser, IconMail, IconPhone, IconFile, IconCheck, IconX, IconLogout, IconCalendarCheck } from "@tabler/icons-react";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  ONGOING: "default",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

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
      api.get<{ items: Booking[] }>(`/bookings?limit=50`).then((d) => setBookings(d.items)).finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold">My Account</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profile</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <IconLogout className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm"><IconUser className="h-4 w-4 text-muted-foreground" /> <span className="font-medium">{user.name}</span></div>
          <div className="flex items-center gap-3 text-sm"><IconMail className="h-4 w-4 text-muted-foreground" /> {user.email}</div>
          <div className="flex items-center gap-3 text-sm"><IconPhone className="h-4 w-4 text-muted-foreground" /> {user.phone}</div>
          <div className="flex items-center gap-3 text-sm">
            <IconFile className="h-4 w-4 text-muted-foreground" /> ID Document:{" "}
            <Badge variant={user.idDocumentStatus === "VERIFIED" ? "default" : user.idDocumentStatus === "REJECTED" ? "destructive" : "secondary"}>
              {user.idDocumentStatus === "VERIFIED" && <IconCheck className="mr-1 h-3 w-3" />}
              {user.idDocumentStatus === "REJECTED" && <IconX className="mr-1 h-3 w-3" />}
              {user.idDocumentStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendarCheck className="h-5 w-5" /> My Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">{b.carType?.name || "Transfer"}</div>
                    <div className="text-sm text-muted-foreground">
                      {b.route?.fromLocation?.name} → {b.route?.toLocation?.name} · {new Date(b.travelDate).toLocaleDateString()} · {b.pax} pax · €{Number(b.price).toFixed(2)}
                    </div>
                  </div>
                  <Badge variant={statusColors[b.bookingStatus]}>{b.bookingStatus}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
