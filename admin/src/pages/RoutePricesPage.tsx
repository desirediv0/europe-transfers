import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Route, CarType, RoutePrice } from "@/lib/types";
import { Pencil } from "lucide-react";

export default function RoutePricesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadRoutes = useCallback(async () => {
    try {
      const data = await api.get<{ items: Route[] }>("/routes?limit=100");
      setRoutes(data.items);
      if (data.items.length > 0 && !selectedRouteId) {
        setSelectedRouteId(data.items[0].id);
      }
    } catch {
      toast.error("Failed to load routes");
    }
  }, [selectedRouteId]);

  const loadCarTypes = useCallback(async () => {
    try {
      const data = await api.get<{ items: CarType[] }>("/car-types?limit=100");
      setCarTypes(data.items);
    } catch {
      toast.error("Failed to load car types");
    }
  }, []);

  const loadPrices = useCallback(async () => {
    if (!selectedRouteId) return;
    setLoading(true);
    try {
      const data = await api.get<RoutePrice[]>(`/route-prices?routeId=${selectedRouteId}`);
      const priceMap: Record<string, number> = {};
      data.forEach((rp) => { priceMap[rp.carTypeId] = rp.price; });
      setPrices(priceMap);
    } catch {
      toast.error("Failed to load prices");
    } finally {
      setLoading(false);
    }
  }, [selectedRouteId]);

  useEffect(() => { loadRoutes(); loadCarTypes(); }, [loadRoutes, loadCarTypes]);
  useEffect(() => { loadPrices(); }, [loadPrices]);

  const handlePriceChange = (carTypeId: string, value: string) => {
    setPrices((prev) => ({ ...prev, [carTypeId]: parseFloat(value) || 0 }));
  };

  const handleSave = async () => {
    if (!selectedRouteId) { toast.error("Select a route first"); return; }
    setSaving(true);
    try {
      const pricesPayload = carTypes
        .filter((ct) => prices[ct.id] != null && prices[ct.id] > 0)
        .map((ct) => ({ carTypeId: ct.id, price: prices[ct.id], currency: "EUR" }));

      await api.post("/route-prices/bulk", { routeId: selectedRouteId, prices: pricesPayload });
      toast.success("Prices saved");
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Route Prices</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Route</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="flex w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
          >
            <option value="">Select a route</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.fromLocation?.name || route.fromLocationId} → {route.toLocation?.name || route.toLocationId}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedRouteId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Prices for: {selectedRoute?.fromLocation?.name} → {selectedRoute?.toLocation?.name}
            </CardTitle>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Prices
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car Type</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>AC</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
                  ))
                ) : carTypes.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No car types found. Create car types first.</TableCell></TableRow>
                ) : (
                  carTypes.map((ct) => (
                    <TableRow key={ct.id}>
                      <TableCell className="font-medium">{ct.name}</TableCell>
                      <TableCell>{ct.seats}</TableCell>
                      <TableCell>{ct.isAC ? "Yes" : "No"}</TableCell>
                      <TableCell className="font-semibold">
                        {prices[ct.id] != null ? `€${prices[ct.id]}` : <span className="text-muted-foreground">Not set</span>}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Prices - {selectedRoute?.fromLocation?.name} → {selectedRoute?.toLocation?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {carTypes.map((ct) => (
              <div key={ct.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-sm">{ct.name} ({ct.seats} seats)</Label>
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={prices[ct.id]?.toString() || ""}
                    onChange={(e) => handlePriceChange(ct.id, e.target.value)}
                  />
                </div>
                <span className="text-sm text-muted-foreground">EUR</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Prices"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
