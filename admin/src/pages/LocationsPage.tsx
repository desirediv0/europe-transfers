import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Location, Pagination } from "@/lib/types";
import { MapPicker } from "@/components/MapPicker";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";

interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function LocationsPage() {
  const [items, setItems] = useState<Location[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState({ name: "", city: "", latitude: "", longitude: "" });
  const [saving, setSaving] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: Location[]; pagination: Pagination }>(`/locations?page=${page}&limit=20`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name: "", city: "", latitude: "", longitude: "" }); setPlaceQuery(""); setPlaceResults([]); setDialogOpen(true); };
  const openEdit = (item: Location) => {
    setEditing(item);
    setForm({ name: item.name, city: item.city, latitude: item.latitude?.toString() || "", longitude: item.longitude?.toString() || "" });
    setPlaceQuery("");
    setPlaceResults([]);
    setDialogOpen(true);
  };

  // Free-text place search via OpenStreetMap's Nominatim geocoder - lets an
  // admin type "Barcelona Airport" and jump the map there instead of only
  // clicking/dragging, so the pin lands on the real place on the first try
  // instead of relying on manually copied coordinates (the source of the
  // widespread lat/lng mixups this map replaces).
  const searchPlace = useCallback((query: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!query.trim()) {
      setPlaceResults([]);
      return;
    }
    searchDebounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
        );
        const results: GeocodeResult[] = await res.json();
        setPlaceResults(results);
      } catch {
        setPlaceResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  }, []);

  const selectPlaceResult = (result: GeocodeResult) => {
    setForm((f) => ({ ...f, latitude: parseFloat(result.lat).toString(), longitude: parseFloat(result.lon).toString() }));
    setPlaceResults([]);
    setPlaceQuery(result.display_name);
  };

  const handleSave = async () => {
    if (!form.name || !form.city) { toast.error("Name and city are required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        city: form.city,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      if (editing) {
        await api.put(`/locations/${editing.id}`, payload);
        toast.success("Location updated");
      } else {
        await api.post("/locations", payload);
        toast.success("Location created");
      }
      setDialogOpen(false);
      load(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    try {
      await api.del(`/locations/${id}`);
      toast.success("Location deleted");
      load(pagination.page);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Locations</h1>
          <p className="text-sm text-muted-foreground mt-1">Used by Private Transfers (theeuropetransfers.com/private-transfers)</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
          <Plus className="mr-2 h-4 w-4" /> Add Location
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Lat</TableHead>
                <TableHead>Lng</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No locations found</TableCell></TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.city}</TableCell>
                    <TableCell>{item.latitude?.toFixed(4) || "-"}</TableCell>
                    <TableCell>{item.longitude?.toFixed(4) || "-"}</TableCell>
                    <TableCell><Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Location" : "Add Location"}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              A Location is a specific pickup/drop-off point — an airport, a hotel, a train station, a city center. Routes are built by connecting two Locations together.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rome Fiumicino Airport (FCO)" />
              <p className="text-xs text-muted-foreground">The exact pickup/drop-off point name, e.g. "Rome Fiumicino Airport (FCO)" or "Paris Marriott Champs-Élysées Hotel".</p>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Rome" />
              <p className="text-xs text-muted-foreground">The city this location is in, e.g. "Rome" — used to group and search locations.</p>
            </div>
            <div className="space-y-2">
              <Label>Map Position</Label>
              <p className="text-xs text-muted-foreground -mt-1">
                Search for the place, then fine-tune by clicking the map or dragging the pin — this sets Latitude/Longitude for you, so there's no coordinate to type or copy-paste wrong.
              </p>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={placeQuery}
                    onChange={(e) => { setPlaceQuery(e.target.value); searchPlace(e.target.value); }}
                    placeholder="Search a place, e.g. Barcelona Airport"
                    className="pl-9"
                  />
                  {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                {placeResults.length > 0 && (
                  <div className="absolute z-1100 mt-1 w-full rounded-md border bg-background shadow-md max-h-56 overflow-y-auto">
                    {placeResults.map((r, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectPlaceResult(r)}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b last:border-b-0"
                      >
                        {r.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <MapPicker
                latitude={form.latitude ? parseFloat(form.latitude) : null}
                longitude={form.longitude ? parseFloat(form.longitude) : null}
                onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat.toString(), longitude: lng.toString() }))}
              />
              <p className="text-xs text-muted-foreground">
                {form.latitude && form.longitude
                  ? `Set: ${parseFloat(form.latitude).toFixed(5)}, ${parseFloat(form.longitude).toFixed(5)}`
                  : "Not set yet — search or click the map above."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
