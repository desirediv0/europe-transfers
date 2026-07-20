"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { IconMail, IconKey, IconArrowLeft, IconShieldCheck, IconLoader2 } from "@tabler/icons-react";

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { login, requestOtp } = useAuth();
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOtp(email);
      toast.success("OTP sent to your email");
      setStep("otp");
      setResendTimer(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
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
      toast.success("OTP resent");
      setResendTimer(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = code.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await login(email, otpCode);
      toast.success("Welcome back!");
      router.push("/account");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-xl shadow-black/5 border-border/40 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-gold via-gold-light to-gold" />
          <CardHeader className="text-center pt-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 mb-4">
              <IconShieldCheck className="h-7 w-7 text-gold" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="mt-2">
              {step === "email"
                ? "Enter your email to receive a secure login code"
                : `Enter the 6-digit code sent to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            {step === "email" ? (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <IconMail className="h-4 w-4 text-gold" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="h-12 rounded-lg"
                  />
                </div>
                <Button type="submit" variant="gold" className="w-full h-12 text-base font-semibold rounded-lg" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <IconLoader2 className="h-4 w-4 animate-spin" /> Sending...
                    </span>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="font-semibold text-gold hover:underline">
                    Register
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="code" className="flex items-center gap-2">
                    <IconKey className="h-4 w-4 text-gold" /> OTP Code
                  </Label>
                  <div className="flex justify-between gap-2">
                    {code.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="h-14 w-full text-center text-xl font-bold rounded-lg p-0"
                        required
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" variant="gold" className="w-full h-12 text-base font-semibold rounded-lg" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <IconLoader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <Button type="button" variant="ghost" className="h-auto px-0 text-muted-foreground hover:text-foreground" onClick={() => setStep("email")}>
                    <IconArrowLeft className="mr-1 h-4 w-4" /> Change Email
                  </Button>
                  {resendTimer > 0 ? (
                    <span className="text-muted-foreground">Resend in {resendTimer}s</span>
                  ) : (
                    <Button type="button" variant="ghost" className="h-auto px-0 text-gold hover:text-gold" onClick={handleResend} disabled={loading}>
                      Resend OTP
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
