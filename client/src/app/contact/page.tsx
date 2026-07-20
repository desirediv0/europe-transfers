"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  IconSend,
  IconPhone,
  IconMail,
  IconMapPin,
  IconClock,
  IconHeadset,
  IconMessageCircle,
} from "@tabler/icons-react";

const contactInfo = [
  { icon: IconMail, label: "Email", value: "info@europetransfers.com" },
  { icon: IconPhone, label: "Phone", value: "+49 123 456 789" },
  { icon: IconMapPin, label: "Coverage", value: "Europe-wide service" },
  { icon: IconClock, label: "Hours", value: "24/7 Customer support" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", pax: 1, travelDate: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/bookings", { ...form, rateSnapshot: { label: "Enquiry", price: 0, currency: "EUR" } });
      toast.success("Enquiry submitted! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "", pax: 1, travelDate: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string | number) => setForm({ ...form, [field]: value });

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-light/30" />
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gold/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold mb-6">
            <IconHeadset className="h-4 w-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Contact <span className="text-gold">Us</span>
          </h1>
          <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto">
            Have a question or want a custom booking? Our travel experts are here to help you plan the perfect trip.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-10 lg:grid-cols-3 lg:items-start">
          {/* Info Sidebar */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold tracking-[0.15em] text-gold uppercase">Contact Info</span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Let&apos;s Talk</h2>
              <p className="mt-2 text-sm text-muted-foreground">Reach out through any of these channels.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {contactInfo.map((item) => (
                <Card
                  key={item.label}
                  className="border-border/40 rounded-2xl transition-all hover:border-gold/20 hover:shadow-lg"
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 flex-shrink-0">
                      <item.icon className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">{item.label}</p>
                      <p className="text-base font-medium mt-0.5">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border/40 rounded-2xl bg-gradient-to-br from-navy to-navy-light text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <IconMessageCircle className="h-5 w-5 text-gold" />
                  <h3 className="font-semibold">Prefer messaging?</h3>
                </div>
                <p className="text-sm text-white/60">Send us a quick message and we&apos;ll respond within the hour during business hours.</p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card className="lg:col-span-2 border-border/40 rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Send an Enquiry</h2>
                <p className="text-sm text-muted-foreground mt-1">Fill in your details and we&apos;ll get back to you shortly.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={form.name} onChange={(e) => update("name", e.target.value)} required className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="rounded-lg" />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Travel Date</Label>
                    <Input type="date" value={form.travelDate} onChange={(e) => update("travelDate", e.target.value)} required className="rounded-lg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Number of Passengers</Label>
                  <Input type="number" min={1} value={form.pax} onChange={(e) => update("pax", Number(e.target.value))} required className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <textarea
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    rows={5}
                    className="flex w-full rounded-lg border border-input bg-transparent px-3 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  />
                </div>
                <Button type="submit" variant="gold" disabled={loading} className="rounded-full px-8">
                  <IconSend className="mr-2 h-4 w-4" />
                  {loading ? "Sending..." : "Send Enquiry"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
