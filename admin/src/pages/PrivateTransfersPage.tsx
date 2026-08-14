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
import type { PrivateTransferCity, PrivateTransferEnquiry, Pagination } from "@/lib/types";
import { Plus, Pencil, Trash2, MapPin, Car, Users, Mail, Phone, Calendar, Clock, RefreshCw, MessageSquare } from "lucide-react";

type RouteRow = { description: string; sedanPrice: string; minivanPrice: string };

const emptyForm = {
  name: "",
  slug: "",
  coverImage: "",
};

export default function PrivateTransfersPage() {
  const [activeTab, setActiveTab] = useState<"enquiries" | "cities">("enquiries");

  // Cities state
  const [items, setItems] = useState<PrivateTransferCity[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PrivateTransferCity | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [routeRows, setRouteRows] = useState<RouteRow[]>([]);
  const [saving, setSaving] = useState(false);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<PrivateTransferEnquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<PrivateTransferEnquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCities = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: PrivateTransferCity[]; pagination: Pagination }>(`/private-transfers?page=${page}&limit=20`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load transfer cities");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEnquiries = useCallback(async () => {
    setLoadingEnquiries(true);
    try {
      const data = await api.get<PrivateTransferEnquiry[]>("/private-transfers/enquiries");
      setEnquiries(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load customer transfer enquiries");
    } finally {
      setLoadingEnquiries(false);
    }
  }, []);

  useEffect(() => {
    loadCities();
    loadEnquiries();
  }, [loadCities, loadEnquiries]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setRouteRows([]);
    setDialogOpen(true);
  };

  const openEdit = (item: PrivateTransferCity) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      coverImage: item.coverImage || "",
    });
    setRouteRows(
      (item.routes || []).map((r) => ({
        description: r.description,
        sedanPrice: r.sedanPrice.toString(),
        minivanPrice: r.minivanPrice.toString(),
      }))
    );
    setDialogOpen(true);
  };

  const addRouteRow = () => {
    setRouteRows((rows) => [...rows, { description: "", sedanPrice: "", minivanPrice: "" }]);
  };

  const updateRouteRow = (index: number, patch: Partial<RouteRow>) => {
    setRouteRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const removeRouteRow = (index: number) => {
    setRouteRows((rows) => rows.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        coverImage: form.coverImage || null,
        routes: routeRows
          .filter((r) => r.description && r.sedanPrice !== "" && r.minivanPrice !== "")
          .map((r, i) => ({
            description: r.description,
            sedanPrice: parseFloat(r.sedanPrice),
            minivanPrice: parseFloat(r.minivanPrice),
            currency: "GBP",
            order: i,
          })),
      };
      if (editing) {
        await api.put(`/private-transfers/${editing.id}`, payload);
        toast.success("City updated");
      } else {
        await api.post("/private-transfers", payload);
        toast.success("City created");
      }
      setDialogOpen(false);
      loadCities(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this city and all its routes?")) return;
    try {
      await api.del(`/private-transfers/${id}`);
      toast.success("City deleted");
      loadCities(pagination.page);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      (e.customerName && e.customerName.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.phone && e.phone.toLowerCase().includes(q)) ||
      (e.cityName && e.cityName.toLowerCase().includes(q)) ||
      (e.routeDescription && e.routeDescription.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Private Transfers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage customer transfer requests, cities, routes & vehicle rates
          </p>
        </div>
        {activeTab === "cities" && (
          <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
            <Plus className="mr-2 h-4 w-4" /> Add City
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex gap-2 bg-muted p-1 rounded-xl">
          <Button
            variant={activeTab === "enquiries" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("enquiries")}
            className={activeTab === "enquiries" ? "bg-[#1B2A4A] text-white font-bold" : "text-muted-foreground"}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Customer Enquiries
            {enquiries.length > 0 && (
              <Badge className="ml-2 bg-[#C9A227] text-navy font-bold text-[10px] px-1.5 py-0.2">
                {enquiries.length}
              </Badge>
            )}
          </Button>

          <Button
            variant={activeTab === "cities" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("cities")}
            className={activeTab === "cities" ? "bg-[#1B2A4A] text-white font-bold" : "text-muted-foreground"}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Transfer Cities & Rates
          </Button>
        </div>

        {activeTab === "enquiries" && (
          <Button variant="outline" size="sm" onClick={loadEnquiries} disabled={loadingEnquiries}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loadingEnquiries ? "animate-spin" : ""}`} /> Refresh
          </Button>
        )}
      </div>

      {/* TAB 1: CUSTOMER ENQUIRIES */}
      {activeTab === "enquiries" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search enquiries by name, email, phone or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md bg-white"
            />
            {searchQuery && (
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                Clear
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>City & Route</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Quoted Price</TableHead>
                    <TableHead>Pickup Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingEnquiries ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredEnquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        {searchQuery ? "No matching transfer enquiries found." : "No customer transfer enquiries received yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEnquiries.map((e) => (
                      <TableRow key={e.id} className="hover:bg-slate-50">
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-bold text-sm text-[#1B2A4A]">{e.customerName}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <a href={`tel:${e.phone}`} className="flex items-center gap-1 hover:text-[#C9A227]">
                                <Phone className="h-3 w-3 text-slate-400" /> {e.phone}
                              </a>
                              <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-[#C9A227]">
                                <Mail className="h-3 w-3 text-slate-400" /> {e.email}
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5 max-w-xs">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#C9A227]">
                              <MapPin className="h-3 w-3" /> {e.cityName}
                            </span>
                            <p className="text-xs text-slate-700 font-semibold truncate">{e.routeDescription}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              e.vehicleType === "minivan"
                                ? "bg-amber-50 text-amber-700 border-amber-200 font-bold"
                                : "bg-slate-50 text-slate-700 border-slate-200 font-bold"
                            }
                          >
                            {e.vehicleType === "minivan" ? (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" /> Minivan
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Car className="h-3 w-3" /> Sedan
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-extrabold text-[#1B2A4A] text-sm">
                            £{e.price} <span className="text-xs text-muted-foreground">{e.currency || "GBP"}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {e.pickupDate || e.pickupTime ? (
                            <div className="space-y-0.5">
                              {e.pickupDate && (
                                <span className="flex items-center gap-1 font-medium">
                                  <Calendar className="h-3 w-3 text-slate-400" /> {e.pickupDate}
                                </span>
                              )}
                              {e.pickupTime && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3 text-slate-400" /> {e.pickupTime}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-800 border-0 font-bold text-[10px] uppercase">
                            {e.status || "PENDING"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedEnquiry(e)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: CITIES & TRANSFER RATES */}
      {activeTab === "cities" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Routes</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No cities found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const firstRoute = item.routes?.[0];
                    const minPrice = item.routes?.reduce((min, r) => Math.min(min, Number(r.sedanPrice)), Infinity);
                    const maxPrice = item.routes?.reduce((max, r) => Math.max(max, Number(r.minivanPrice)), 0);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.coverImage ? (
                            <img src={item.coverImage} alt={item.name} className="h-10 w-14 rounded object-cover" />
                          ) : (
                            <div className="h-10 w-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              No img
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#C9A227]" />
                            {item.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.slug}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.routes?.length || 0} routes</Badge>
                        </TableCell>
                        <TableCell>
                          {firstRoute ? (
                            <span className="text-sm">
                              <span className="font-semibold">£{minPrice}</span> – <span className="font-semibold">£{maxPrice}</span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination for Cities */}
      {activeTab === "cities" && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <Button
              key={i}
              variant={pagination.page === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => loadCities(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {/* View Enquiry Details Modal */}
      {selectedEnquiry && (
        <Dialog open={Boolean(selectedEnquiry)} onOpenChange={() => setSelectedEnquiry(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#C9A227]" /> Enquiry Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-[#C9A227] text-navy font-bold">{selectedEnquiry.cityName}</Badge>
                    <p className="font-extrabold text-base text-[#1B2A4A] mt-1">{selectedEnquiry.routeDescription}</p>
                  </div>
                  <span className="font-black text-lg text-[#1B2A4A]">£{selectedEnquiry.price} GBP</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold pt-1">
                  <span className="capitalize px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Vehicle: {selectedEnquiry.vehicleType}
                  </span>
                  {selectedEnquiry.pickupDate && (
                    <span className="px-2 py-0.5 rounded bg-slate-200">
                      Date: {selectedEnquiry.pickupDate} {selectedEnquiry.pickupTime || ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Customer Contact</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Name:</span>
                    <span className="font-bold text-[#1B2A4A] text-sm">{selectedEnquiry.customerName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Phone:</span>
                    <a href={`tel:${selectedEnquiry.phone}`} className="font-bold text-blue-600 hover:underline">
                      {selectedEnquiry.phone}
                    </a>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">Email:</span>
                    <a href={`mailto:${selectedEnquiry.email}`} className="font-bold text-blue-600 hover:underline">
                      {selectedEnquiry.email}
                    </a>
                  </div>
                </div>
              </div>

              {selectedEnquiry.notes && (
                <div className="space-y-1 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Flight & Notes</h4>
                  <div className="p-3 bg-slate-100 rounded-lg text-xs font-medium text-slate-800">
                    {selectedEnquiry.notes}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 flex sm:justify-between items-center gap-2 border-t pt-3">
              <a
                href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Contact on WhatsApp
              </a>
              <Button onClick={() => setSelectedEnquiry(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit/Create City Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit City" : "Add City"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. London" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. london" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} />
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Transfer Routes (Sedan & Minivan Prices)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRouteRow}>
                  <Plus className="mr-1 h-3 w-3" /> Add Route
                </Button>
              </div>
              {routeRows.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No routes added yet. Click "Add Route" to begin.</p>
              )}
              {routeRows.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_100px_100px_32px] gap-2 items-center">
                  <Input
                    placeholder="Route description (e.g. Heathrow Airport – Central London Hotel)"
                    value={row.description}
                    onChange={(e) => updateRouteRow(i, { description: e.target.value })}
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Sedan £</span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Sedan"
                      value={row.sedanPrice}
                      onChange={(e) => updateRouteRow(i, { sedanPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Minivan £</span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Minivan"
                      value={row.minivanPrice}
                      onChange={(e) => updateRouteRow(i, { minivanPrice: e.target.value })}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRouteRow(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
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

