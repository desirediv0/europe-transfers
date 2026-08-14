"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useAuth, type VerificationStep } from "@/context/AuthContext";
import {
  IconMail,
  IconArrowLeft,
  IconShieldCheck,
  IconLoader2,
  IconUpload,
  IconClock,
  IconX,
  IconCheck,
  IconSend,
  IconSparkles,

} from "@tabler/icons-react";

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationResult, setVerificationResult] = useState<{
    step: VerificationStep;
    message: string;
  } | null>(null);

  // Document Upload States
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { login, requestOtp, uploadId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await requestOtp(email);
      toast.success("OTP verification code sent to your email");
      setStep("otp");
      setResendTimer(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await requestOtp(email);
      toast.success("OTP code resent");
      setResendTimer(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, otpValue);
      setVerificationResult({ step: result.verificationStep, message: result.user.rejectionReason || "" });

      if (result.verificationStep === "VERIFIED") {
        toast.success("Welcome back to Europe Transfers!");
        router.push("/account");
      } else if (result.verificationStep === "UPLOAD_ID") {
        toast.info("Please upload your government ID to complete verification.");
      } else if (result.verificationStep === "PENDING_REVIEW") {
        toast.info("Your ID verification is currently under review.");
      } else if (result.verificationStep === "ID_REJECTED") {
        toast.error("Your ID was rejected. Please re-upload a clear document.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop File Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      toast.error("Only JPEG, PNG, WEBP, and GIF images are allowed.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      if (dropped.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      setFile(dropped);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(dropped);
    }
  };

  const handleUploadDoc = async () => {
    if (!file) {
      toast.error("Please select an ID or passport image to upload");
      return;
    }
    setUploadingDoc(true);
    try {
      await uploadId(file);
      setDocUploaded(true);
      toast.success("Government ID uploaded successfully! Verification takes 12-24 hours.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Document upload failed");
    } finally {
      setUploadingDoc(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-6">

        {/* Left Column: Form & OTP & Document Verification */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">

          {/* Header & Logo */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="relative h-10 w-40 shrink-0">
                <Image src="/logo-2.jpeg" alt="The Europe Transfers" fill className="object-contain" priority />
              </Link>
              <Link href="/" className="text-xs font-bold text-gray-500 hover:text-navy flex items-center gap-1">
                <IconArrowLeft className="h-3.5 w-3.5" /> Back Home
              </Link>
            </div>

            {verificationResult?.step === "UPLOAD_ID" || verificationResult?.step === "ID_REJECTED" ? (
              <div>
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Verification Step</span>
                <h2 className="text-2xl font-black text-navy mt-1">Upload Government ID</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a clear photo of your passport or driving license for account verification.
                </p>
              </div>
            ) : verificationResult?.step === "PENDING_REVIEW" || docUploaded ? (
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Under Review</span>
                <h2 className="text-2xl font-black text-navy mt-1">Verification Pending</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Your ID document is being reviewed. Verification completes within 12-24 hours.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Secure Client Login</span>
                <h2 className="text-2xl font-black text-navy mt-1">Welcome Back</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {step === "email" ? "Enter your registered email to receive an instant OTP login code." : `Enter the 6-digit code sent to ${email}`}
                </p>
              </div>
            )}
          </div>

          {/* Body Content */}
          {verificationResult?.step === "UPLOAD_ID" || verificationResult?.step === "ID_REJECTED" ? (
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
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${dragActive ? "border-gold bg-gold/10" : "border-gray-300 hover:border-gold hover:bg-slate-50"
                    }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold mx-auto mb-3">
                    <IconUpload className="h-7 w-7" />
                  </div>
                  <p className="text-xs font-black text-navy">Click or Drag & Drop Passport / ID Image</p>
                  <p className="text-[10px] text-gray-400 mt-1">Supports JPG, PNG, WEBP up to 5MB</p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-100 p-2">
                  <img src={preview} alt="ID Preview" className="h-44 w-full object-contain rounded-xl" />
                  <button
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-4 right-4 bg-navy/80 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <IconX className="h-4 w-4" />
                  </button>
                </div>
              )}

              <Button
                disabled={!file || uploadingDoc}
                onClick={handleUploadDoc}
                className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer disabled:opacity-50"
              >
                {uploadingDoc ? (
                  <span className="flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" /> Uploading Document...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4" /> Submit ID for Verification
                  </span>
                )}
              </Button>
            </div>
          ) : verificationResult?.step === "PENDING_REVIEW" || docUploaded ? (
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 mx-auto">
                <IconClock className="h-8 w-8" />
              </div>
              <p className="text-xs text-blue-900 font-semibold leading-relaxed">
                Thank you! Your document has been submitted. Our team will verify your details and activate full booking access within 12-24 hours.
              </p>
              <Button onClick={() => router.push("/account")} className="rounded-xl bg-navy text-white text-xs font-bold w-full h-11">
                Go to Dashboard
              </Button>
            </div>
          ) : step === "email" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs font-bold text-navy">Email Address</Label>
                <div className="relative mt-1">
                  <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="h-12 rounded-xl pl-10 border-gray-200 text-xs font-semibold focus:border-gold"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" /> Sending Code...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IconSend className="h-4 w-4" /> Request OTP Login Code
                  </span>
                )}
              </Button>

              <div className="text-center pt-2 text-xs text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="font-extrabold text-navy hover:text-gold">
                  Register Account
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-navy">Enter 6-Digit OTP</Label>
                <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue} className="justify-center">
                  <InputOTPGroup className="gap-1 sm:gap-2">
                    <InputOTPSlot index={0} className="h-12 w-10 sm:h-14 sm:w-12 text-lg font-black rounded-xl border-gray-200" />
                    <InputOTPSlot index={1} className="h-12 w-10 sm:h-14 sm:w-12 text-lg font-black rounded-xl border-gray-200" />
                    <InputOTPSlot index={2} className="h-12 w-10 sm:h-14 sm:w-12 text-lg font-black rounded-xl border-gray-200" />
                    <InputOTPSlot index={3} className="h-12 w-10 sm:h-14 sm:w-12 text-lg font-black rounded-xl border-gray-200" />
                    <InputOTPSlot index={4} className="h-12 w-10 sm:h-14 sm:w-12 text-lg font-black rounded-xl border-gray-200" />
                    <InputOTPSlot index={5} className="h-12 w-10 sm:h-14 sm:w-12 text-lg font-black rounded-xl border-gray-200" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" /> Verifying Code...
                  </span>
                ) : (
                  "Verify OTP & Sign In"
                )}
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-gray-500 hover:text-navy flex items-center gap-1 font-semibold"
                >
                  <IconArrowLeft className="h-3.5 w-3.5" /> Change Email
                </button>
                {resendTimer > 0 ? (
                  <span className="text-gray-400 font-semibold">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-gold hover:text-navy font-extrabold"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Security Banner Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-400">
            <span className="flex items-center gap-1">
              <IconShieldCheck className="h-4 w-4 text-emerald-500" /> 256-Bit SSL Encrypted
            </span>
            <span>Europe Transfers Legal</span>
          </div>

        </div>

        {/* Right Column: Luxury Showcase Photo Card */}
        <div className="hidden lg:block lg:col-span-6 relative min-h-[500px]">
          <img
            src="/images/about_luxury_chauffeur.png"
            alt="Luxury Chauffeur Transfer Europe"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute top-8 left-8 right-8 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-black text-white border border-white/30">
              <IconSparkles className="h-3.5 w-3.5 text-gold" /> Exclusive Chauffeur Concierge
            </span>
          </div>

          <div className="absolute bottom-8 left-8 right-8 text-white z-10 space-y-3">
            <h3 className="text-2xl font-black text-white leading-tight">
              Premium Private Transfers Across Europe
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Access fixed transparent pricing, English-speaking chauffeurs, and instant flight-tracked bookings.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-bold text-gray-200">
              <div className="flex items-center gap-1.5"><IconCheck className="h-4 w-4 text-gold" /> Instant OTP Login</div>
              <div className="flex items-center gap-1.5"><IconCheck className="h-4 w-4 text-gold" /> Guaranteed Mercedes Fleet</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
