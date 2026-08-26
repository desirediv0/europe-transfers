import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import type { Job, Pagination } from "@/lib/types";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

const emptyForm = { title: "", location: "", type: "Full-time", description: "", isActive: true, order: 0 };

export default function JobsPage() {
  const [items, setItems] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: Job[]; pagination: Pagination }>(`/jobs/admin/all?page=${page}&limit=20`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load jobs"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (item: Job) => {
    setEditing(item);
    setForm({ title: item.title, location: item.location, type: item.type, description: item.description, isActive: item.isActive, order: item.order });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) { await api.put(`/jobs/admin/${editing.id}`, form); toast.success("Job updated"); }
      else { await api.post("/jobs/admin", form); toast.success("Job created"); }
      setDialogOpen(false); load(pagination.page);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to save"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job? All its applications and CVs will be permanently deleted too.")) return;
    try { await api.del(`/jobs/admin/${id}`); toast.success("Job deleted"); load(pagination.page); } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Careers — Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">Job postings shown on theeuropetransfers.com/careers</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90"><Plus className="mr-2 h-4 w-4" /> Add Job</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
              )) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No jobs found</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell><Badge variant={item.isActive ? "success" : "secondary"}>{item.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>
                    <Link to={`/careers/applicants?jobId=${item.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                      <Users className="h-3.5 w-3.5" /> {item._count?.applications ?? 0}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Job" : "Add Job"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Paris, France" /></div>
              <div className="space-y-2"><Label>Type</Label><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. Full-time" /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-2 pb-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
                <Label>Active (visible on website)</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.location || !form.type || !form.description}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
