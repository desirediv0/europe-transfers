"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { KycDocumentsForm } from "@/components/KycDocumentsForm";
import { toast } from "sonner";
import { useAuth, type RegisterData } from "@/context/AuthContext";
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
  IconCheck,
  IconClock,
  IconUserPlus,
  IconSparkles,
  IconBuilding,
} from "@tabler/icons-react";

const BUSINESS_TYPES = [
  "Travel Agency",
  "Tour Operator",
  "Destination Management Company (DMC)",
  "Corporate / Event Company",
  "Hotel / Hospitality",
  "Other",
];

const COUNTRY_SUGGESTIONS = [
  "India", "United Kingdom", "Ireland", "France", "Germany", "Italy", "Spain", "Switzerland", "Austria",
  "Netherlands", "Belgium", "Portugal", "Greece", "Norway", "Sweden", "Denmark", "Finland", "Iceland",
  "Poland", "Czech Republic", "Hungary", "Croatia", "United Arab Emirates", "United States", "Canada",
  "Australia", "New Zealand", "Japan", "Singapore",
];

const emptyForm: RegisterData = {
  companyName: "",
  businessType: "",
  companyCountry: "",
  registrationNumber: "",
  vatId: "",
  businessAddress: "",
  name: "",
  jobTitle: "",
  email: "",
  phone: "",
  contactLocation: "",
  password: "",
  confirmPassword: "",
  confirmAuthorized: false,
  acceptTerms: false,
  acceptPrivacy: false,
  commsConsent: false,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-black text-navy uppercase tracking-widest border-b border-gray-100 pb-1.5 pt-2">{children}</p>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authStep, setAuthStep] = useState<"register" | "otp" | "upload_id">("register");
  const [otpValue, setOtpValue] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [docUploaded, setDocUploaded] = useState(false);

  const { register, verifyOtp, requestOtp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const set = <K extends keyof RegisterData>(field: K, value: RegisterData[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      toast.error("Password must be at least 8 characters and include a letter and a number");
      return;
    }
    if (!form.confirmAuthorized || !form.acceptTerms || !form.acceptPrivacy) {
      toast.error("Please tick the authorization, Terms & Conditions and Privacy Policy boxes");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Details saved! Enter the OTP sent to your business email.");
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
        toast.success("Email verified! Please upload your verification documents.");
        setAuthStep("upload_id");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "h-11 rounded-xl border-gray-200 text-xs font-semibold";
  const iconInput = "h-11 rounded-xl pl-10 border-gray-200 text-xs font-semibold";

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
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Step 01: Business Registration</span>
                <h2 className="text-2xl font-black text-navy mt-1">Register Your Business</h2>
                <p className="text-xs text-gray-500 mt-1">Create a verified B2B account to access private chauffeur transfers and fixed rates.</p>
              </div>
            )}

            {authStep === "otp" && (
              <div>
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Step 02: Email Verification</span>
                <h2 className="text-2xl font-black text-navy mt-1">Verify Business Email</h2>
                <p className="text-xs text-gray-500 mt-1">Enter the 6-digit OTP code sent to <span className="font-bold text-navy">{form.email}</span></p>
              </div>
            )}

            {authStep === "upload_id" && (
              <div>
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Step 03: Verification Documents</span>
                <h2 className="text-2xl font-black text-navy mt-1">Upload Compliance Documents</h2>
                <p className="text-xs text-gray-500 mt-1">Our team reviews these to approve your business account.</p>
              </div>
            )}
          </div>

          {/* Form Content */}
          {docUploaded ? (
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 mx-auto">
                <IconClock className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-navy">Verification Pending Review</h3>
              <p className="text-xs text-blue-900 font-semibold leading-relaxed">
                Your registration and documents are complete. Our admin team will verify your business within 12-24 hours.
              </p>
              <Button onClick={() => router.push("/account")} className="rounded-xl bg-navy text-white text-xs font-bold w-full h-11">
                Go to Client Dashboard
              </Button>
            </div>
          ) : authStep === "upload_id" ? (
            <KycDocumentsForm onUploaded={() => setDocUploaded(true)} />
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
              {/* Company Information */}
              <SectionTitle>Company Information</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label className="text-xs font-bold text-navy">Company / Agency Name *</Label>
                  <div className="relative mt-1">
                    <IconBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input required minLength={2} maxLength={150} placeholder="Registered company name" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} className={iconInput} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-navy">Business Type *</Label>
                  <select
                    required
                    value={form.businessType}
                    onChange={(e) => set("businessType", e.target.value)}
                    className="mt-1 w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-navy focus:outline-none focus:border-gold"
                  >
                    <option value="">Select business type</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-navy">Country *</Label>
                  <Input required list="register-countries" maxLength={80} placeholder="Country of registration" value={form.companyCountry} onChange={(e) => set("companyCountry", e.target.value)} className={`mt-1 ${fieldClass}`} />
                  <datalist id="register-countries">
                    {COUNTRY_SUGGESTIONS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label className="text-xs font-bold text-navy">Business Registration Number *</Label>
                  <Input required minLength={2} maxLength={60} placeholder="e.g. CIN / company number" value={form.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} className={`mt-1 ${fieldClass}`} />
                </div>
                <div>
                  <Label className="text-xs font-bold text-navy">VAT / Tax ID <span className="text-gray-400 font-semibold">(if applicable)</span></Label>
                  <Input maxLength={60} placeholder="e.g. GSTIN / VAT number" value={form.vatId} onChange={(e) => set("vatId", e.target.value)} className={`mt-1 ${fieldClass}`} />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs font-bold text-navy">Registered Business Address *</Label>
                  <Input required minLength={5} maxLength={300} placeholder="Street, city, postal code, country" value={form.businessAddress} onChange={(e) => set("businessAddress", e.target.value)} className={`mt-1 ${fieldClass}`} />
                </div>
              </div>

              {/* Primary Contact */}
              <SectionTitle>Primary Contact</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-navy">Contact Person Name *</Label>
                  <div className="relative mt-1">
                    <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input required minLength={2} maxLength={100} placeholder="John Doe" value={form.name} onChange={(e) => set("name", e.target.value)} className={iconInput} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-navy">Job Title / Designation *</Label>
                  <Input required minLength={2} maxLength={100} placeholder="e.g. Operations Manager" value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} className={`mt-1 ${fieldClass}`} />
                </div>
                <div>
                  <Label className="text-xs font-bold text-navy">Business Email *</Label>
                  <div className="relative mt-1">
                    <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="email" required maxLength={150} placeholder="you@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} className={iconInput} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-navy">Phone / WhatsApp *</Label>
                  <div className="relative mt-1">
                    <IconPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="tel" required minLength={7} maxLength={30} placeholder="+41 44 123 4567" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={iconInput} />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs font-bold text-navy">Country / City *</Label>
                  <Input required minLength={2} maxLength={150} placeholder="e.g. India / New Delhi" value={form.contactLocation} onChange={(e) => set("contactLocation", e.target.value)} className={`mt-1 ${fieldClass}`} />
                </div>
              </div>

              {/* Login */}
              <SectionTitle>Login</SectionTitle>
              <p className="text-[11px] text-gray-500 font-medium -mt-2">Your business email is your username. Sign-in codes are sent to it.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-navy">Password *</Label>
                  <div className="relative mt-1">
                    <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      maxLength={100}
                      autoComplete="new-password"
                      placeholder="Min 8 chars, letter + number"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className="h-11 rounded-xl pl-10 pr-10 border-gray-200 text-xs font-semibold"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy">
                      {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-navy">Confirm Password *</Label>
                  <div className="relative mt-1">
                    <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      required
                      minLength={8}
                      maxLength={100}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      className="h-11 rounded-xl pl-10 pr-10 border-gray-200 text-xs font-semibold"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy">
                      {showConfirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Verification / Legal */}
              <SectionTitle>Verification &amp; Legal</SectionTitle>
              <p className="text-[11px] text-gray-500 font-medium -mt-2">
                You will upload your company certificate, ID and other documents in the last step, after verifying your email.
              </p>
              <div className="space-y-2.5">
                <label className="flex items-start gap-2.5 text-xs font-semibold text-navy cursor-pointer">
                  <input type="checkbox" checked={form.confirmAuthorized} onChange={(e) => set("confirmAuthorized", e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#C9A227]" />
                  <span>I confirm that I am authorized to register this business. *</span>
                </label>
                <label className="flex items-start gap-2.5 text-xs font-semibold text-navy cursor-pointer">
                  <input type="checkbox" checked={form.acceptTerms} onChange={(e) => set("acceptTerms", e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#C9A227]" />
                  <span>
                    I accept the{" "}
                    <Link href="/terms-and-conditions" target="_blank" className="text-gold underline">Terms &amp; Conditions</Link>. *
                  </span>
                </label>
                <label className="flex items-start gap-2.5 text-xs font-semibold text-navy cursor-pointer">
                  <input type="checkbox" checked={form.acceptPrivacy} onChange={(e) => set("acceptPrivacy", e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#C9A227]" />
                  <span>
                    I accept the{" "}
                    <Link href="/privacy-policy" target="_blank" className="text-gold underline">Privacy Policy</Link>. *
                  </span>
                </label>
                <label className="flex items-start gap-2.5 text-xs font-semibold text-navy cursor-pointer">
                  <input type="checkbox" checked={form.commsConsent} onChange={(e) => set("commsConsent", e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#C9A227]" />
                  <span>I agree to receive operational / service communications (booking updates, confirmations).</span>
                </label>
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
                    <IconUserPlus className="h-4 w-4" /> Register Business Account
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
          <Image
            src="/images/hero_swiss_alps.png"
            alt="Private Chauffeur Transfers Europe"
            width={800}
            height={600}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute top-8 left-8 right-8 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold text-navy px-3.5 py-1 text-xs font-black shadow-md">
              <IconSparkles className="h-3.5 w-3.5" /> B2B Partner Program
            </span>
          </div>

          <div className="absolute bottom-8 left-8 right-8 text-white z-10 space-y-3">
            <h3 className="text-2xl font-black text-white leading-tight">
              Partner With Europe Transfers
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Register your agency or company to manage bookings, track drivers in real-time, and get exclusive fixed chauffeur rates.
            </p>
            <div className="grid grid-cols-1 gap-2 pt-2 text-[11px] font-bold text-gray-200">
              <div className="flex items-center gap-1.5"><IconCheck className="h-4 w-4 text-gold" /> Verified Business Accounts</div>
              <div className="flex items-center gap-1.5"><IconCheck className="h-4 w-4 text-gold" /> Transparent Fixed All-Inclusive Rates</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
