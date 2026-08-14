import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useData } from "@/context/DataContext";
import { ImageUpload, ImageThumbnail } from "@/components/ImageUpload";
import type { Package, ItineraryDay, PackageEnquiry, Pagination } from "@/lib/types";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconCalendar,
  IconMapPin,
  IconClock,
  IconCoinEuro,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconPackage,
  IconPhoto,
  IconMessageDots,
  IconRefresh,
  IconPhone,
  IconMail,
  IconUsers,
} from "@tabler/icons-react";

export default function PackagesPage() {
  const { countries } = useData();
  const [activeTab, setActiveTab] = useState<"enquiries" | "packages">("enquiries");

  // Packages state
  const [items, setItems] = useState<Package[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", countryId: "", durationDays: 1, coverImage: "", summary: "", priceFrom: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<Package | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<PackageEnquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<PackageEnquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Itinerary state
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [itineraryPkg, setItineraryPkg] = useState<Package | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [dayForm, setDayForm] = useState({ dayNumber: 1, title: "", description: "" });

  const loadPackages = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: Package[]; pagination: Pagination }>(`/packages?page=${page}&limit=20`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load tour packages");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEnquiries = useCallback(async () => {
    setLoadingEnquiries(true);
    try {
      const data = await api.get<PackageEnquiry[]>("/packages/enquiries");
      setEnquiries(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load customer tour enquiries");
    } finally {
      setLoadingEnquiries(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
    loadEnquiries();
  }, [loadPackages, loadEnquiries]);

  const openCreate = () => { setEditing(null); setForm({ title: "", slug: "", countryId: "", durationDays: 1, coverImage: "", summary: "", priceFrom: 0, isActive: true }); setDialogOpen(true); };
  const openEdit = (item: Package) => { setEditing(item); setForm({ title: item.title, slug: item.slug, countryId: item.countryId, durationDays: item.durationDays, coverImage: item.coverImage || "", summary: item.summary || "", priceFrom: Number(item.priceFrom) || 0, isActive: item.isActive }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.countryId || !form.durationDays) {
      toast.error("Title, slug, country, and duration are required");
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, durationDays: Number(form.durationDays), priceFrom: Number(form.priceFrom) };
      if (editing) { await api.put(`/packages/${editing.id}`, body); toast.success("Package updated"); }
      else { await api.post("/packages", body); toast.success("Package created"); }
      setDialogOpen(false); loadPackages(pagination.page);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to save"); } finally { setSaving(false); }
  };

  const confirmDelete = (item: Package) => setDeleteDialog(item);

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await api.del(`/packages/${deleteDialog.id}`);
      toast.success("Package deleted");
      setDeleteDialog(null);
      loadPackages(pagination.page);
    } catch { toast.error("Failed to delete"); } finally { setDeleting(false); }
  };

  const openItinerary = async (pkg: Package) => {
    setItineraryPkg(pkg);
    try {
      const data = await api.get<ItineraryDay[]>(`/packages/${pkg.id}/itinerary`);
      setDays(data);
      setDayForm({ dayNumber: data.length + 1, title: "", description: "" });
    } catch { setDays([]); setDayForm({ dayNumber: 1, title: "", description: "" }); }
    setItineraryOpen(true);
  };

  const addDay = async () => {
    if (!itineraryPkg) return;
    if (!dayForm.title || !dayForm.description) { toast.error("Title and description are required"); return; }
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
      setDayForm({ dayNumber: data.length + 1, title: "", description: "" });
    } catch { toast.error("Failed to remove day"); }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      (e.customerName && e.customerName.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.phone && e.phone.toLowerCase().includes(q)) ||
      (e.packageTitle && e.packageTitle.toLowerCase().includes(q)) ||
      (e.countryName && e.countryName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A]">Tour Packages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage customer package requests, travel itineraries & tour packages
          </p>
        </div>
        {activeTab === "packages" && (
          <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 w-fit">
            <IconPlus className="mr-2 h-4 w-4" /> Add Package
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
            <IconMessageDots className="h-4 w-4 mr-2" />
            Customer Enquiries
            {enquiries.length > 0 && (
              <Badge className="ml-2 bg-[#C9A227] text-navy font-bold text-[10px] px-1.5 py-0.2">
                {enquiries.length}
              </Badge>
            )}
          </Button>

          <Button
            variant={activeTab === "packages" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("packages")}
            className={activeTab === "packages" ? "bg-[#1B2A4A] text-white font-bold" : "text-muted-foreground"}
          >
            <IconPackage className="h-4 w-4 mr-2" />
            Packages & Itineraries
          </Button>
        </div>

        {activeTab === "enquiries" && (
          <Button variant="outline" size="sm" onClick={loadEnquiries} disabled={loadingEnquiries}>
            <IconRefresh className={`h-3.5 w-3.5 mr-1.5 ${loadingEnquiries ? "animate-spin" : ""}`} /> Refresh
          </Button>
        )}
      </div>

      {/* TAB 1: CUSTOMER ENQUIRIES */}
      {activeTab === "enquiries" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search enquiries by name, email, phone, or package title..."
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

          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Package & Destination</TableHead>
                    <TableHead className="font-semibold">Starting Quote</TableHead>
                    <TableHead className="font-semibold">Travel Date & Pax</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="w-28 text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingEnquiries ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredEnquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        {searchQuery ? "No matching package enquiries found." : "No customer tour package enquiries received yet."}
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
                                <IconPhone className="h-3 w-3 text-slate-400" /> {e.phone}
                              </a>
                              <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-[#C9A227]">
                                <IconMail className="h-3 w-3 text-slate-400" /> {e.email}
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5 max-w-xs">
                            <p className="font-bold text-xs text-[#1B2A4A]">{e.packageTitle}</p>
                            {e.countryName && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C9A227]">
                                <IconMapPin className="h-3 w-3" /> {e.countryName}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-extrabold text-[#1B2A4A] text-sm">
                            €{e.priceDisplay || "N/A"} <span className="text-xs text-muted-foreground">/ person</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          <div className="space-y-0.5">
                            {e.travelDate && (
                              <span className="flex items-center gap-1 font-medium">
                                <IconCalendar className="h-3 w-3 text-slate-400" /> {e.travelDate}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <IconUsers className="h-3 w-3 text-slate-400" /> {e.pax || 1} Pax
                            </span>
                          </div>
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

      {/* TAB 2: PACKAGES & ITINERARIES */}
      {activeTab === "packages" && (
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Package</TableHead>
                    <TableHead className="font-semibold">Country</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Price From</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="w-32 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
                  )) : items.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No packages found</TableCell></TableRow>
                  ) : items.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ImageThumbnail src={item.coverImage} alt={item.title} className="h-10 w-10 sm:h-12 sm:w-12" />
                          <div>
                            <p className="font-medium text-sm sm:text-base">{item.title}</p>
                            <Badge variant="outline" className="rounded-full text-xs px-2 py-0.5 mt-0.5">{item.slug}</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <IconMapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.country?.name || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <IconClock className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.durationDays} days
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <IconCoinEuro className="h-3.5 w-3.5 text-gold" />
                          {item.priceFrom ? Number(item.priceFrom).toFixed(2) : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`rounded-full px-2.5 text-xs ${item.isActive
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
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
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Edit package">
                            <IconPencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openItinerary(item)} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Manage itinerary">
                            <IconCalendar className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(item)} className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10" title="Delete package">
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination for Packages */}
      {activeTab === "packages" && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <Button key={i} variant={pagination.page === i + 1 ? "default" : "outline"} size="sm" onClick={() => loadPackages(i + 1)}>{i + 1}</Button>
          ))}
        </div>
      )}

      {/* View Enquiry Details Modal */}
      {selectedEnquiry && (
        <Dialog open={Boolean(selectedEnquiry)} onOpenChange={() => setSelectedEnquiry(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                <IconMessageDots className="h-5 w-5 text-[#C9A227]" /> Package Enquiry Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-[#C9A227] text-navy font-bold">{selectedEnquiry.countryName || "Europe"}</Badge>
                    <p className="font-extrabold text-base text-[#1B2A4A] mt-1">{selectedEnquiry.packageTitle}</p>
                  </div>
                  <span className="font-black text-lg text-[#1B2A4A]">€{selectedEnquiry.priceDisplay} / person</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold pt-1">
                  {selectedEnquiry.travelDate && (
                    <span className="px-2 py-0.5 rounded bg-slate-200">
                      Preferred Date: {selectedEnquiry.travelDate}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Travelers: {selectedEnquiry.pax} Person(s)
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Customer Contact</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Customer Name:</span>
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
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Special Notes & Requests</h4>
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

      {/* Package Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconPackage className="h-5 w-5 text-navy" />
              {editing ? "Edit Package" : "Add Package"}
            </DialogTitle>
            <DialogDescription>
              {editing ? "Update package details and cover image." : "Create a new tour package."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><IconMapPin className="h-3.5 w-3.5" /> Country</Label>
              <Select value={form.countryId} onValueChange={(v) => setForm({ ...form, countryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>{countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Romantic Paris Getaway" /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. romantic-paris-getaway" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label className="flex items-center gap-1.5"><IconClock className="h-3.5 w-3.5" /> Duration (days)</Label><Input type="number" min={1} value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label className="flex items-center gap-1.5"><IconCoinEuro className="h-3.5 w-3.5" /> Price From (€)</Label><Input type="number" step="0.01" min={0} value={form.priceFrom} onChange={(e) => setForm({ ...form, priceFrom: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-2"><Label>Summary</Label><Input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Short description of the package" /></div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><IconPhoto className="h-3.5 w-3.5" /> Cover Image</Label>
              <ImageUpload value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
              <div className="space-y-0.5">
                <Label className="text-sm">Active Package</Label>
                <p className="text-xs text-muted-foreground">Inactive packages are hidden from customers</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
              {saving ? "Saving..." : editing ? "Update Package" : "Create Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={(o) => !o && setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <IconAlertTriangle className="h-5 w-5" /> Delete Package
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteDialog?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Itinerary Dialog */}
      <Dialog open={itineraryOpen} onOpenChange={setItineraryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5 text-navy" />
              Itinerary — {itineraryPkg?.title}
            </DialogTitle>
            <DialogDescription>Add or remove days from this package itinerary.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {days.length > 0 && (
              <div className="space-y-2">
                {days.map((d) => (
                  <div key={d.id} className="flex items-start justify-between rounded-xl border border-border/50 p-4 bg-muted/20">
                    <div>
                      <div className="font-medium">Day {d.dayNumber}: {d.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{d.description}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteDay(d.id)} className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t pt-4 space-y-3">
              <div className="text-sm font-medium">Add Day</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1"><Label>Day #</Label><Input type="number" min={1} value={dayForm.dayNumber} onChange={(e) => setDayForm({ ...dayForm, dayNumber: Number(e.target.value) })} /></div>
                <div className="col-span-3 space-y-1"><Label>Title</Label><Input value={dayForm.title} onChange={(e) => setDayForm({ ...dayForm, title: e.target.value })} placeholder="Day title" /></div>
              </div>
              <div className="space-y-1"><Label>Description</Label><Input value={dayForm.description} onChange={(e) => setDayForm({ ...dayForm, description: e.target.value })} placeholder="What happens on this day?" /></div>
              <Button onClick={addDay} className="w-full" variant="outline"><IconPlus className="mr-2 h-4 w-4" /> Add Day</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

