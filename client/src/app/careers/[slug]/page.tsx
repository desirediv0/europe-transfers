"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  IconMapPin,
  IconClock,
  IconArrowLeft,
  IconLoader2,
  IconUpload,
  IconFileText,
  IconX,
  IconCheck,
  IconSend,
} from "@tabler/icons-react";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
}

export default function JobDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get<Job>(`/jobs/${params.slug}`)
      .then(setJob)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const validateFile = (f: File) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(f.type)) {
      toast.error("Invalid file type. Only PDF, DOC, and DOCX are allowed.");
      return false;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return false;
    }
    return true;
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected || !validateFile(selected)) return;
    setFile(selected);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && validateFile(dropped)) setFile(dropped);
  }, []);

  const handleSubmit = async () => {
    if (!job) return;
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in your name, email, and phone");
      return;
    }
    if (!file) {
      toast.error("Please attach your CV");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("email", email.trim());
      form.append("phone", phone.trim());
      if (coverNote.trim()) form.append("coverNote", coverNote.trim());
      form.append("cv", file);
      await api.post(`/jobs/${job.id}/apply`, form);
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-black text-navy">Job not found</h1>
        <p className="text-gray-500">This position may have closed or the link is incorrect.</p>
        <Link href="/careers">
          <Button className="bg-gold hover:bg-gold-light text-navy font-black">View Open Positions</Button>
        </Link>
      </div>
    );
  }

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
              Thank you for applying to <span className="font-bold text-navy">{job.title}</span>. Our team will review your application and reach out if there&apos;s a match.
            </p>
          </div>
          <Link href="/careers">
            <Button className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs">
              View Other Positions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen font-sans">
      <section className="relative bg-[#060C17] text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0B1426]/90 to-black/80 z-10" />
        <div className="relative z-20 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <button
            onClick={() => router.push("/careers")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-gold mb-6"
          >
            <IconArrowLeft className="h-3.5 w-3.5" /> Back to Careers
          </button>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-300 font-medium">
            <span className="flex items-center gap-1.5">
              <IconMapPin className="h-4 w-4 text-gold" /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <IconClock className="h-4 w-4 text-gold" /> {job.type}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Description */}
        <div className="lg:col-span-3">
          <h2 className="text-lg font-black text-navy mb-3">About This Role</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* Apply Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-black text-navy">Apply Now</h2>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <textarea
                placeholder="Cover note (optional)"
                rows={3}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive ? "border-gold bg-gold/10" : "border-gray-300 hover:border-gold hover:bg-slate-50"
                }`}
              >
                <IconUpload className="h-6 w-6 text-gold mx-auto mb-2" />
                <p className="text-xs font-bold text-navy">Click or drag to attach your CV</p>
                <p className="text-[11px] text-gray-400 mt-1">PDF, DOC, DOCX — max 5MB</p>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-sm text-navy font-medium truncate">
                  <IconFileText className="h-4 w-4 text-gold shrink-0" />
                  <span className="truncate">{file.name}</span>
                </span>
                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 shrink-0">
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            )}

            <Button
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full h-11 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 className="h-4 w-4 animate-spin" /> Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IconSend className="h-4 w-4" /> Submit Application
                </span>
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
