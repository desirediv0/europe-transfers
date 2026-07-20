import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Route, Location, Pagination } from "@/lib/types";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default function RoutesPage() {
  const [items, setItems] = useState<Route[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ fromLocationId: "", toLocationId: "" });
  const [saving, setSaving] = useState(false);

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

  useEffect(() => { load(); loadLocations(); }, [load, loadLocations]);

  const openCreate = () => { setForm({ fromLocationId: "", toLocationId: "" }); setDialogOpen(true); };

  const handleCreate = async () => {
    if (!form.fromLocationId || !form.toLocationId) { toast.error("Select both locations"); return; }
    if (form.fromLocationId === form.toLocationId) { toast.error("From and To must be different"); return; }
    setSaving(true);
    try {
      await api.post("/routes", form);
      toast.success("Route created");
      setDialogOpen(false);
      load(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this route?")) return;
    try {
      await api.del(`/routes/${id}`);
      toast.success("Route deleted");
      load(pagination.page);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const getLocationName = (id: string) => locations.find((l) => l.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Routes</h1>
        <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
          <Plus className="mr-2 h-4 w-4" /> Add Route
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Cars</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No routes found</TableCell></TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.fromLocation?.name || getLocationName(item.fromLocationId)}</TableCell>
                    <TableCell>{item.toLocation?.name || getLocationName(item.toLocationId)}</TableCell>
                    <TableCell><Badge variant="outline">{item.routePrices?.length || 0} cars</Badge></TableCell>
                    <TableCell><Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(item)}>
                          {item.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <Button key={i} variant={pagination.page === i + 1 ? "default" : "outline"} size="sm" onClick={() => load(i + 1)}>
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Location</label>
              <select
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.fromLocationId}
                onChange={(e) => setForm({ ...form, fromLocationId: e.target.value })}
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To Location</label>
              <select
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.toLocationId}
                onChange={(e) => setForm({ ...form, toLocationId: e.target.value })}
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Creating..." : "Create Route"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
