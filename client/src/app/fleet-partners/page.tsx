"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { ALL_COUNTRIES, MAJOR_CITIES } from "@/lib/worldData";
import {
  IconSteeringWheel,
  IconCheck,
  IconLoader2,
  IconUpload,
  IconX,
  IconArrowLeft,
  IconArrowRight,
  IconPhoto,
  IconRefresh,
} from "@tabler/icons-react";

interface DraftApplication {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  vehicleType: string | null;
  vehicleDetails: string | null;
  images: { url: string; key: string }[];
  step: number;
  status: string;
}

const MAX_IMAGES = 4;
const MIN_IMAGES = 1;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FleetPartnersPage() {
  const [step, setStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState("");

  const [images, setImages] = useState<{ url: string; key: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingStep1, setSavingStep1] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showResume, setShowResume] = useState(false);
  const [resumeEmail, setResumeEmail] = useState("");
  const [resumePhone, setResumePhone] = useState("");
  const [resuming, setResuming] = useState(false);

  const applyDraft = (draft: DraftApplication) => {
    setApplicationId(draft.id);
    setName(draft.name || "");
    setEmail(draft.email || "");
    setPhone(draft.phone || "");
    setCountry(draft.country || "");
    setCity(draft.city || "");
    setVehicleType(draft.vehicleType || "");
    setVehicleDetails(draft.vehicleDetails || "");
    setImages(draft.images || []);
    setStep(draft.step >= 2 ? 2 : 1);
  };

  const handleResume = async () => {
    if (!resumeEmail.trim() || !resumePhone.trim()) {
      toast.error("Please enter both email and phone");
      return;
    }
    setResuming(true);
    try {
      const draft = await api.post<DraftApplication>("/fleet-partners/resume", {
        email: resumeEmail.trim(),
        phone: resumePhone.trim(),
      });
      applyDraft(draft);
      setShowResume(false);
      toast.success("Your saved application has been loaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't find a saved application");
    } finally {
      setResuming(false);
    }
  };

  const handleStep1Submit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !country.trim() || !city.trim() || !vehicleType.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSavingStep1(true);
    try {
      const draft = await api.post<DraftApplication>("/fleet-partners/step1", {
        id: applicationId || undefined,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
        city: city.trim(),
        vehicleType: vehicleType.trim(),
        vehicleDetails: vehicleDetails.trim() || undefined,
      });
      setApplicationId(draft.id);
      setImages(draft.images || []);
      setStep(2);
      toast.success("Progress saved! You can resume anytime with your email & phone.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save your details");
    } finally {
      setSavingStep1(false);
    }
  };

  const validateFile = (f: File) => {
    if (!f.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      toast.error("Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.");
      return false;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Each image must be less than 5MB");
      return false;
    }
    return true;
  };

  const uploadFiles = async (files: File[]) => {
    if (!applicationId) return;
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images`);
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("images", f));
      const draft = await api.post<DraftApplication>(`/fleet-partners/${applicationId}/images`, form);
      setImages(draft.images || []);
      toast.success("Photos uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter(validateFile);
    if (selected.length) uploadFiles(selected);
    e.target.value = "";
  }, [applicationId, images]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files || []).filter(validateFile);
    if (dropped.length) uploadFiles(dropped);
  }, [applicationId, images]);

  const removeImage = async (key: string) => {
    if (!applicationId) return;
    try {
      const draft = await api.del<DraftApplication>(`/fleet-partners/${applicationId}/images`, { key });
      setImages(draft.images || []);
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  const handleFinalSubmit = async () => {
    if (!applicationId) return;
    if (images.length < MIN_IMAGES) {
      toast.error(`Please upload at least ${MIN_IMAGES} vehicle images`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/fleet-partners/${applicationId}/submit`, {});
      setSubmitted(true);
      toast.success("Application submitted!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200/80 p-8 sm:p-10 text-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-100 shadow-inner">
            <IconCheck className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-navy">Application Submitted</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Thank you, <span className="font-bold text-navy">{name}</span>. We&apos;ve emailed you a confirmation, and our partnerships team will review your application within <span className="font-bold text-navy">12–24 hours</span>.
            </p>
          </div>
          <Link href="/">
            <Button className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen font-sans">
      {/* Hero */}
      <section className="relative bg-[#060C17] text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0B1426]/90 to-black/80 z-10" />
        <div className="absolute top-10 right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
        <div className="relative z-20 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-black text-gold uppercase tracking-wider mb-6 border border-gold/30">
            <IconSteeringWheel className="h-4 w-4 text-gold" />
            Driver & Fleet Partners
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
            Partner Your <span className="text-gold">Vehicle</span> With Us
          </h1>
          <p className="mt-4 text-base text-gray-300 max-w-xl mx-auto leading-relaxed font-normal">
            Own a vehicle? Partner with Europe Transfers and put it to work. Tell us about you and your vehicle to get started.
          </p>
          {!applicationId && (
            <button
              onClick={() => setShowResume((v) => !v)}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-gold"
            >
              <IconRefresh className="h-3.5 w-3.5" /> Already started an application? Continue it
            </button>
          )}
        </div>
      </section>

      {showResume && !applicationId && (
        <section className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 -mt-6 relative z-30">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 space-y-3">
            <p className="text-sm font-bold text-navy">Continue Your Application</p>
            <input
              type="email"
              placeholder="Email used earlier"
              value={resumeEmail}
              onChange={(e) => setResumeEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <input
              type="tel"
              placeholder="Phone used earlier"
              value={resumePhone}
              onChange={(e) => setResumePhone(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <Button disabled={resuming} onClick={handleResume} className="w-full h-10 rounded-lg bg-navy hover:bg-navy/90 text-white text-xs font-bold">
              {resuming ? <IconLoader2 className="h-4 w-4 animate-spin" /> : "Find My Application"}
            </Button>
          </div>
        </section>
      )}

      {/* Progress */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-center gap-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-colors ${
                  step >= s ? "bg-gold text-navy" : "bg-gray-200 text-gray-400"
                }`}
              >
                {step > s ? <IconCheck className="h-4 w-4" /> : s}
              </div>
              {s < 2 && <div className={`h-0.5 w-16 transition-colors ${step > s ? "bg-gold" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-16 mt-2 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
          <span className={step === 1 ? "text-navy" : ""}>Your Details</span>
          <span className={step === 2 ? "text-navy" : ""}>Vehicle Photos</span>
        </div>
      </section>

      {/* Step Content */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
                <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
                <input type="tel" placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
                <Combobox
                  value={country}
                  onChange={(v) => { setCountry(v); setCity(""); }}
                  options={[...ALL_COUNTRIES]}
                  placeholder="Country *"
                  searchPlaceholder="Search countries..."
                  emptyText="No country found."
                />
                <Combobox
                  value={city}
                  onChange={setCity}
                  options={country && MAJOR_CITIES[country] ? MAJOR_CITIES[country] : []}
                  placeholder="City *"
                  searchPlaceholder="Search or type your city..."
                  emptyText="Type to search or enter your city."
                  allowCustomValue
                />
                <input type="text" placeholder="Vehicle Type * (e.g. Mercedes S-Class)" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
              </div>
              <textarea
                placeholder="Vehicle details (year, color, condition, seating capacity...)"
                rows={3}
                value={vehicleDetails}
                onChange={(e) => setVehicleDetails(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
              />
              <Button
                disabled={savingStep1}
                onClick={handleStep1Submit}
                className="w-full h-11 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs disabled:opacity-50"
              >
                {savingStep1 ? (
                  <span className="flex items-center gap-2"><IconLoader2 className="h-4 w-4 animate-spin" /> Saving...</span>
                ) : (
                  <span className="flex items-center gap-2">Continue to Photos <IconArrowRight className="h-4 w-4" /></span>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-navy">Upload Vehicle Photos</h3>
                <p className="text-xs text-gray-400 mt-1">Upload {MIN_IMAGES}–{MAX_IMAGES} clear photos of your vehicle (exterior & interior). JPEG, PNG, WEBP — max 5MB each.</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {images.length < MAX_IMAGES && (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragActive ? "border-gold bg-gold/10" : "border-gray-300 hover:border-gold hover:bg-slate-50"
                  }`}
                >
                  {uploading ? (
                    <IconLoader2 className="h-8 w-8 text-gold mx-auto animate-spin" />
                  ) : (
                    <>
                      <IconUpload className="h-7 w-7 text-gold mx-auto mb-2" />
                      <p className="text-sm font-bold text-navy">Click or drag photos here</p>
                      <p className="text-[11px] text-gray-400 mt-1">{images.length}/{MAX_IMAGES} uploaded</p>
                    </>
                  )}
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <div key={img.key} className="relative rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={img.url} alt="Vehicle" className="h-24 w-full object-cover" />
                      <button
                        onClick={() => removeImage(img.key)}
                        className="absolute top-1.5 right-1.5 bg-navy/80 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <IconX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length === 0 && (
                <p className="text-xs text-gray-400 flex items-center gap-1.5"><IconPhoto className="h-4 w-4" /> No photos uploaded yet</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 rounded-xl text-xs font-bold">
                  <IconArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  disabled={submitting || images.length < MIN_IMAGES}
                  onClick={handleFinalSubmit}
                  className="flex-1 h-11 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2"><IconLoader2 className="h-4 w-4 animate-spin" /> Submitting...</span>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-4">
          Your progress is saved automatically. Come back anytime using the &quot;Continue your application&quot; link above.
        </p>
      </section>
    </div>
  );
}
