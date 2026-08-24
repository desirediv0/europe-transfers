import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useCurrencyRates, type ViewCurrency } from "@/hooks/useCurrencyRates";
import { RefreshCw, Download, Bus } from "lucide-react";

const CURRENCY_SYMBOLS: Record<ViewCurrency, string> = { EUR: "€", USD: "$", INR: "₹" };

interface Order {
  id: string;
  productType: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  amountInr: number | null;
  eurToInrRate: number | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  travelDate: string | null;
  pax: number;
  optionSelected: string | null;
  notes: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  CREATED: "warning",
  AUTHORIZED: "default",
  CAPTURED: "success",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

export default function FleetOrdersPage() {
  const [viewCurrency, setViewCurrency] = useState<ViewCurrency>("INR");
  const { convert } = useCurrencyRates();
  const [items, setItems] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20", productType: "VAN_COACH" });
      if (statusFilter) params.set("status", statusFilter);
      const data = await api.get<{ items: Order[]; pagination: Pagination }>(`/payments/admin/all?${params}`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load fleet orders"); } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/payments/${id}/status`, { status });
      toast.success("Order status updated");
      load(pagination.page);
    } catch { toast.error("Failed to update"); }
  };

  const displayAmount = (o: Order) => {
    // For INR, prefer the exact amount actually charged/recorded at booking time.
    if (viewCurrency === "INR" && o.amountInr != null) return o.amountInr;
    return convert(o.amount, viewCurrency);
  };

  const exportCSV = () => {
    const headers = ["ID", "Customer", "Email", "Phone", "Vehicle", "Amount", "Status", "Payment ID", "Date"];
    const rows = items.map((o) => [
      o.id.slice(0, 8),
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      o.productName,
      `${viewCurrency} ${displayAmount(o)}`,
      o.status,
      o.razorpayPaymentId || "-",
      new Date(o.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleet-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B2A4A]">
            <Bus className="h-5 w-5 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Fleet Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">Van & Coach paid bookings via Razorpay</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => load(pagination.page)} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="CREATED">Created</SelectItem>
            <SelectItem value="AUTHORIZED">Authorized</SelectItem>
            <SelectItem value="CAPTURED">Captured (Paid)</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{pagination.total} fleet orders</Badge>

        <Select value={viewCurrency} onValueChange={(v) => setViewCurrency(v as ViewCurrency)}>
          <SelectTrigger className="w-28 ml-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">View: EUR</SelectItem>
            <SelectItem value="USD">View: USD</SelectItem>
            <SelectItem value="INR">View: INR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">No fleet orders found</TableCell>
                </TableRow>
              ) : (
                items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px]">{order.productName}</p>
                        {order.optionSelected && <p className="text-xs text-gray-500">{order.optionSelected}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      {CURRENCY_SYMBOLS[viewCurrency]}{displayAmount(order)}
                      {viewCurrency === "INR" && order.amountInr == null && (
                        <span className="ml-1 text-[10px] font-normal text-gray-400">(est.)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[order.status] || "secondary"}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{order.razorpayPaymentId || "-"}</TableCell>
                    <TableCell className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CREATED">Created</SelectItem>
                          <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                          <SelectItem value="CAPTURED">Captured</SelectItem>
                          <SelectItem value="FAILED">Failed</SelectItem>
                          <SelectItem value="REFUNDED">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</span>
          <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => load(pagination.page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
