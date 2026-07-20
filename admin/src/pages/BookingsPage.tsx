import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Booking, Pagination } from "@/lib/types";

const bookingStatusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  ONGOING: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

const paymentStatusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  PENDING: "warning",
  PAID: "success",
  PARTIAL: "default",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

export default function BookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const data = await api.get<{ items: Booking[]; pagination: Pagination }>(`/bookings?${params}`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load bookings"); } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateBookingStatus = async (id: string, bookingStatus: string) => {
    try {
      await api.put(`/bookings/${id}`, { bookingStatus });
      toast.success("Booking status updated");
      load(pagination.page);
    } catch { toast.error("Failed to update"); }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      await api.put(`/bookings/${id}`, { paymentStatus });
      toast.success("Payment status updated");
      load(pagination.page);
    } catch { toast.error("Failed to update"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="ONGOING">Ongoing</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Pax</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
              )) : items.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No bookings found</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{item.customerName}</div>
                      <div className="text-muted-foreground">{item.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{item.route?.fromLocation?.name || "N/A"}</div>
                      <div className="text-muted-foreground">→ {item.route?.toLocation?.name || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell>{item.carType?.name || "N/A"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(item.travelDate).toLocaleDateString()}</div>
                      {item.travelTime && <div className="text-muted-foreground">{item.travelTime}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{item.pax}</TableCell>
                  <TableCell className="font-semibold">€{Number(item.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={bookingStatusColors[item.bookingStatus] || "default"}>{item.bookingStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={paymentStatusColors[item.paymentStatus] || "default"}>{item.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Select value={item.bookingStatus} onValueChange={(v) => updateBookingStatus(item.id, v)}>
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="ONGOING">Ongoing</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={item.paymentStatus} onValueChange={(v) => updatePaymentStatus(item.id, v)}>
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="PARTIAL">Partial</SelectItem>
                          <SelectItem value="FAILED">Failed</SelectItem>
                          <SelectItem value="REFUNDED">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <Button key={i} variant={pagination.page === i + 1 ? "default" : "outline"} size="sm" onClick={() => load(i + 1)}>{i + 1}</Button>
          ))}
        </div>
      )}
    </div>
  );
}
