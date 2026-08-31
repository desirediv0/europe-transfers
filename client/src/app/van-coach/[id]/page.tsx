"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";
import {
  IconCar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconShieldCheck,
  IconSend,
  IconPhoneCall,
  IconBrandWhatsapp,
  IconMail,
  IconUser,
  IconLoader2,
  IconArrowLeft,
  IconCheck,
} from "@tabler/icons-react";

interface VanCoachRoutePrice {
  id: string;
  group: "AIRPORT_TRANSFER" | "POINT_TO_POINT" | "TOUR_PACKAGE";
  label: string;
  price: number;
}

interface VanCoachVehicle {
  id: string;
  name: string;
  category: string | null;
  seats: number;
  image: string | null;
  description: string | null;
  rate8h: number;
  rate10h: number;
  overtimeRate: number;
  currency: string;
  routePrices: VanCoachRoutePrice[];
}

const GROUP_LABELS: Record<string, string> = {
  AIRPORT_TRANSFER: "Airport Transfers",
  POINT_TO_POINT: "Point-to-Point Transfers",
  TOUR_PACKAGE: "Tour Packages",
};

function VehicleDetailContent() {
  const { format: formatCurrency } = useCurrency();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;

  const [vehicle, setVehicle] = useState<VanCoachVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const selectedLocationName = searchParams.get("location") || "Europe";
  const hours = searchParams.get("hours") || "8";
  const numericHours = Number(hours) || 8;

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", pickupAddress: "", itineraryNotes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    api
      .get<VanCoachVehicle>(`/van-coach/${id}`)
      .then(setVehicle)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const hourlyRate = vehicle ? Math.round((Number(vehicle.rate8h) / 8) * 100) / 100 : 0;
  const totalPrice = hourlyRate * numericHours;

  const groupedRoutePrices = (vehicle?.routePrices || []).reduce<Record<string, VanCoachRoutePrice[]>>((acc, rp) => {
    if (!acc[rp.group]) acc[rp.group] = [];
    acc[rp.group].push(rp);
    return acc;
  }, {});

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please enter name, email, and phone");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/van-coach/enquire", {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        location: selectedLocationName,
        hours: numericHours,
        rate: totalPrice,
        name: form.name,
        phone: form.phone,
        email: form.email,
        pickupAddress: form.pickupAddress || undefined,
        itineraryNotes: form.itineraryNotes || undefined,
      });
      setSubmitting(false);
      setDetailModalOpen(false);
      setSuccessDialogOpen(true);
      toast.success("Enquiry sent to Europe Transfers Concierge Team!");
    } catch {
      setSubmitting(false);
      toast.error("Failed to send enquiry. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <IconCar className="h-12 w-12 text-gold" />
        <h1 className="text-lg font-black text-navy">Vehicle not found</h1>
        <p className="text-xs text-gray-500">This vehicle may have been removed from the fleet.</p>
        <Button onClick={() => router.push("/van-coach")} className="bg-navy text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer">
          Back to Van & Coach
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <section className="bg-white border-b border-gray-200/80 sticky top-16 z-30 shadow-xs">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/van-coach" className="inline-flex items-center gap-2 text-xs font-bold text-navy hover:text-gold transition-colors">
            <IconArrowLeft className="h-4 w-4" /> Back to Van & Coach
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden rounded-3xl border-gray-200/80 bg-white shadow-sm">
          <div className="relative h-56 sm:h-80 bg-slate-200">
            {vehicle.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vehicle.image} alt={vehicle.name} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                <IconCar className="h-12 w-12" />
                <span className="text-xs font-bold uppercase tracking-wider">No Image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              {vehicle.category && (
                <Badge className="rounded-full bg-gold text-navy font-black text-xs mb-2">{vehicle.category}</Badge>
              )}
              <h1 className="text-2xl sm:text-4xl font-black text-white">{vehicle.name}</h1>
            </div>
          </div>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="rounded-full bg-slate-100 text-navy text-xs font-bold px-3 py-1">
                <IconUsers className="h-3.5 w-3.5 text-gold mr-1.5 inline" /> {vehicle.seats} Seats
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-slate-100 text-navy text-xs font-bold px-3 py-1">
                <IconMapPin className="h-3.5 w-3.5 text-gold mr-1.5 inline" /> {selectedLocationName}
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-slate-100 text-navy text-xs font-bold px-3 py-1">
                <IconClock className="h-3.5 w-3.5 text-gold mr-1.5 inline" /> {hours}h Disposal
              </Badge>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">{vehicle.description || `${vehicle.name} available for hourly disposal with dedicated English-speaking chauffeur.`}</p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500">Estimated Rate</span>
                <p className="text-sm font-black text-navy">{formatCurrency(hourlyRate)} / hour</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-500">Total ({numericHours}h)</span>
                <p className="text-xl font-black text-gold">{formatCurrency(totalPrice)}</p>
              </div>
            </div>

            {Object.keys(groupedRoutePrices).length > 0 && (
              <div className="space-y-4">
                {Object.entries(groupedRoutePrices).map(([group, prices]) => (
                  <div key={group}>
                    <h3 className="text-xs font-black text-gold uppercase tracking-wider mb-2">{GROUP_LABELS[group] || group}</h3>
                    <div className="space-y-1.5">
                      {prices.map((rp) => (
                        <div key={rp.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                          <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <IconCheck className="h-3.5 w-3.5 text-gold shrink-0" /> {rp.label}
                          </span>
                          <span className="font-black text-navy">{formatCurrency(Number(rp.price))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["Air Conditioning", "Professional Chauffeur", "Free Waiting Time", "Meet & Greet"].map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 bg-slate-50 rounded-lg px-2.5 py-2 border border-gray-100">
                  <IconShieldCheck className="h-3.5 w-3.5 text-gold shrink-0" /> {f}
                </div>
              ))}
            </div>

            <Button
              onClick={() => setDetailModalOpen(true)}
              className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-sm shadow-lg shadow-gold/20 cursor-pointer"
            >
              Enquire Now
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Enquiry Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden bg-white border border-gray-200">
          <div className="p-6 pb-0">
            <span className="text-[10px] font-black text-gold uppercase tracking-widest">Registration Form</span>
            <h3 className="text-lg font-black text-navy">Passenger & Itinerary Registration</h3>
          </div>
          <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy">Estimated Hourly Rate</span>
                <span className="text-base font-black text-navy">{formatCurrency(hourlyRate)} / hour</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200/60 pt-2 text-xs">
                <span className="text-gray-500 font-medium">Estimated Total ({numericHours} Hours)</span>
                <span className="text-lg font-black text-gold">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold text-navy">Full Name</Label>
                <div className="relative mt-1">
                  <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type="text" required placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold text-navy">Phone Number</Label>
                <div className="relative mt-1">
                  <IconPhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type="tel" required placeholder="+41 44 123 4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold" />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold text-navy">Email Address</Label>
              <div className="relative mt-1">
                <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="email" required placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold text-navy">Pickup Hotel / Airport Address</Label>
              <Input type="text" placeholder="e.g. Park Hyatt Milan or Malpensa Airport Terminal 1" value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} className="h-11 rounded-xl border-gray-200 text-xs font-semibold mt-1" />
            </div>
            <div>
              <Label className="text-xs font-bold text-navy">Custom Itinerary Notes & Requests</Label>
              <textarea rows={3} placeholder="Mention any planned stops..." value={form.itineraryNotes} onChange={(e) => setForm({ ...form, itineraryNotes: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 p-3 text-xs font-semibold text-navy focus:outline-none focus:border-gold" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer">
              {submitting ? (
                <span className="flex items-center gap-2"><IconLoader2 className="h-4 w-4 animate-spin" /> Dispatching to Concierge Team...</span>
              ) : (
                <span className="flex items-center gap-2"><IconSend className="h-4 w-4" /> Send Enquiry to Europe Transfers Team</span>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 text-center bg-white border border-gray-200">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-100 shadow-inner mb-4">
            <IconShieldCheck className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-black text-navy">Enquiry Sent!</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-2 leading-relaxed">
            Our concierge team has received your enquiry for <span className="font-extrabold text-navy">{vehicle.name}</span>. We will email your confirmed quote within 15 minutes.
          </DialogDescription>
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
            <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Need Urgent Assistance?</p>
            <div className="flex items-center justify-center gap-3">
              <a href="tel:+918882382864" className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 p-2.5 text-xs font-extrabold text-navy hover:bg-slate-50 transition-colors">
                <IconPhoneCall className="h-4 w-4 text-gold" /> Call Team
              </a>
              <a href="https://wa.me/918796757775" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-white p-2.5 text-xs font-extrabold hover:bg-emerald-600 transition-colors shadow-sm">
                <IconBrandWhatsapp className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>
          <Button onClick={() => setSuccessDialogOpen(false)} className="mt-6 w-full rounded-xl bg-navy text-white text-xs font-extrabold h-11">Done</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function VanCoachDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><IconLoader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <VehicleDetailContent />
    </Suspense>
  );
}
