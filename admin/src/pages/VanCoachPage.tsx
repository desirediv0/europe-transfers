import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ImageUpload } from "@/components/ImageUpload";
import type { VanCoachVehicle, VanCoachRoutePrice, VanCoachPriceGroup, VanCoachEnquiry, Pagination } from "@/lib/types";
import { Plus, Pencil, Trash2, Users, RefreshCw, Mail, Phone } from "lucide-react";

const GROUP_LABELS: Record<VanCoachPriceGroup, string> = {
  AIRPORT_TRANSFER: "Airport Transfers",
  POINT_TO_POINT: "Point-to-Point Transfers",
  TOUR_PACKAGE: "Local Classic Tour Packages",
};

type PriceRow = { group: VanCoachPriceGroup; label: string; price: string };

const emptyForm = {
  name: "",
  seats: "",
  image: "",
  category: "",
  description: "",
  rate8h: "",
  rate10h: "",
  overtimeRate: "",
  currency: "USD",
  showOnHomepage: false,
};

export default function VanCoachPage() {
  const [items, setItems] = useState<VanCoachVehicle[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VanCoachVehicle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [priceRows, setPriceRows] = useState<PriceRow[]>([]);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<"vehicles" | "enquiries">("vehicles");
  const [enquiries, setEnquiries] = useState<VanCoachEnquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<VanCoachEnquiry | null>(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: VanCoachVehicle[]; pagination: Pagination }>(`/van-coach?page=${page}&limit=20`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load Van & Coach vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEnquiries = useCallback(async () => {
    setLoadingEnquiries(true);
    try {
      const data = await api.get<VanCoachEnquiry[]>("/van-coach/enquiries");
      setEnquiries(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load Van & Coach enquiries");
    } finally {
      setLoadingEnquiries(false);
    }
  }, []);

  useEffect(() => { load(); loadEnquiries(); }, [load, loadEnquiries]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPriceRows([]);
    setDialogOpen(true);
  };

  const openEdit = (item: VanCoachVehicle) => {
    setEditing(item);
    setForm({
      name: item.name,
      seats: item.seats.toString(),
      image: item.image || "",
      category: item.category || "",
      description: item.description || "",
      rate8h: item.rate8h.toString(),
      rate10h: item.rate10h.toString(),
      overtimeRate: item.overtimeRate.toString(),
      currency: item.currency,
      showOnHomepage: item.showOnHomepage,
    });
    setPriceRows(
      (item.routePrices || []).map((rp) => ({ group: rp.group, label: rp.label, price: rp.price.toString() }))
    );
    setDialogOpen(true);
  };

  const addPriceRow = (group: VanCoachPriceGroup) => {
    setPriceRows((rows) => [...rows, { group, label: "", price: "" }]);
  };

  const updatePriceRow = (index: number, patch: Partial<PriceRow>) => {
    setPriceRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const removePriceRow = (index: number) => {
    setPriceRows((rows) => rows.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name || !form.seats || !form.rate8h || !form.rate10h || !form.overtimeRate) {
      toast.error("Name, seats, and 8h/10h/overtime rates are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        seats: parseInt(form.seats),
        image: form.image || null,
        category: form.category || null,
        description: form.description || null,
        rate8h: parseFloat(form.rate8h),
        rate10h: parseFloat(form.rate10h),
        overtimeRate: parseFloat(form.overtimeRate),
        currency: form.currency || "USD",
        showOnHomepage: form.showOnHomepage,
        routePrices: priceRows
          .filter((r) => r.label && r.price !== "")
          .map((r, i) => ({ group: r.group, label: r.label, price: parseFloat(r.price), order: i })),
      };
      if (editing) {
        await api.put(`/van-coach/${editing.id}`, payload);
        toast.success("Vehicle updated");
      } else {
        await api.post("/van-coach", payload);
        toast.success("Vehicle created");
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
    if (!confirm("Delete this Van & Coach vehicle?")) return;
    try {
      await api.del(`/van-coach/${id}`);
      toast.success("Vehicle deleted");
      load(pagination.page);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Van & Coach</h1>
        {activeTab === "vehicles" ? (
          <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={loadEnquiries} disabled={loadingEnquiries}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loadingEnquiries ? "animate-spin" : ""}`} /> Refresh
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b">
        <Button
          variant="ghost"
          onClick={() => setActiveTab("vehicles")}
          className={`rounded-none border-b-2 ${activeTab === "vehicles" ? "border-[#1B2A4A] font-bold" : "border-transparent text-muted-foreground"}`}
        >
          Vehicles
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("enquiries")}
          className={`rounded-none border-b-2 ${activeTab === "enquiries" ? "border-[#1B2A4A] font-bold" : "border-transparent text-muted-foreground"}`}
        >
          Enquiries {enquiries.length > 0 && <Badge className="ml-1.5">{enquiries.length}</Badge>}
        </Button>
      </div>

      {activeTab === "vehicles" && (
      <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>8h Rate</TableHead>
                <TableHead>10h Rate</TableHead>
                <TableHead>Overtime/hr</TableHead>
                <TableHead>Prices</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No Van & Coach vehicles found</TableCell></TableRow>
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
                    <TableCell><span className="flex items-center gap-1"><Users className="h-3 w-3" />{item.seats}</span></TableCell>
                    <TableCell>{item.currency} {item.rate8h}</TableCell>
                    <TableCell>{item.currency} {item.rate10h}</TableCell>
                    <TableCell>{item.currency} {item.overtimeRate}</TableCell>
                    <TableCell><Badge variant="outline">{item.routePrices?.length || 0} prices</Badge></TableCell>
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
      </>
      )}

      {activeTab === "enquiries" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingEnquiries ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
                  ))
                ) : enquiries.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No Van & Coach enquiries received yet.</TableCell></TableRow>
                ) : (
                  enquiries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.vehicleName}</TableCell>
                      <TableCell>{e.location}</TableCell>
                      <TableCell>{e.hours}h</TableCell>
                      <TableCell className="font-bold">{e.rate}</TableCell>
                      <TableCell>{e.customerName}</TableCell>
                      <TableCell className="text-xs">{e.email}</TableCell>
                      <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setSelectedEnquiry(e)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedEnquiry && (
        <Dialog open={Boolean(selectedEnquiry)} onOpenChange={() => setSelectedEnquiry(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Enquiry Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold">{selectedEnquiry.vehicleName}</span>
                <span className="font-black text-lg">{selectedEnquiry.rate}</span>
              </div>
              <p className="text-muted-foreground">{selectedEnquiry.location} · {selectedEnquiry.hours} hours</p>
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> {selectedEnquiry.customerName}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> <a href={`tel:${selectedEnquiry.phone}`} className="text-blue-600 hover:underline">{selectedEnquiry.phone}</a></div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> <a href={`mailto:${selectedEnquiry.email}`} className="text-blue-600 hover:underline">{selectedEnquiry.email}</a></div>
              </div>
              {selectedEnquiry.pickupAddress && (
                <div className="border-t pt-3">
                  <p className="text-xs font-bold text-muted-foreground mb-1">Pickup Address</p>
                  <p>{selectedEnquiry.pickupAddress}</p>
                </div>
              )}
              {selectedEnquiry.notes && (
                <div className="border-t pt-3">
                  <p className="text-xs font-bold text-muted-foreground mb-1">Notes</p>
                  <p>{selectedEnquiry.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedEnquiry(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              A Van & Coach vehicle is one you offer for hourly disposal (a chauffeur + vehicle booked by the hour, not a fixed point-to-point route).
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Alphard" />
                <p className="text-xs text-muted-foreground">The vehicle's model name, e.g. "Toyota Alphard", "Mercedes Sprinter".</p>
              </div>
              <div className="space-y-2">
                <Label>Seats</Label>
                <Input type="number" min="1" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} placeholder="e.g. 6" />
                <p className="text-xs text-muted-foreground">Passenger capacity, e.g. 6 for a minivan, 16 for a coach.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Luxury Minivan" />
                <p className="text-xs text-muted-foreground">A short label shown as a badge, e.g. "Luxury Minivan", "Executive Coach".</p>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="USD" />
                <p className="text-xs text-muted-foreground">3-letter currency code for the hourly rates below, e.g. USD, EUR.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
              <p className="text-xs text-muted-foreground">A photo of this exact vehicle, shown to customers on the Van & Coach page.</p>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
              <p className="text-xs text-muted-foreground">One line customers see under the vehicle name, e.g. "Spacious minivan ideal for families or small groups".</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
              <div className="space-y-0.5">
                <Label className="text-sm">Show on Homepage</Label>
                <p className="text-xs text-muted-foreground">Feature this vehicle in the homepage&apos;s Featured Van & Coach section</p>
              </div>
              <Switch checked={form.showOnHomepage} onCheckedChange={(v) => setForm({ ...form, showOnHomepage: v })} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>8 Hours Rate</Label>
                <Input type="number" min="0" value={form.rate8h} onChange={(e) => setForm({ ...form, rate8h: e.target.value })} />
                <p className="text-xs text-muted-foreground">Total price for an 8-hour booking, e.g. 500.</p>
              </div>
              <div className="space-y-2">
                <Label>10 Hours Rate</Label>
                <Input type="number" min="0" value={form.rate10h} onChange={(e) => setForm({ ...form, rate10h: e.target.value })} />
                <p className="text-xs text-muted-foreground">Total price for a 10-hour booking, e.g. 600.</p>
              </div>
              <div className="space-y-2">
                <Label>Overtime Fee (per hour)</Label>
                <Input type="number" min="0" value={form.overtimeRate} onChange={(e) => setForm({ ...form, overtimeRate: e.target.value })} />
                <p className="text-xs text-muted-foreground">Extra charge per hour if the customer runs over their booked time.</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label>Route & Package Prices</Label>
              <p className="text-xs text-muted-foreground -mt-1">Optional — add fixed prices for common airport transfers, point-to-point rides, or tour packages this vehicle can also do. Skip this if the vehicle is hourly-only.</p>
              {(Object.keys(GROUP_LABELS) as VanCoachPriceGroup[]).map((group) => (
                <div key={group} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{GROUP_LABELS[group]}</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => addPriceRow(group)}>
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </Button>
                  </div>
                  {priceRows.map((row, i) =>
                    row.group === group ? (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          placeholder="e.g. Haneda Airport to Tokyo City"
                          value={row.label}
                          onChange={(e) => updatePriceRow(i, { label: e.target.value })}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min="0"
                          placeholder="Price"
                          value={row.price}
                          onChange={(e) => updatePriceRow(i, { price: e.target.value })}
                          className="w-28"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removePriceRow(i)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : null
                  )}
                </div>
              ))}
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
