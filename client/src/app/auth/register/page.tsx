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
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
  IconShieldCheck,
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconArrowLeft,
  IconUpload,
  IconCheck,
  IconClock,
  IconX,
  IconSend,
  IconUserPlus,
  IconSparkles,
} from "@tabler/icons-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authStep, setAuthStep] = useState<"register" | "otp" | "upload_id">("register");
  const [otpValue, setOtpValue] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Document Upload States
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, verifyOtp, requestOtp, uploadId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Enter the OTP sent to your email.");
      setAuthStep("otp");
      setResendTimer(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await requestOtp(form.email);
      toast.success("OTP resent to your email");
      setResendTimer(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const result = await verifyOtp(form.email, otpValue);
      if (result.verificationStep === "VERIFIED") {
        toast.success("Account verified successfully!");
        router.push("/account");
      } else {
        toast.success("Email verified! Please upload your Government ID.");
        setAuthStep("upload_id");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
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
      toast.error("Please select an ID or passport image");
      return;
    }
    setUploadingDoc(true);
    try {
      await uploadId(file);
      setDocUploaded(true);
      toast.success("Document uploaded! Verification completes within 12-24 hours.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Document upload failed");
    } finally {
      setUploadingDoc(false);
    }
  };

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-6">
        
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="relative h-10 w-40 shrink-0">
                <Image src="/logo-2.jpeg" alt="The Europe Transfers" fill className="object-contain" priority />
              </Link>
              <Link href="/" className="text-xs font-bold text-gray-500 hover:text-navy flex items-center gap-1">
                <IconArrowLeft className="h-3.5 w-3.5" /> Back Home
              </Link>
            </div>

            {authStep === "register" && (
              <div>
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Create Client Account</span>
                <h2 className="text-2xl font-black text-navy mt-1">Register With Europe Transfers</h2>
                <p className="text-xs text-gray-500 mt-1">Fill out your details to access private chauffeur transfers and fixed rates.</p>
              </div>
            )}

            {authStep === "otp" && (
              <div>
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Step 02: Verification</span>
                <h2 className="text-2xl font-black text-navy mt-1">Verify Email Address</h2>
                <p className="text-xs text-gray-500 mt-1">Enter the 6-digit OTP code sent to <span className="font-bold text-navy">{form.email}</span></p>
              </div>
            )}

            {authStep === "upload_id" && (
              <div>
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Step 03: Document Upload</span>
                <h2 className="text-2xl font-black text-navy mt-1">Verify Government ID</h2>
                <p className="text-xs text-gray-500 mt-1">Upload passport or driving license image for document approval.</p>
              </div>
            )}
          </div>

          {/* Form Content */}
          {docUploaded ? (
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 mx-auto">
                <IconClock className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-navy">ID Verification Pending Review</h3>
              <p className="text-xs text-blue-900 font-semibold leading-relaxed">
                Your account registration and document upload are complete. Our admin team will verify your details within 12-24 hours.
              </p>
              <Button onClick={() => router.push("/account")} className="rounded-xl bg-navy text-white text-xs font-bold w-full h-11">
                Go to Client Dashboard
              </Button>
            </div>
          ) : authStep === "upload_id" ? (
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
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                    dragActive ? "border-gold bg-gold/10" : "border-gray-300 hover:border-gold hover:bg-slate-50"
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold mx-auto mb-3">
                    <IconUpload className="h-7 w-7" />
                  </div>
                  <p className="text-xs font-black text-navy">Click or Drag & Drop Passport / Driving License</p>
                  <p className="text-[10px] text-gray-400 mt-1">Supports JPG, PNG, WEBP up to 5MB</p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-100 p-2">
                  <img src={preview} alt="Document Preview" className="h-44 w-full object-contain rounded-xl" />
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
                    <IconLoader2 className="h-4 w-4 animate-spin" /> Uploading ID...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4" /> Upload Document & Complete
                  </span>
                )}
              </Button>
            </div>
          ) : authStep === "otp" ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-navy">Enter 6-Digit Email Code</Label>
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
                  "Verify & Continue"
                )}
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setAuthStep("register")}
                  className="text-gray-500 hover:text-navy flex items-center gap-1 font-semibold"
                >
                  <IconArrowLeft className="h-3.5 w-3.5" /> Back to Register
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
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-navy">Full Name</Label>
                  <div className="relative mt-1">
                    <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-navy">Phone Number</Label>
                  <div className="relative mt-1">
                    <IconPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="tel"
                      required
                      placeholder="+41 44 123 4567"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-navy">Email Address</Label>
                <div className="relative mt-1">
                  <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-navy">Password</Label>
                  <div className="relative mt-1">
                    <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className="h-11 rounded-xl pl-10 pr-10 border-gray-200 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
                    >
                      {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-navy">Confirm Password</Label>
                  <div className="relative mt-1">
                    <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      className="h-11 rounded-xl pl-10 pr-10 border-gray-200 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
                    >
                      {showConfirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gold hover:bg-gold-light text-navy font-black text-xs shadow-lg shadow-gold/20 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" /> Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IconUserPlus className="h-4 w-4" /> Register New Account
                  </span>
                )}
              </Button>

              <div className="text-center pt-1 text-xs text-gray-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-extrabold text-navy hover:text-gold">
                  Sign In Now
                </Link>
              </div>
            </form>
          )}

          {/* Footer Security */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-400">
            <span className="flex items-center gap-1">
              <IconShieldCheck className="h-4 w-4 text-emerald-500" /> GDPR & Privacy Compliant
            </span>
            <span>Europe Transfers Legal</span>
          </div>

        </div>

        {/* Right Column: Luxury Showcase Photo Card */}
        <div className="hidden lg:block lg:col-span-5 relative min-h-[500px]">
          <img
            src="/images/hero_swiss_alps.png"
            alt="Private Chauffeur Transfers Europe"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute top-8 left-8 right-8 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold text-navy px-3.5 py-1 text-xs font-black shadow-md">
              <IconSparkles className="h-3.5 w-3.5" /> VIP Transfer Membership
            </span>
          </div>

          <div className="absolute bottom-8 left-8 right-8 text-white z-10 space-y-3">
            <h3 className="text-2xl font-black text-white leading-tight">
              Unlock All-Inclusive Europe Transfers
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Create an account to manage bookings, track drivers in real-time, and get exclusive fixed chauffeur rates.
            </p>
            <div className="grid grid-cols-1 gap-2 pt-2 text-[11px] font-bold text-gray-200">
              <div className="flex items-center gap-1.5"><IconCheck className="h-4 w-4 text-gold" /> Instant Registration & Verification</div>
              <div className="flex items-center gap-1.5"><IconCheck className="h-4 w-4 text-gold" /> Transparent Fixed All-Inclusive Rates</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
