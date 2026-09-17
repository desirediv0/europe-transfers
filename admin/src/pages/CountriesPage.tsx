import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useData } from "@/context/DataContext";
import type { Country } from "@/lib/types";
import { Plus, Pencil, Trash2, Globe, ChevronLeft, ChevronRight } from "lucide-react";

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const PAGE_SIZE = 20;

export default function CountriesPage() {
  const { refreshCountries } = useData();
  const [items, setItems] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, pages: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Country | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: Country[]; pagination: Pagination }>(
        `/countries?page=${page}&limit=${PAGE_SIZE}`
      );
      setItems(data.items || []);
      setPagination(data.pagination || { page: 1, limit: PAGE_SIZE, total: 0, pages: 0 });
    } catch {
      toast.error("Failed to load countries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "" });
    setSlugTouched(false);
    setDialogOpen(true);
  };

  const openEdit = (item: Country) => {
    setEditing(item);
    setForm({ name: item.name, slug: item.slug });
    setSlugTouched(true);
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name, slug: form.slug };
      if (editing) {
        await api.put(`/countries/${editing.id}`, payload);
        toast.success("Country updated");
      } else {
        await api.post("/countries", payload);
        toast.success("Country created");
      }
      setDialogOpen(false);
      await refreshCountries();
      load(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Cities and packages under it must be removed first.`)) return;
    try {
      await api.del(`/countries/${id}`);
      toast.success("Country deleted");
      await refreshCountries();
      load(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Countries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Powers the Country dropdown when creating Packages and Cities — add every destination country you operate in here (Europe, UK, Scandinavia, Australia, New Zealand, Japan, etc.).
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
          <Plus className="mr-2 h-4 w-4" /> Add Country
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No countries found. Click "Add Country" to add one.</TableCell></TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" /> {item.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.slug}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.name)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/50">
              <p className="text-xs text-muted-foreground font-medium">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => load(pagination.page - 1)}
                  className="h-8 text-xs font-bold"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages || loading}
                  onClick={() => load(pagination.page + 1)}
                  className="h-8 text-xs font-bold"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Country" : "Add Country"}</DialogTitle>
            <DialogDescription>
              A country becomes selectable wherever the platform asks for one — the Country dropdown on Packages, and grouping Cities under it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Japan" />
              <p className="text-xs text-muted-foreground">The country name shown in dropdowns, e.g. "Japan", "New Zealand".</p>
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }); }} placeholder="e.g. japan" />
              <p className="text-xs text-muted-foreground">Auto-filled from the name — lowercase, hyphens instead of spaces, must be unique.</p>
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
