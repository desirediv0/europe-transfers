import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Route, Location, CarType, Pagination, RoutePrice } from "@/lib/types";
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconSearch,
  IconArrowLeft,
  IconArrowRight,
  IconCoinEuro,
  IconRoute,
  IconCar,
  IconMapPin,
  IconCheck,
  IconX,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface RouteForm {
  fromLocationId: string;
  toLocationId: string;
  isActive: boolean;
  prices: Record<string, string>;
}

function getInitials(name: string) {
  return name?.charAt(0).toUpperCase() || "?";
}

export default function RoutesPage() {
  const [items, setItems] = useState<Route[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const [form, setForm] = useState<RouteForm>({
    fromLocationId: "",
    toLocationId: "",
    isActive: true,
    prices: {},
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<Route | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: Route[]; pagination: Pagination }>(`/routes?page=${page}&limit=20`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load routes");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLocations = useCallback(async () => {
    try {
      const data = await api.get<Location[]>("/locations/all");
      setLocations(data);
    } catch {
      toast.error("Failed to load locations");
    }
  }, []);

  const loadCarTypes = useCallback(async () => {
    try {
      const data = await api.get<{ items: CarType[] }>("/car-types?limit=100");
      setCarTypes(data.items);
    } catch {
      toast.error("Failed to load car types");
    }
  }, []);

  useEffect(() => { load(); loadLocations(); loadCarTypes(); }, [load, loadLocations, loadCarTypes]);

  const buildPriceMap = (prices: RoutePrice[]) => {
    const map: Record<string, string> = {};
    prices.forEach((rp) => { map[rp.carTypeId] = rp.price.toString(); });
    return map;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ fromLocationId: "", toLocationId: "", isActive: true, prices: {} });
    setDialogOpen(true);
  };

  const openEdit = async (route: Route) => {
    // Pre-fill from already loaded route prices for instant open
    const initialPrices = buildPriceMap(route.routePrices || []);
    setEditing(route);
    setForm({
      fromLocationId: route.fromLocationId,
      toLocationId: route.toLocationId,
      isActive: route.isActive,
      prices: initialPrices,
    });
    setDialogOpen(true);

    // Refresh prices in background
    try {
      const prices = await api.get<RoutePrice[]>(`/route-prices?routeId=${route.id}`);
      setForm((prev) => ({ ...prev, prices: buildPriceMap(prices) }));
    } catch {
      toast.error("Failed to refresh route prices");
    }
  };

  const handlePriceChange = (carTypeId: string, value: string) => {
    setForm((prev) => ({ ...prev, prices: { ...prev.prices, [carTypeId]: value } }));
  };

  const handleSave = async () => {
    if (!form.fromLocationId || !form.toLocationId) { toast.error("Select both locations"); return; }
    if (form.fromLocationId === form.toLocationId) { toast.error("From and To must be different"); return; }

    setSaving(true);
    try {
      let routeId = editing?.id;

      if (editing) {
        await api.put(`/routes/${editing.id}`, {
          fromLocationId: form.fromLocationId,
          toLocationId: form.toLocationId,
          isActive: form.isActive,
        });
      } else {
        const newRoute = await api.post<Route>("/routes", {
          fromLocationId: form.fromLocationId,
          toLocationId: form.toLocationId,
        });
        routeId = newRoute.id;
      }

      // Save prices
      const pricesPayload = carTypes
        .filter((ct) => form.prices[ct.id] && parseFloat(form.prices[ct.id]) > 0)
        .map((ct) => ({ carTypeId: ct.id, price: parseFloat(form.prices[ct.id]), currency: "EUR" }));

      if (routeId && pricesPayload.length > 0) {
        await api.post("/route-prices/bulk", { routeId, prices: pricesPayload });
      }

      toast.success(editing ? "Route and prices updated" : "Route created with prices");
      setDialogOpen(false);
      load(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (route: Route) => setDeleteDialog(route);

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await api.del(`/routes/${deleteDialog.id}`);
      toast.success("Route deleted");
      setDeleteDialog(null);
      load(pagination.page);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (route: Route) => {
    try {
      await api.put(`/routes/${route.id}`, { isActive: !route.isActive });
      toast.success(route.isActive ? "Route deactivated" : "Route activated");
      load(pagination.page);
    } catch {
      toast.error("Failed to update");
    }
  };

  const getLocation = (id: string) => locations.find((l) => l.id === id);

  const filteredItems = items.filter((item) => {
    const from = getLocation(item.fromLocationId)?.name || "";
    const to = getLocation(item.toLocationId)?.name || "";
    const fromCity = getLocation(item.fromLocationId)?.city || "";
    const toCity = getLocation(item.toLocationId)?.city || "";
    const q = search.toLowerCase();
    return from.toLowerCase().includes(q) || to.toLowerCase().includes(q) ||
           fromCity.toLowerCase().includes(q) || toCity.toLowerCase().includes(q);
  });

  const getPriceSummary = (route: Route) => {
    const prices = route.routePrices || [];
    const count = prices.length;
    if (count === 0) return <span className="text-muted-foreground text-xs">No prices</span>;
    const min = Math.min(...prices.map((rp) => Number(rp.price)));
    return (
      <div className="flex flex-col">
        <Badge variant="outline" className="w-fit rounded-full px-2.5 text-xs border-gold/20 text-gold bg-gold/5">
          {count} car{count > 1 ? "s" : ""}
        </Badge>
        <span className="text-xs text-muted-foreground mt-0.5">from €{min.toFixed(2)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Routes & Prices</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage transfer routes and set vehicle prices in one place</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 w-fit">
          <IconPlus className="mr-2 h-4 w-4" /> Add Route
        </Button>
      </div>

      {/* Search */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by location or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Route</TableHead>
                  <TableHead className="font-semibold">Prices</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-32 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      {search ? "No routes match your search" : "No routes found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/5 shrink-0">
                            <IconRoute className="h-4 w-4 text-navy" />
                          </div>
                          <div>
                            <div className="font-medium text-sm sm:text-base">
                              {getLocation(item.fromLocationId)?.name || "—"}
                              <span className="text-gold mx-1.5">→</span>
                              {getLocation(item.toLocationId)?.name || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getLocation(item.fromLocationId)?.city} → {getLocation(item.toLocationId)?.city}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getPriceSummary(item)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.isActive ? "default" : "secondary"}
                          className={`rounded-full px-2.5 text-xs cursor-pointer ${
                            item.isActive
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => toggleActive(item)}
                        >
                          {item.isActive ? (
                            <span className="flex items-center gap-1"><IconCheck className="h-3 w-3" /> Active</span>
                          ) : (
                            <span className="flex items-center gap-1"><IconX className="h-3 w-3" /> Inactive</span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Edit route & prices">
                            <IconPencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(item)} className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {items.length} of {pagination.total} routes
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => load(pagination.page - 1)} disabled={pagination.page === 1}>
              <IconArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">Page {pagination.page} of {pagination.pages}</span>
            <Button variant="outline" size="sm" onClick={() => load(pagination.page + 1)} disabled={pagination.page === pagination.pages}>
              <IconArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconRoute className="h-5 w-5 text-navy" />
              {editing ? "Edit Route & Prices" : "Add Route & Prices"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update route details and vehicle prices together."
                : "Create a new route and set prices for available vehicles."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Route Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Route Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <IconMapPin className="h-3.5 w-3.5" /> From Location
                  </Label>
                  <select
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.fromLocationId}
                    onChange={(e) => setForm({ ...form, fromLocationId: e.target.value })}
                  >
                    <option value="">Select pickup location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <IconMapPin className="h-3.5 w-3.5" /> To Location
                  </Label>
                  <select
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.toLocationId}
                    onChange={(e) => setForm({ ...form, toLocationId: e.target.value })}
                  >
                    <option value="">Select drop-off location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              {editing && (
                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Active Route</Label>
                    <p className="text-xs text-muted-foreground">Inactive routes are hidden from customers</p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                  />
                </div>
              )}
            </div>

            {/* Prices */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <IconCoinEuro className="h-4 w-4" /> Vehicle Prices
                </h3>
                <span className="text-xs text-muted-foreground">Leave blank to skip a vehicle</span>
              </div>

              {carTypes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  <IconCar className="mx-auto h-6 w-6 mb-2 text-muted-foreground" />
                  No car types found. Create car types first.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {carTypes.map((ct) => (
                    <div
                      key={ct.id}
                      className="flex items-center gap-3 rounded-xl border border-border/50 bg-white p-3 transition-colors hover:border-gold/40"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10 shrink-0 overflow-hidden">
                        {ct.image ? (
                          <img src={ct.image} alt={ct.name} className="h-full w-full object-cover" />
                        ) : (
                          <IconCar className="h-6 w-6 text-gold" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ct.name}</p>
                        <p className="text-xs text-muted-foreground">{ct.seats} seats</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-muted-foreground">€</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={form.prices[ct.id] || ""}
                          onChange={(e) => handlePriceChange(ct.id, e.target.value)}
                          className="w-24 text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
              {saving ? "Saving..." : editing ? "Update Route & Prices" : "Create Route & Prices"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={(o) => !o && setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <IconAlertTriangle className="h-5 w-5" /> Delete Route
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the route from{" "}
              <strong>{getLocation(deleteDialog?.fromLocationId || "")?.name}</strong> to{" "}
              <strong>{getLocation(deleteDialog?.toLocationId || "")?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Route"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
