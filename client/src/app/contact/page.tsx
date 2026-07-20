"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { IconSend, IconPhone, IconMail, IconMapPin } from "@tabler/icons-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", pax: 1, travelDate: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/bookings", {
        ...form,
        rateSnapshot: { label: "Enquiry", price: 0, currency: "EUR" },
      });
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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold">Contact Us</h1>
      <p className="mt-1 text-muted-foreground">Have a question or want to book? Get in touch.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm"><IconPhone className="h-5 w-5 text-gold" /> +49 123 456 789</div>
          <div className="flex items-center gap-3 text-sm"><IconMail className="h-5 w-5 text-gold" /> info@europetransfers.com</div>
          <div className="flex items-center gap-3 text-sm"><IconMapPin className="h-5 w-5 text-gold" /> Europe</div>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send an Enquiry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Travel Date</Label>
                  <Input type="date" value={form.travelDate} onChange={(e) => update("travelDate", e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Number of Passengers</Label>
                <Input type="number" min={1} value={form.pax} onChange={(e) => update("pax", Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <textarea
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                />
              </div>
              <Button type="submit" variant="gold" disabled={loading}>
                <IconSend className="mr-2 h-4 w-4" />
                {loading ? "Sending..." : "Send Enquiry"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
