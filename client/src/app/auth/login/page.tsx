"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { IconMail, IconKey, IconArrowLeft } from "@tabler/icons-react";

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, requestOtp } = useAuth();
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOtp(email);
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, code);
      toast.success("Logged in successfully");
      router.push("/account");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            {step === "email" ? "Enter your email to receive a login code" : `Enter the 6-digit code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email"><IconMail className="mr-1 inline h-4 w-4" /> Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account? <Link href="/auth/register" className="text-gold hover:underline">Register</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code"><IconKey className="mr-1 inline h-4 w-4" /> OTP Code</Label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="000000" maxLength={6} className="text-center text-lg tracking-[0.5em]" />
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Login"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("email")}>
                <IconArrowLeft className="mr-2 h-4 w-4" /> Change Email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
