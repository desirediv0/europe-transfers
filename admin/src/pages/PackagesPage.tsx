import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useData } from "@/context/DataContext";
import { ImageUpload } from "@/components/ImageUpload";
import type { Package, ItineraryDay, Pagination } from "@/lib/types";
import { Plus, Pencil, Trash2, CalendarDays } from "lucide-react";

export default function PackagesPage() {
  const { countries } = useData();
  const [items, setItems] = useState<Package[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", countryId: "", durationDays: 1, coverImage: "", summary: "", priceFrom: 0, isActive: true });
  const [saving, setSaving] = useState(false);

  // Itinerary state
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [itineraryPkg, setItineraryPkg] = useState<Package | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [dayForm, setDayForm] = useState({ dayNumber: 1, title: "", description: "" });

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: Package[]; pagination: Pagination }>(`/packages?page=${page}&limit=20`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load packages"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ title: "", slug: "", countryId: "", durationDays: 1, coverImage: "", summary: "", priceFrom: 0, isActive: true }); setDialogOpen(true); };
  const openEdit = (item: Package) => { setEditing(item); setForm({ title: item.title, slug: item.slug, countryId: item.countryId, durationDays: item.durationDays, coverImage: item.coverImage || "", summary: item.summary || "", priceFrom: Number(item.priceFrom) || 0, isActive: item.isActive }); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { ...form, durationDays: Number(form.durationDays), priceFrom: Number(form.priceFrom) };
      if (editing) { await api.put(`/packages/${editing.id}`, body); toast.success("Package updated"); }
      else { await api.post("/packages", body); toast.success("Package created"); }
      setDialogOpen(false); load(pagination.page);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to save"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    try { await api.del(`/packages/${id}`); toast.success("Package deleted"); load(pagination.page); } catch { toast.error("Failed to delete"); }
  };

  const openItinerary = async (pkg: Package) => {
    setItineraryPkg(pkg);
    try {
      const data = await api.get<ItineraryDay[]>(`/packages/${pkg.id}/itinerary`);
      setDays(data);
    } catch { setDays([]); }
    setDayForm({ dayNumber: days.length + 1, title: "", description: "" });
    setItineraryOpen(true);
  };

  const addDay = async () => {
    if (!itineraryPkg) return;
    try {
      await api.post(`/packages/${itineraryPkg.id}/itinerary`, dayForm);
      toast.success("Day added");
      const data = await api.get<ItineraryDay[]>(`/packages/${itineraryPkg.id}/itinerary`);
      setDays(data);
      setDayForm({ dayNumber: data.length + 1, title: "", description: "" });
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to add day"); }
  };

  const deleteDay = async (dayId: string) => {
    if (!itineraryPkg) return;
    try {
      await api.del(`/packages/${itineraryPkg.id}/itinerary/${dayId}`);
      toast.success("Day removed");
      const data = await api.get<ItineraryDay[]>(`/packages/${itineraryPkg.id}/itinerary`);
      setDays(data);
    } catch { toast.error("Failed to remove day"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Packages</h1>
        <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90"><Plus className="mr-2 h-4 w-4" /> Add Package</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price From</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
              )) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No packages found</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell><Badge variant="outline">{item.slug}</Badge></TableCell>
                  <TableCell>{item.durationDays} days</TableCell>
                  <TableCell>{item.priceFrom ? `€${Number(item.priceFrom).toFixed(2)}` : "—"}</TableCell>
                  <TableCell><Badge variant={item.isActive ? "success" : "secondary"}>{item.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openItinerary(item)}><CalendarDays className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      {/* Package Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Package" : "Add Package"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={form.countryId} onValueChange={(v) => setForm({ ...form, countryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>{countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Duration (days)</Label><Input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Price From (€)</Label><Input type="number" step="0.01" value={form.priceFrom} onChange={(e) => setForm({ ...form, priceFrom: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-2"><Label>Summary</Label><Input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Itinerary Dialog */}
      <Dialog open={itineraryOpen} onOpenChange={setItineraryOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Itinerary — {itineraryPkg?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {days.length > 0 && (
              <div className="space-y-2">
                {days.map((d) => (
                  <div key={d.id} className="flex items-start justify-between rounded-md border p-3">
                    <div>
                      <div className="font-medium">Day {d.dayNumber}: {d.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{d.description}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteDay(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t pt-4 space-y-3">
              <div className="text-sm font-medium">Add Day</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1"><Label>Day #</Label><Input type="number" value={dayForm.dayNumber} onChange={(e) => setDayForm({ ...dayForm, dayNumber: Number(e.target.value) })} /></div>
                <div className="col-span-3 space-y-1"><Label>Title</Label><Input value={dayForm.title} onChange={(e) => setDayForm({ ...dayForm, title: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Description</Label><Input value={dayForm.description} onChange={(e) => setDayForm({ ...dayForm, description: e.target.value })} /></div>
              <Button onClick={addDay} className="w-full" variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Day</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
