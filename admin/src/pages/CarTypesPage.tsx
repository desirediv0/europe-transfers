import { useState, useEffect, useCallback } from "react";
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
import { ImageUpload } from "@/components/ImageUpload";
import type { CarType, Pagination } from "@/lib/types";
import { Plus, Pencil, Trash2, Snowflake, Wifi, Luggage, Baby, Crown, PawPrint } from "lucide-react";

export default function CarTypesPage() {
  const [items, setItems] = useState<CarType[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CarType | null>(null);
  const [form, setForm] = useState({ name: "", seats: "", image: "", isAC: true, isWiFi: false, isLuggage: true, isChildSeat: false, isVIP: false, isPetFriendly: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: CarType[]; pagination: Pagination }>(`/car-types?page=${page}&limit=20`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load car types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name: "", seats: "", image: "", isAC: true, isWiFi: false, isLuggage: true, isChildSeat: false, isVIP: false, isPetFriendly: false }); setDialogOpen(true); };
  const openEdit = (item: CarType) => {
    setEditing(item);
    setForm({
      name: item.name, seats: item.seats.toString(), image: item.image || "",
      isAC: item.isAC, isWiFi: item.isWiFi, isLuggage: item.isLuggage,
      isChildSeat: item.isChildSeat, isVIP: item.isVIP, isPetFriendly: item.isPetFriendly
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.seats) { toast.error("Name and seats are required"); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, seats: parseInt(form.seats), image: form.image || null, isAC: form.isAC, isWiFi: form.isWiFi, isLuggage: form.isLuggage, isChildSeat: form.isChildSeat, isVIP: form.isVIP, isPetFriendly: form.isPetFriendly };
      if (editing) {
        await api.put(`/car-types/${editing.id}`, payload);
        toast.success("Car type updated");
      } else {
        await api.post("/car-types", payload);
        toast.success("Car type created");
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
    if (!confirm("Delete this car type?")) return;
    try {
      await api.del(`/car-types/${id}`);
      toast.success("Car type deleted");
      load(pagination.page);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Car Types</h1>
        <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
          <Plus className="mr-2 h-4 w-4" /> Add Car Type
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>AC</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No car types found</TableCell></TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-10 w-14 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">No img</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.seats}</TableCell>
                    <TableCell><Badge variant={item.isAC ? "default" : "secondary"}>{item.isAC ? "AC" : "Non-AC"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {item.isWiFi && <Badge variant="outline" className="text-xs"><Wifi className="mr-1 h-3 w-3" />WiFi</Badge>}
                        {item.isLuggage && <Badge variant="outline" className="text-xs"><Luggage className="mr-1 h-3 w-3" />Luggage</Badge>}
                        {item.isChildSeat && <Badge variant="outline" className="text-xs"><Baby className="mr-1 h-3 w-3" />Child</Badge>}
                        {item.isVIP && <Badge variant="outline" className="text-xs"><Crown className="mr-1 h-3 w-3" />VIP</Badge>}
                        {item.isPetFriendly && <Badge variant="outline" className="text-xs"><PawPrint className="mr-1 h-3 w-3" />Pets</Badge>}
                      </div>
                    </TableCell>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Car Type" : "Add Car Type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sedan" />
            </div>
            <div className="space-y-2">
              <Label>Seats</Label>
              <Input type="number" min="1" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} placeholder="e.g. 3" />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
            </div>
            <div className="space-y-3">
              <Label>Features</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "isAC", label: "Air Conditioned", icon: Snowflake, defaultOn: true },
                  { key: "isWiFi", label: "Free WiFi", icon: Wifi, defaultOn: false },
                  { key: "isLuggage", label: "Luggage Space", icon: Luggage, defaultOn: true },
                  { key: "isChildSeat", label: "Child Seat", icon: Baby, defaultOn: false },
                  { key: "isVIP", label: "VIP Service", icon: Crown, defaultOn: false },
                  { key: "isPetFriendly", label: "Pet Friendly", icon: PawPrint, defaultOn: false },
                ].map(({ key, label, icon: Icon }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all hover:bg-muted/50 ${
                      form[key as keyof typeof form] ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                      form[key as keyof typeof form]
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    }`}>
                      {form[key as keyof typeof form] && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                      className="sr-only"
                    />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
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
