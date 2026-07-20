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
import { IconUser, IconMail, IconPhone, IconLock } from "@tabler/icons-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Registration successful! Please login.");
      router.push("/auth/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Create Account</CardTitle>
          <CardDescription>Join Europe Transfers today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label><IconUser className="mr-1 inline h-4 w-4" /> Name</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label><IconMail className="mr-1 inline h-4 w-4" /> Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label><IconPhone className="mr-1 inline h-4 w-4" /> Phone</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label><IconLock className="mr-1 inline h-4 w-4" /> Password</Label>
              <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label><IconLock className="mr-1 inline h-4 w-4" /> Confirm Password</Label>
              <Input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" variant="gold" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link href="/auth/login" className="text-gold hover:underline">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
