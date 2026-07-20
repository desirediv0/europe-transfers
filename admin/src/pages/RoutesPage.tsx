import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Route, Location, Pagination } from "@/lib/types";
import { Plus, Trash2, Pencil, Search, ArrowLeft, ArrowRight } from "lucide-react";

export default function RoutesPage() {
  const [items, setItems] = useState<Route[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const [form, setForm] = useState({ fromLocationId: "", toLocationId: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

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

  const openCreate = () => {
    setEditing(null);
    setForm({ fromLocationId: "", toLocationId: "" });
    setDialogOpen(true);
  };

  const openEdit = (route: Route) => {
    setEditing(route);
    setForm({ fromLocationId: route.fromLocationId, toLocationId: route.toLocationId });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.fromLocationId || !form.toLocationId) { toast.error("Select both locations"); return; }
    if (form.fromLocationId === form.toLocationId) { toast.error("From and To must be different"); return; }

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/routes/${editing.id}`, { ...form });
        toast.success("Route updated");
      } else {
        await api.post("/routes", form);
        toast.success("Route created");
      }
      setDialogOpen(false);
      load(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
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
    if (!confirm("Delete this route? This cannot be undone.")) return;
    try {
      await api.del(`/routes/${id}`);
      toast.success("Route deleted");
      load(pagination.page);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const getLocationName = (id: string) => locations.find((l) => l.id === id);

  const filteredItems = items.filter((item) => {
    const from = getLocationName(item.fromLocationId)?.name || "";
    const to = getLocationName(item.toLocationId)?.name || "";
    return from.toLowerCase().includes(search.toLowerCase()) || to.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Routes</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage transfer routes between locations</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 w-fit">
          <Plus className="mr-2 h-4 w-4" /> Add Route
        </Button>
      </div>

      {/* Search */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search routes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                  <TableHead className="font-semibold">From</TableHead>
                  <TableHead className="font-semibold">To</TableHead>
                  <TableHead className="font-semibold">Cars</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-32 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      {search ? "No routes match your search" : "No routes found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{item.fromLocation?.name || getLocationName(item.fromLocationId)?.name || "—"}</span>
                          <span className="text-xs text-muted-foreground">{getLocationName(item.fromLocationId)?.city}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{item.toLocation?.name || getLocationName(item.toLocationId)?.name || "—"}</span>
                          <span className="text-xs text-muted-foreground">{getLocationName(item.toLocationId)?.city}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full px-2.5">
                          {item.routePrices?.length || 0} cars
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => toggleActive(item)}
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                            item.isActive
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Route" : "Add Route"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the route locations."
                : "Create a new route between two locations."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Location</label>
              <select
                className="flex w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                className="flex w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            <Button onClick={handleSave} disabled={saving} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
              {saving ? "Saving..." : editing ? "Update Route" : "Create Route"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
