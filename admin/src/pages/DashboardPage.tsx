import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { CalendarCheck, Package, MapPin, Users } from "lucide-react";

interface DashboardCounts {
  bookings: number;
  packages: number;
  cities: number;
  pendingVerifications: number;
}

export default function DashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookings, packages, cities, users] = await Promise.all([
          api.get<{ pagination: { total: number } }>("/bookings?limit=1"),
          api.get<{ pagination: { total: number } }>("/packages?limit=1"),
          api.get<{ pagination: { total: number } }>("/cities?limit=1"),
          api.get<{ items: { id: string }[]; pagination: { total: number } }>("/admin/users?limit=100"),
        ]);

        const pendingVerifications = users.items?.filter((u: any) => u.idDocumentStatus === "PENDING").length ?? 0;

        setCounts({
          bookings: bookings.pagination.total,
          packages: packages.pagination.total,
          cities: cities.pagination.total,
          pendingVerifications,
        });
      } catch {
        setCounts({ bookings: 0, packages: 0, cities: 0, pendingVerifications: 0 });
      }
    };
    load();
  }, []);

  const cards = [
    { title: "Total Bookings", icon: CalendarCheck, value: counts?.bookings },
    { title: "Packages", icon: Package, value: counts?.packages },
    { title: "Cities", icon: MapPin, value: counts?.cities },
    { title: "Pending Verifications", icon: Users, value: counts?.pendingVerifications },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {counts === null ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
