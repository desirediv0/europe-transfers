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
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ImageUpload, ImageThumbnail } from "@/components/ImageUpload";
import { TipTapEditor } from "@/components/TipTapEditor";
import type { SightseeingTour, SightseeingEnquiry } from "@/lib/types";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconCalendar,
  IconMapPin,
  IconClock,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconPhoto,
  IconMessageDots,
  IconRefresh,
  IconPhone,
  IconMail,
  IconUsers,
  IconCompass,
  IconSparkles,
  IconStar,
  IconListCheck,
  IconTicket,
  IconArrowUp,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react";

export default function SightseeingPage() {
  const [activeTab, setActiveTab] = useState<"enquiries" | "tours">("enquiries");

  // Enquiries State
  const [enquiries, setEnquiries] = useState<SightseeingEnquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<SightseeingEnquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Tours State
  const [tours, setTours] = useState<SightseeingTour[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SightseeingTour | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<SightseeingTour | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Tour Form Basic State
  const [form, setForm] = useState({
    title: "",
    slug: "",
    cityName: "Paris",
    countryName: "France",
    duration: "2-3 Hours",
    priceFrom: 87,
    coverImage: "",
    summary: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    isActive: true,
  });

  // Dynamic Lists Sub-State (No JSON Textareas!)
  const [highlightsList, setHighlightsList] = useState<string[]>([]);
  const [newHighlightInput, setNewHighlightInput] = useState("");
  const [editingHighlightIndex, setEditingHighlightIndex] = useState<number | null>(null);
  const [editingHighlightText, setEditingHighlightText] = useState("");

  const [includesList, setIncludesList] = useState<string[]>([]);
  const [newIncludesInput, setNewIncludesInput] = useState("");
  const [editingIncludeIndex, setEditingIncludeIndex] = useState<number | null>(null);
  const [editingIncludeText, setEditingIncludeText] = useState("");

  const [optionsList, setOptionsList] = useState<Array<{ name: string; price: number; duration?: string }>>([]);
  const [newOptName, setNewOptName] = useState("");
  const [newOptPrice, setNewOptPrice] = useState<number | string>(0);
  const [newOptDuration, setNewOptDuration] = useState("");
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [editingOptionData, setEditingOptionData] = useState<{ name: string; price: number; duration?: string }>({ name: "", price: 0, duration: "" });

  const [scheduleList, setScheduleList] = useState<Array<{ type: string; address: string; metro?: string; time?: string }>>([]);
  const [newScheduleType, setNewScheduleType] = useState("Departure");
  const [newScheduleAddress, setNewScheduleAddress] = useState("");
  const [newScheduleMetro, setNewScheduleMetro] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);
  const [editingScheduleData, setEditingScheduleData] = useState<{ type: string; address: string; metro?: string; time?: string }>({ type: "Departure", address: "", metro: "", time: "" });

  const [galleryImagesList, setGalleryImagesList] = useState<string[]>([]);

  // Safe JSON Parsing Helper
  const safeParseJson = (str?: string, fallback: any = []) => {
    if (!str) return fallback;
    try {
      return typeof str === "string" ? JSON.parse(str) : str;
    } catch {
      return fallback;
    }
  };

  const loadEnquiries = useCallback(async () => {
    setLoadingEnquiries(true);
    try {
      const data = await api.get<SightseeingEnquiry[]>("/sightseeing/admin/enquiries");
      setEnquiries(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load customer sightseeing enquiries");
    } finally {
      setLoadingEnquiries(false);
    }
  }, []);

  const loadTours = useCallback(async () => {
    setLoadingTours(true);
    try {
      const data = await api.get<SightseeingTour[]>("/sightseeing?admin=true");
      setTours(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load sightseeing tours");
    } finally {
      setLoadingTours(false);
    }
  }, []);

  useEffect(() => {
    loadEnquiries();
    loadTours();
  }, [loadEnquiries, loadTours]);

  const resetInlineEditStates = () => {
    setEditingHighlightIndex(null);
    setEditingHighlightText("");
    setEditingIncludeIndex(null);
    setEditingIncludeText("");
    setEditingOptionIndex(null);
    setEditingOptionData({ name: "", price: 0, duration: "" });
    setEditingScheduleIndex(null);
    setEditingScheduleData({ type: "Departure", address: "", metro: "", time: "" });
    setNewHighlightInput("");
    setNewIncludesInput("");
    setNewOptName("");
    setNewOptPrice(0);
    setNewOptDuration("");
    setNewScheduleAddress("");
    setNewScheduleMetro("");
    setNewScheduleTime("");
    setNewScheduleType("Departure");
  };

  const openCreate = () => {
    setEditing(null);
    resetInlineEditStates();
    setForm({
      title: "",
      slug: "",
      cityName: "Paris",
      countryName: "France",
      duration: "2-3 Hours",
      priceFrom: 87,
      coverImage: "",
      summary: "",
      description: "",
      seoTitle: "",
      seoDescription: "",
      isActive: true,
    });
    setHighlightsList([]);
    setIncludesList([]);
    setOptionsList([]);
    setScheduleList([]);
    setGalleryImagesList([]);
    setDialogOpen(true);
  };

  const openEdit = (tour: SightseeingTour) => {
    // Always reset ALL inline editing states first before loading new tour data
    resetInlineEditStates();
    setEditing(tour);
    setForm({
      title: tour.title,
      slug: tour.slug,
      cityName: tour.cityName || "Paris",
      countryName: tour.countryName || "France",
      duration: tour.duration,
      priceFrom: Number(tour.priceFrom) || 0,
      coverImage: tour.coverImage || "",
      summary: tour.summary || "",
      description: tour.description || "",
      seoTitle: tour.seoTitle || "",
      seoDescription: tour.seoDescription || "",
      isActive: tour.isActive,
    });

    setHighlightsList(safeParseJson(tour.highlights, []));
    setIncludesList(safeParseJson(tour.includes, []));
    setOptionsList(safeParseJson(tour.options, []));
    setScheduleList(safeParseJson(tour.schedule, []));

    const parsedGallery = safeParseJson(tour.galleryImages, []);
    const initialGallery = Array.isArray(parsedGallery) && parsedGallery.length > 0
      ? parsedGallery
      : (tour.coverImage ? [tour.coverImage] : []);

    setGalleryImagesList(initialGallery);
    setDialogOpen(true);
  };

  // Dynamic Add / Remove / Edit / Reorder Handlers
  const addHighlight = () => {
    if (!newHighlightInput.trim()) return;
    setHighlightsList([...highlightsList, newHighlightInput.trim()]);
    setNewHighlightInput("");
  };
  const removeHighlight = (idx: number) => {
    setHighlightsList(highlightsList.filter((_, i) => i !== idx));
    if (editingHighlightIndex === idx) setEditingHighlightIndex(null);
  };
  const startEditHighlight = (idx: number) => {
    setEditingHighlightIndex(idx);
    setEditingHighlightText(highlightsList[idx]);
  };
  const saveEditHighlight = (idx: number) => {
    if (!editingHighlightText.trim()) return;
    const copy = [...highlightsList];
    copy[idx] = editingHighlightText.trim();
    setHighlightsList(copy);
    setEditingHighlightIndex(null);
    setEditingHighlightText("");
  };
  const moveHighlight = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= highlightsList.length) return;
    const copy = [...highlightsList];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setHighlightsList(copy);
  };

  const addInclude = () => {
    if (!newIncludesInput.trim()) return;
    setIncludesList([...includesList, newIncludesInput.trim()]);
    setNewIncludesInput("");
  };
  const removeInclude = (idx: number) => {
    setIncludesList(includesList.filter((_, i) => i !== idx));
    if (editingIncludeIndex === idx) setEditingIncludeIndex(null);
  };
  const startEditInclude = (idx: number) => {
    setEditingIncludeIndex(idx);
    setEditingIncludeText(includesList[idx]);
  };
  const saveEditInclude = (idx: number) => {
    if (!editingIncludeText.trim()) return;
    const copy = [...includesList];
    copy[idx] = editingIncludeText.trim();
    setIncludesList(copy);
    setEditingIncludeIndex(null);
    setEditingIncludeText("");
  };
  const moveInclude = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= includesList.length) return;
    const copy = [...includesList];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setIncludesList(copy);
  };

  const addOption = () => {
    if (!newOptName.trim()) {
      toast.error("Please enter Option Name");
      return;
    }
    setOptionsList([
      ...optionsList,
      {
        name: newOptName.trim(),
        price: Number(newOptPrice) || 0,
        duration: newOptDuration.trim() || form.duration,
      },
    ]);
    setNewOptName("");
    setNewOptPrice(0);
    setNewOptDuration("");
  };
  const removeOption = (idx: number) => {
    setOptionsList(optionsList.filter((_, i) => i !== idx));
    if (editingOptionIndex === idx) setEditingOptionIndex(null);
  };
  const startEditOption = (idx: number) => {
    setEditingOptionIndex(idx);
    setEditingOptionData({ ...optionsList[idx] });
  };
  const saveEditOption = (idx: number) => {
    if (!editingOptionData.name.trim()) return;
    const copy = [...optionsList];
    copy[idx] = {
      name: editingOptionData.name.trim(),
      price: Number(editingOptionData.price) || 0,
      duration: editingOptionData.duration?.trim() || form.duration,
    };
    setOptionsList(copy);
    setEditingOptionIndex(null);
  };
  const moveOption = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= optionsList.length) return;
    const copy = [...optionsList];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setOptionsList(copy);
  };

  const addScheduleStep = () => {
    if (!newScheduleAddress.trim()) {
      toast.error("Please enter Address/Location for the schedule step");
      return;
    }
    setScheduleList([
      ...scheduleList,
      {
        type: newScheduleType,
        address: newScheduleAddress.trim(),
        metro: newScheduleMetro.trim() || undefined,
        time: newScheduleTime.trim() || undefined,
      },
    ]);
    setNewScheduleAddress("");
    setNewScheduleMetro("");
    setNewScheduleTime("");
  };
  const removeScheduleStep = (idx: number) => {
    setScheduleList(scheduleList.filter((_, i) => i !== idx));
    if (editingScheduleIndex === idx) setEditingScheduleIndex(null);
  };
  const startEditSchedule = (idx: number) => {
    setEditingScheduleIndex(idx);
    setEditingScheduleData({ ...scheduleList[idx] });
  };
  const saveEditSchedule = (idx: number) => {
    if (!editingScheduleData.address.trim()) return;
    const copy = [...scheduleList];
    copy[idx] = {
      type: editingScheduleData.type,
      address: editingScheduleData.address.trim(),
      metro: editingScheduleData.metro?.trim() || undefined,
      time: editingScheduleData.time?.trim() || undefined,
    };
    setScheduleList(copy);
    setEditingScheduleIndex(null);
  };
  const moveSchedule = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= scheduleList.length) return;
    const copy = [...scheduleList];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setScheduleList(copy);
  };

  const handleAddGalleryUrl = (url: string) => {
    if (!url) return;
    if (!galleryImagesList.includes(url)) {
      const updated = [...galleryImagesList, url];
      setGalleryImagesList(updated);
      if (!form.coverImage) setForm({ ...form, coverImage: url });
    }
  };

  const removeGalleryImage = (url: string) => {
    const updated = galleryImagesList.filter((img) => img !== url);
    setGalleryImagesList(updated);
    if (form.coverImage === url) {
      setForm({ ...form, coverImage: updated[0] || "" });
    }
  };

  const setAsPrimaryCover = (url: string) => {
    setForm({ ...form, coverImage: url });
    toast.success("Primary cover image set");
  };

  const moveGalleryImage = (idx: number, dir: "left" | "right") => {
    const targetIdx = dir === "left" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= galleryImagesList.length) return;
    const copy = [...galleryImagesList];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setGalleryImagesList(copy);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.duration) {
      toast.error("Title, slug, and duration are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        cityName: form.cityName,
        countryName: form.countryName,
        duration: form.duration,
        priceFrom: Number(form.priceFrom),
        coverImage: form.coverImage || galleryImagesList[0] || "/images/hero_swiss_alps.png",
        galleryImages: JSON.stringify(galleryImagesList),
        summary: form.summary,
        description: form.description,
        highlights: JSON.stringify(highlightsList),
        includes: JSON.stringify(includesList),
        options: JSON.stringify(optionsList),
        schedule: JSON.stringify(scheduleList),
        seoTitle: form.seoTitle || form.title,
        seoDescription: form.seoDescription || form.summary,
        isActive: form.isActive,
      };

      if (editing) {
        await api.put(`/sightseeing/admin/tours/${editing.id}`, payload);
        toast.success("Sightseeing tour updated");
      } else {
        await api.post("/sightseeing/admin/tours", payload);
        toast.success("Sightseeing tour created");
      }
      setDialogOpen(false);
      loadTours();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save tour");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await api.del(`/sightseeing/admin/tours/${deleteDialog.id}`);
      toast.success("Sightseeing tour deleted");
      setDeleteDialog(null);
      loadTours();
    } catch {
      toast.error("Failed to delete tour");
    } finally {
      setDeleting(false);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      (e.customerName && e.customerName.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.phone && e.phone.toLowerCase().includes(q)) ||
      (e.sightseeingTitle && e.sightseeingTitle.toLowerCase().includes(q)) ||
      (e.cityName && e.cityName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] flex items-center gap-2">
            <IconCompass className="h-6 w-6 text-[#C9A227]" /> Sightseeing Tours & Experiences
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage customer activity requests, ticket options, gallery images & SEO metadata
          </p>
        </div>
        {activeTab === "tours" && (
          <Button onClick={openCreate} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 w-fit font-bold">
            <IconPlus className="mr-2 h-4 w-4" /> Add Sightseeing Activity
          </Button>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-2">
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <Button
            variant={activeTab === "enquiries" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("enquiries")}
            className={`whitespace-nowrap ${activeTab === "enquiries" ? "bg-[#1B2A4A] text-white font-bold" : "text-muted-foreground"}`}
          >
            <IconMessageDots className="h-4 w-4 mr-2" />
            Customer Enquiries
            {enquiries.length > 0 && (
              <Badge className="ml-2 bg-[#C9A227] text-navy font-bold text-[10px] px-1.5">
                {enquiries.length}
              </Badge>
            )}
          </Button>

          <Button
            variant={activeTab === "tours" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("tours")}
            className={`whitespace-nowrap ${activeTab === "tours" ? "bg-[#1B2A4A] text-white font-bold" : "text-muted-foreground"}`}
          >
            <IconCompass className="h-4 w-4 mr-2" />
            Experiences ({tours.length})
          </Button>
        </div>

        {activeTab === "enquiries" && (
          <Button variant="outline" size="sm" onClick={loadEnquiries} disabled={loadingEnquiries} className="flex-shrink-0">
            <IconRefresh className={`h-3.5 w-3.5 mr-1.5 ${loadingEnquiries ? "animate-spin" : ""}`} /> Refresh
          </Button>
        )}
      </div>

      {/* TAB 1: CUSTOMER ENQUIRIES */}
      {activeTab === "enquiries" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by customer name, email, phone, city, or tour title..."
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
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Activity & Option</TableHead>
                    <TableHead className="font-semibold">Quoted Price</TableHead>
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
                        {searchQuery ? "No matching sightseeing enquiries found." : "No customer sightseeing enquiries received yet."}
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
                            <p className="font-bold text-xs text-[#1B2A4A]">{e.sightseeingTitle}</p>
                            {e.optionSelected && (
                              <span className="inline-block text-[11px] font-semibold text-blue-600">
                                Option: {e.optionSelected}
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

      {/* TAB 2: TOURS MANAGEMENT */}
      {activeTab === "tours" && (
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Tour / Activity</TableHead>
                  <TableHead className="font-semibold">City & Country</TableHead>
                  <TableHead className="font-semibold">Duration</TableHead>
                  <TableHead className="font-semibold">Starting Price</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-28 text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTours ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton className="h-5 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : tours.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No sightseeing tours created yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  tours.map((t) => (
                    <TableRow key={t.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ImageThumbnail src={t.coverImage} alt={t.title} className="h-10 w-12 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-sm text-[#1B2A4A]">{t.title}</p>
                            <Badge variant="outline" className="text-[10px] px-2 py-0">{t.slug}</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                          <IconMapPin className="h-3.5 w-3.5 text-[#C9A227]" /> {t.cityName || "Paris"}, {t.countryName || "France"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        <span className="flex items-center gap-1">
                          <IconClock className="h-3.5 w-3.5 text-slate-400" /> {t.duration}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-black text-sm text-[#1B2A4A]">€{Number(t.priceFrom).toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={t.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}>
                          {t.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(t)} title="Edit Tour">
                            <IconPencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteDialog(t)} className="text-destructive" title="Delete Tour">
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View Enquiry Details Modal */}
      {selectedEnquiry && (
        <Dialog open={Boolean(selectedEnquiry)} onOpenChange={() => setSelectedEnquiry(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                <IconMessageDots className="h-5 w-5 text-[#C9A227]" /> Sightseeing Activity Request Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-[#C9A227] text-navy font-bold">{selectedEnquiry.cityName || "Europe"}</Badge>
                    <p className="font-extrabold text-base text-[#1B2A4A] mt-1">{selectedEnquiry.sightseeingTitle}</p>
                    {selectedEnquiry.optionSelected && (
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">Selected Option: {selectedEnquiry.optionSelected}</p>
                    )}
                  </div>
                  <span className="font-black text-lg text-[#1B2A4A]">€{selectedEnquiry.priceDisplay} / person</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold pt-1">
                  {selectedEnquiry.travelDate && (
                    <span className="px-2 py-0.5 rounded bg-slate-200">
                      Activity Date: {selectedEnquiry.travelDate}
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

      {/* Dynamic Add / Edit Sightseeing Activity Modal (No JSON Raw Textareas!) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-[98vw] sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#1B2A4A]">
              <IconCompass className="h-6 w-6 text-[#C9A227]" />
              {editing ? "Edit Sightseeing Activity" : "Create New Sightseeing Activity"}
            </DialogTitle>
            <DialogDescription>
              Add tour title, options, highlights, timeline schedule & gallery images without JSON code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2 text-xs">

            {/* 1. Basic Information */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border">
              <h3 className="font-extrabold text-sm text-[#1B2A4A] flex items-center gap-1.5">
                <IconSparkles className="h-4 w-4 text-[#C9A227]" /> Basic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="font-bold">Activity Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Summit Eiffel Tower Ticket with Audio Guide"
                    className="mt-1 bg-white font-semibold"
                  />
                </div>
                <div>
                  <Label className="font-bold">URL Slug *</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. eiffel-tower-summit-reserved-access"
                    className="mt-1 bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="font-bold">City Name</Label>
                  <Input
                    value={form.cityName}
                    onChange={(e) => setForm({ ...form, cityName: e.target.value })}
                    placeholder="Paris"
                    className="mt-1 bg-white font-semibold"
                  />
                </div>
                <div>
                  <Label className="font-bold">Country Name</Label>
                  <Input
                    value={form.countryName}
                    onChange={(e) => setForm({ ...form, countryName: e.target.value })}
                    placeholder="France"
                    className="mt-1 bg-white font-semibold"
                  />
                </div>
                <div>
                  <Label className="font-bold">Duration *</Label>
                  <Input
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 2 - 3 Hours"
                    className="mt-1 bg-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <Label className="font-bold">Starting Price (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.priceFrom}
                  onChange={(e) => setForm({ ...form, priceFrom: Number(e.target.value) })}
                  className="mt-1 bg-white font-black text-sm max-w-xs"
                />
              </div>

              <div>
                <Label className="font-bold">Summary Overview</Label>
                <Input
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Short 1-2 sentence overview shown on tour cards"
                  className="mt-1 bg-white"
                />
              </div>
            </div>

            {/* 2. Gallery Images & Primary Cover Selection */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#1B2A4A] flex items-center gap-1.5">
                  <IconPhoto className="h-4 w-4 text-[#C9A227]" /> Gallery Images & Primary Cover Selection
                </h3>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {galleryImagesList.length} Images Loaded
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Upload New Image URL</Label>
                <ImageUpload value="" onChange={handleAddGalleryUrl} />
              </div>

              {/* Gallery Thumbnails List with Reordering & Primary Selection */}
              {galleryImagesList.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {galleryImagesList.map((url, idx) => {
                    const isPrimary = form.coverImage === url;
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border-2 bg-white p-2 shadow-sm transition-all flex flex-col justify-between ${
                          isPrimary ? "border-[#C9A227] ring-2 ring-[#C9A227]/30" : "border-gray-200"
                        }`}
                      >
                        <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-100 mb-2">
                          <img src={url} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                          {isPrimary && (
                            <Badge className="absolute top-2 left-2 bg-[#C9A227] text-navy font-black text-[9px] px-2 py-0.5 shadow-md">
                              <IconStar className="h-3 w-3 mr-0.5 fill-navy inline" /> Primary Cover
                            </Badge>
                          )}
                          <Badge variant="secondary" className="absolute bottom-2 right-2 text-[9px] font-bold opacity-80">
                            #{idx + 1}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                          {/* Reorder Left/Right */}
                          <div className="flex items-center gap-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={idx === 0}
                              onClick={() => moveGalleryImage(idx, "left")}
                              className="h-6 w-6 text-slate-600 disabled:opacity-30"
                              title="Move Left"
                            >
                              <IconArrowLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={idx === galleryImagesList.length - 1}
                              onClick={() => moveGalleryImage(idx, "right")}
                              className="h-6 w-6 text-slate-600 disabled:opacity-30"
                              title="Move Right"
                            >
                              <IconArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-1">
                            {!isPrimary && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAsPrimaryCover(url)}
                                className="text-[10px] h-6 px-2 font-extrabold text-[#1B2A4A] border-[#1B2A4A]/20 hover:bg-[#1B2A4A] hover:text-white"
                              >
                                Set Cover
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeGalleryImage(url)}
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              title="Remove Image"
                            >
                              <IconTrash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Full Description with TipTap Rich Text Editor */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border">
              <h3 className="font-extrabold text-sm text-[#1B2A4A]">Full Description (TipTap Rich Text Editor)</h3>
              <TipTapEditor
                value={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
              />
            </div>

            {/* 4. Tour Options Manager (Dynamic Todo List with Edit & Reorder) */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border">
              <h3 className="font-extrabold text-sm text-[#1B2A4A] flex items-center gap-1.5">
                <IconTicket className="h-4 w-4 text-[#C9A227]" /> Tour Ticket Options Manager
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-white p-3 rounded-xl border">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Option Name (e.g. Standard Ticket)..."
                    value={newOptName}
                    onChange={(e) => setNewOptName(e.target.value)}
                    className="h-9 text-xs font-medium"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price (€)"
                    value={newOptPrice}
                    onChange={(e) => setNewOptPrice(e.target.value)}
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Duration (e.g. 2 Hours)"
                    value={newOptDuration}
                    onChange={(e) => setNewOptDuration(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <Button type="button" onClick={addOption} className="h-9 bg-[#1B2A4A] text-white text-xs font-bold">
                  <IconPlus className="h-3.5 w-3.5 mr-1" /> Add Option
                </Button>
              </div>

              {/* List of Added Options */}
              {optionsList.length > 0 && (
                <div className="space-y-2 pt-1">
                  {optionsList.map((opt, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border text-xs shadow-sm transition-all">
                      {editingOptionIndex === idx ? (
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                          <Input
                            value={editingOptionData.name}
                            onChange={(e) => setEditingOptionData({ ...editingOptionData, name: e.target.value })}
                            className="h-8 text-xs font-bold sm:col-span-2"
                            placeholder="Option Name"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            value={editingOptionData.price}
                            onChange={(e) => setEditingOptionData({ ...editingOptionData, price: Number(e.target.value) })}
                            className="h-8 text-xs font-bold"
                            placeholder="Price"
                          />
                          <div className="flex items-center gap-1 justify-end">
                            <Button type="button" size="sm" onClick={() => saveEditOption(idx)} className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 font-bold">
                              <IconCheck className="h-3.5 w-3.5 mr-1" /> Save
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditingOptionIndex(null)} className="h-8 text-xs">
                              <IconX className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-[#1B2A4A] text-sm">{opt.name}</span>
                            <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              €{Number(opt.price).toFixed(2)}
                            </span>
                            {opt.duration && (
                              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                <IconClock className="h-3 w-3 text-[#C9A227]" /> {opt.duration}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={idx === 0}
                              onClick={() => moveOption(idx, "up")}
                              className="h-7 w-7 text-slate-600 disabled:opacity-30"
                              title="Move Up"
                            >
                              <IconArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={idx === optionsList.length - 1}
                              onClick={() => moveOption(idx, "down")}
                              className="h-7 w-7 text-slate-600 disabled:opacity-30"
                              title="Move Down"
                            >
                              <IconArrowDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditOption(idx)}
                              className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                              title="Edit Option"
                            >
                              <IconPencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(idx)}
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              title="Remove Option"
                            >
                              <IconTrash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Highlights (Dynamic Todo List with Edit & Reorder) */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border">
              <h3 className="font-extrabold text-sm text-[#1B2A4A] flex items-center gap-1.5">
                <IconSparkles className="h-4 w-4 text-[#C9A227]" /> Activity Highlights (Todo Bullet Points)
              </h3>

              <div className="flex gap-2 bg-white p-2 rounded-xl border">
                <Input
                  placeholder="Enter a highlight bullet point (e.g. Priority entrance elevator access)..."
                  value={newHighlightInput}
                  onChange={(e) => setNewHighlightInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHighlight(); } }}
                  className="h-9 text-xs flex-1"
                />
                <Button type="button" onClick={addHighlight} className="h-9 bg-[#1B2A4A] text-white text-xs font-bold">
                  <IconPlus className="h-3.5 w-3.5 mr-1" /> Add Highlight
                </Button>
              </div>

              {highlightsList.length > 0 && (
                <div className="space-y-2 pt-1">
                  {highlightsList.map((hl, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border text-xs font-semibold text-slate-800 shadow-sm">
                      {editingHighlightIndex === idx ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingHighlightText}
                            onChange={(e) => setEditingHighlightText(e.target.value)}
                            className="h-8 text-xs font-medium flex-1"
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveEditHighlight(idx); } }}
                          />
                          <Button type="button" size="sm" onClick={() => saveEditHighlight(idx)} className="h-8 bg-emerald-600 text-white text-xs px-3 font-bold">
                            <IconCheck className="h-3.5 w-3.5 mr-1" /> Save
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setEditingHighlightIndex(null)} className="h-8 text-xs">
                            <IconX className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 pr-2 flex-1">
                            <span className="h-2 w-2 rounded-full bg-[#C9A227] flex-shrink-0" />
                            <span>{hl}</span>
                          </span>

                          <div className="flex items-center gap-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={idx === 0}
                              onClick={() => moveHighlight(idx, "up")}
                              className="h-7 w-7 text-slate-600 disabled:opacity-30"
                              title="Move Up"
                            >
                              <IconArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={idx === highlightsList.length - 1}
                              onClick={() => moveHighlight(idx, "down")}
                              className="h-7 w-7 text-slate-600 disabled:opacity-30"
                              title="Move Down"
                            >
                              <IconArrowDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditHighlight(idx)}
                              className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                              title="Edit Highlight"
                            >
                              <IconPencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeHighlight(idx)}
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              title="Remove Highlight"
                            >
                              <IconTrash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. The Price Includes List (Dynamic Todo List with Edit & Reorder) */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border">
              <h3 className="font-extrabold text-sm text-[#1B2A4A] flex items-center gap-1.5">
                <IconListCheck className="h-4 w-4 text-[#C9A227]" /> The Price Includes Items
              </h3>

              <div className="flex gap-2 bg-white p-2 rounded-xl border">
                <Input
                  placeholder="Enter included item (e.g. 3-course dinner, Coffee or Tea)..."
                  value={newIncludesInput}
                  onChange={(e) => setNewIncludesInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInclude(); } }}
                  className="h-9 text-xs flex-1"
                />
                <Button type="button" onClick={addInclude} className="h-9 bg-[#1B2A4A] text-white text-xs font-bold">
                  <IconPlus className="h-3.5 w-3.5 mr-1" /> Add Item
                </Button>
              </div>

              {includesList.length > 0 && (
                <div className="space-y-2 pt-1">
                  {includesList.map((inc, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border text-xs font-medium text-slate-800 shadow-sm">
                      {editingIncludeIndex === idx ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingIncludeText}
                            onChange={(e) => setEditingIncludeText(e.target.value)}
                            className="h-8 text-xs font-medium flex-1"
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveEditInclude(idx); } }}
                          />
                          <Button type="button" size="sm" onClick={() => saveEditInclude(idx)} className="h-8 bg-emerald-600 text-white text-xs px-3 font-bold">
                            <IconCheck className="h-3.5 w-3.5 mr-1" /> Save
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setEditingIncludeIndex(null)} className="h-8 text-xs">
                            <IconX className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 pr-2 flex-1">
                            <IconCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <span>{inc}</span>
                          </span>

                          <div className="flex items-center gap-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={idx === 0}
                              onClick={() => moveInclude(idx, "up")}
                              className="h-7 w-7 text-slate-600 disabled:opacity-30"
                              title="Move Up"
                            >
                              <IconArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={idx === includesList.length - 1}
                              onClick={() => moveInclude(idx, "down")}
                              className="h-7 w-7 text-slate-600 disabled:opacity-30"
                              title="Move Down"
                            >
                              <IconArrowDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditInclude(idx)}
                              className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                              title="Edit Include Item"
                            >
                              <IconPencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeInclude(idx)}
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              title="Remove Item"
                            >
                              <IconTrash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Visit's Organisation Timeline Schedule Manager */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border">
              <h3 className="font-extrabold text-sm text-[#1B2A4A] flex items-center gap-1.5">
                <IconCalendar className="h-4 w-4 text-[#C9A227]" /> Visit's Organisation Timeline Schedule
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 rounded-xl border">
                <select
                  value={newScheduleType}
                  onChange={(e) => setNewScheduleType(e.target.value)}
                  className="h-9 rounded-md border text-xs font-bold px-2 bg-white"
                >
                  <option value="Departure">Departure</option>
                  <option value="Time">Time</option>
                  <option value="Arrival">Arrival</option>
                </select>
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Address / Location details"
                    value={newScheduleAddress}
                    onChange={(e) => setNewScheduleAddress(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <Button type="button" onClick={addScheduleStep} className="h-9 bg-[#1B2A4A] text-white text-xs font-bold">
                  <IconPlus className="h-3.5 w-3.5 mr-1" /> Add Step
                </Button>
              </div>

              {scheduleList.length > 0 && (
                <div className="space-y-2 pt-1">
                  {scheduleList.map((sc, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border text-xs shadow-sm">
                      {editingScheduleIndex === idx ? (
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                          <select
                            value={editingScheduleData.type}
                            onChange={(e) => setEditingScheduleData({ ...editingScheduleData, type: e.target.value })}
                            className="h-8 rounded border text-xs font-bold px-2"
                          >
                            <option value="Departure">Departure</option>
                            <option value="Time">Time</option>
                            <option value="Arrival">Arrival</option>
                          </select>
                          <Input
                            value={editingScheduleData.address}
                            onChange={(e) => setEditingScheduleData({ ...editingScheduleData, address: e.target.value })}
                            className="h-8 text-xs font-medium sm:col-span-2"
                            placeholder="Address/Location"
                          />
                          <div className="flex items-center gap-1 justify-end">
                            <Button type="button" size="sm" onClick={() => saveEditSchedule(idx)} className="h-8 bg-emerald-600 text-white text-xs px-3 font-bold">
                              <IconCheck className="h-3.5 w-3.5 mr-1" /> Save
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditingScheduleIndex(null)} className="h-8 text-xs">
                              <IconX className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#1B2A4A] text-gold font-bold text-[10px]">{sc.type}</Badge>
                            <span className="font-bold text-slate-800">{sc.address}</span>
                          </div>

                          <div className="flex items-center gap-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={idx === 0}
                              onClick={() => moveSchedule(idx, "up")}
                              className="h-7 w-7 text-slate-600 disabled:opacity-30"
                              title="Move Up"
                            >
                              <IconArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={idx === scheduleList.length - 1}
                              onClick={() => moveSchedule(idx, "down")}
                              className="h-7 w-7 text-slate-600 disabled:opacity-30"
                              title="Move Down"
                            >
                              <IconArrowDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditSchedule(idx)}
                              className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                              title="Edit Step"
                            >
                              <IconPencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeScheduleStep(idx)}
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              title="Remove Step"
                            >
                              <IconTrash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 8. SEO Metadata */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border">
              <h3 className="font-extrabold text-sm text-[#1B2A4A]">SEO Search Engine Tags</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="font-bold">SEO Meta Title</Label>
                  <Input
                    value={form.seoTitle}
                    onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                    placeholder="SEO Title Tag"
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <Label className="font-bold">SEO Meta Description</Label>
                  <Input
                    value={form.seoDescription}
                    onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                    placeholder="SEO Description Tag"
                    className="mt-1 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between rounded-2xl border bg-slate-50 p-4">
              <div>
                <Label className="font-bold text-sm">Active Visibility Status</Label>
                <p className="text-[11px] text-muted-foreground">Show this sightseeing activity live on client website</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </div>

          </div>

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 font-bold px-6">
              {saving ? "Saving..." : editing ? "Update Activity" : "Create Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={(o) => !o && setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <IconAlertTriangle className="h-5 w-5" /> Delete Activity
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteDialog?.title}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
