"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  IconUpload,
  IconX,
  IconLoader2,
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconShieldCheck,
  IconInfoCircle,

  IconSparkles,
} from "@tabler/icons-react";

export default function UploadIdPage() {
  const { uploadId, verificationStep } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      toast.error("Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selected);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a document image to upload");
      return;
    }
    setLoading(true);
    try {
      await uploadId(file);
      setUploaded(true);
      toast.success("Document uploaded successfully! Verification completes within 12-24 hours.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      if (dropped.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFile(dropped);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(dropped);
    }
  }, []);

  // Upload success screen / Pending Review
  if (uploaded || verificationStep === "PENDING_REVIEW") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden my-6">
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto border border-blue-100 shadow-inner">
              <IconClock className="h-10 w-10 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Verification Status</span>
              <h2 className="text-2xl font-black text-navy mt-1">Verification in Progress</h2>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-sm mx-auto">
                Your ID document has been submitted successfully. Our compliance team will review your document within <span className="font-extrabold text-navy">12-24 hours</span>.
              </p>
            </div>

            <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-5 text-left space-y-3 text-xs">
              <div className="flex items-center gap-2 text-navy font-black">
                <IconInfoCircle className="h-4 w-4 text-gold shrink-0" />
                <span>Verification Checklist</span>
              </div>
              <ul className="space-y-2 text-gray-600 font-medium">
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  Email Address Verified
                </li>
                <li className="flex items-center gap-2">
                  <IconClock className="h-4 w-4 text-blue-500 shrink-0" />
                  Government ID Document Submitted
                </li>
                <li className="flex items-center gap-2">
                  <IconShieldCheck className="h-4 w-4 text-gray-400 shrink-0" />
                  Full Booking Access Activation (Pending)
                </li>
              </ul>
            </div>

            <Button
              className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer"
              onClick={() => router.push("/account")}
            >
              Go to Account Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Already verified
  if (verificationStep === "VERIFIED") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden my-6">
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-100 shadow-inner">
              <IconShieldCheck className="h-10 w-10" />
            </div>

            <div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Account Status</span>
              <h2 className="text-2xl font-black text-navy mt-1">Account Fully Verified</h2>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Your ID verification is active. You have full access to book transfers across Europe.
              </p>
            </div>

            <Button
              className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer"
              onClick={() => router.push("/fleet")}
            >
              Book Private Transfer Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-6">

        {/* Left Column: Upload Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">

          <div>
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="relative h-10 w-40 shrink-0">
                <Image src="/logo-2.jpeg" alt="The Europe Transfers" fill className="object-contain" priority />
              </Link>
              <Link href="/account" className="text-xs font-bold text-gray-500 hover:text-navy flex items-center gap-1">
                <IconArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
              </Link>
            </div>

            <span className="text-[10px] font-black text-gold uppercase tracking-widest">Client Verification</span>
            <h2 className="text-2xl font-black text-navy mt-1">Upload Government ID</h2>
            <p className="text-xs text-gray-500 mt-1">
              Please upload a clear photo of your passport, national identity card, or driving license.
            </p>
          </div>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />

            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${dragActive ? "border-gold bg-gold/10 scale-102" : "border-gray-300 hover:border-gold hover:bg-slate-50"
                  }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-gold mx-auto mb-4">
                  <IconUpload className="h-8 w-8" />
                </div>
                <p className="text-sm font-black text-navy">Click or Drag & Drop Passport / ID File</p>
                <p className="text-xs text-gray-400 mt-1">Upload clear image (JPG, PNG, WEBP max 5MB)</p>
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-slate-100 p-3 text-center">
                <img src={preview} alt="ID Preview" className="h-52 w-full object-contain rounded-2xl" />
                <button
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-4 right-4 bg-navy/80 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            )}

            <Button
              disabled={!file || loading}
              onClick={handleUpload}
              className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 className="h-4 w-4 animate-spin" /> Submitting Document...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4" /> Submit ID for Verification
                </span>
              )}
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-400">
            <span className="flex items-center gap-1">
              <IconShieldCheck className="h-4 w-4 text-emerald-500" /> Secure SSL Encrypted Document Vault
            </span>
            <span>Europe Transfers Compliance</span>
          </div>

        </div>

        {/* Right Column: Guidance Card */}
        <div className="hidden lg:block lg:col-span-5 relative min-h-[500px]">
          <img
            src="/images/about_luxury_chauffeur.png"
            alt="Client Document Verification Europe Transfers"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute top-8 left-8 right-8 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold text-navy px-3.5 py-1 text-xs font-black shadow-md">
              <IconSparkles className="h-3.5 w-3.5" /> ID Upload Guidelines
            </span>
          </div>

          <div className="absolute bottom-8 left-8 right-8 text-white z-10 space-y-3">
            <h3 className="text-2xl font-black text-white leading-tight">
              Accepted Verification Documents
            </h3>
            <div className="space-y-2 text-xs text-gray-200 font-medium">
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-gold shrink-0" />
                <span>Valid International Passport</span>
              </div>
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-gold shrink-0" />
                <span>National Identity Card (Front & Back)</span>
              </div>
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-gold shrink-0" />
                <span>EU / US / UK Driving License</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
