import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { toast } from "sonner";
import {
  ChartContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "@/components/ui/chart";
import {
  IconCalendarCheck,
  IconPackage,
  IconMapPin,
  IconUsers,
  IconCar,
  IconRoute,
  IconStar,
  IconCoinEuro,
  IconClock,
  IconArrowRight,
  IconAlertTriangle,
  IconCheck,
  IconTrendingUp,
} from "@tabler/icons-react";

interface DashboardCounts {
  bookings: number;
  packages: number;
  cities: number;
  locations: number;
  routes: number;
  users: number;
  carTypes: number;
  testimonials: number;
  pendingVerifications: number;
  pendingBookings: number;
  paidBookings: number;
}

interface DashboardData {
  counts: DashboardCounts;
  recentBookings: Booking[];
  bookingsByMonth: { month: string; bookings: number; revenue: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState<"bookings" | "revenue">("bookings");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.get<DashboardData>("/dashboard/stats");
        setData(result);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { label: "Total Bookings", value: data?.counts.bookings ?? 0, icon: IconCalendarCheck, color: "bg-blue-500/10 text-blue-600", href: "/bookings" },
    { label: "Pending Bookings", value: data?.counts.pendingBookings ?? 0, icon: IconClock, color: "bg-amber-500/10 text-amber-600", href: "/bookings" },
    { label: "Paid Bookings", value: data?.counts.paidBookings ?? 0, icon: IconCheck, color: "bg-emerald-500/10 text-emerald-600", href: "/bookings" },
    { label: "Pending Verifications", value: data?.counts.pendingVerifications ?? 0, icon: IconUsers, color: "bg-rose-500/10 text-rose-600", href: "/users" },
    { label: "Packages", value: data?.counts.packages ?? 0, icon: IconPackage, color: "bg-violet-500/10 text-violet-600", href: "/packages" },
    { label: "Cities", value: data?.counts.cities ?? 0, icon: IconMapPin, color: "bg-cyan-500/10 text-cyan-600", href: "/locations" },
    { label: "Routes", value: data?.counts.routes ?? 0, icon: IconRoute, color: "bg-gold/10 text-gold", href: "/routes" },
    { label: "Car Types", value: data?.counts.carTypes ?? 0, icon: IconCar, color: "bg-orange-500/10 text-orange-600", href: "/car-types" },
  ];

  const totalRevenue = data?.bookingsByMonth.reduce((sum, m) => sum + m.revenue, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your business in real-time</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconTrendingUp className="h-4 w-4 text-emerald-500" />
          <span>Live data from database</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="h-full transition-all hover:shadow-md hover:border-gold/30 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Chart + Recent */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconTrendingUp className="h-5 w-5 text-gold" />
                {chartMetric === "bookings" ? "Bookings" : "Revenue"} Trend
              </CardTitle>
              <CardDescription>This year monthly {chartMetric === "bookings" ? "bookings" : "revenue (€)"}</CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
              <Button
                variant={chartMetric === "bookings" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartMetric("bookings")}
                className="text-xs"
              >
                Bookings
              </Button>
              <Button
                variant={chartMetric === "revenue" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartMetric("revenue")}
                className="text-xs"
              >
                Revenue
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ChartContainer>
                <AreaChart data={data?.bookingsByMonth || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A227" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A227" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (chartMetric === "revenue" ? `€${v}` : v)}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartMetric}
                    stroke="#C9A227"
                    strokeWidth={2}
                    fill="url(#colorMetric)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Total revenue this year</p>
                <p className="text-xl font-bold text-gold">€{totalRevenue.toFixed(2)}</p>
              </div>
              <Link to="/bookings">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <IconArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconCalendarCheck className="h-5 w-5 text-gold" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest customer bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : data?.recentBookings.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">No bookings yet</div>
            ) : (
              data?.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/10 text-navy font-bold text-sm shrink-0">
                    {getInitials(booking.customerName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{booking.customerName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booking.route?.fromLocation?.name} → {booking.route?.toLocation?.name}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs rounded-full px-2 py-0.5">
                        {booking.carType?.name}
                      </Badge>
                      <Badge
                        className={`text-xs rounded-full px-2 py-0.5 ${
                          booking.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : booking.paymentStatus === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gold">€{Number(booking.price).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          <CardContent className="pt-0">
            <Link to="/bookings">
              <Button variant="outline" className="w-full rounded-full text-sm">
                View All Bookings <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconAlertTriangle className="h-4 w-4 text-amber-500" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconClock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Pending Payments</span>
                  </div>
                  <span className="text-lg font-bold">{data?.counts.pendingBookings}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconUsers className="h-4 w-4 text-rose-500" />
                    <span className="text-sm">ID Verifications</span>
                  </div>
                  <span className="text-lg font-bold">{data?.counts.pendingVerifications}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconCoinEuro className="h-4 w-4 text-emerald-500" />
              Revenue Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Paid Bookings</span>
                  </div>
                  <span className="text-lg font-bold">{data?.counts.paidBookings}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconCalendarCheck className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Total Bookings</span>
                  </div>
                  <span className="text-lg font-bold">{data?.counts.bookings}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconStar className="h-4 w-4 text-gold" />
              Content Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconPackage className="h-4 w-4 text-violet-500" />
                    <span className="text-sm">Packages</span>
                  </div>
                  <span className="text-lg font-bold">{data?.counts.packages}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconStar className="h-4 w-4 text-gold" />
                    <span className="text-sm">Testimonials</span>
                  </div>
                  <span className="text-lg font-bold">{data?.counts.testimonials}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}
