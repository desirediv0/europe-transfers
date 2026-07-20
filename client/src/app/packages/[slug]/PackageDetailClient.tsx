"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Package } from "@/lib/types";
import {
  IconCalendar,
  IconMapPin,
  IconArrowLeft,
  IconCheck,
  IconMail,
  IconPhone,
  IconUsers,
  IconClock,
  IconShieldCheck,
} from "@tabler/icons-react";

interface Props {
  pkg: Package;
}

const gradientPairs = [
  ["from-rose-400", "to-orange-400"],
  ["from-violet-500", "to-purple-500"],
  ["from-blue-400", "to-cyan-400"],
  ["from-emerald-400", "to-teal-500"],
  ["from-amber-400", "to-yellow-500"],
  ["from-pink-400", "to-rose-500"],
];

function hashGradient(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  return gradientPairs[Math.abs(hash) % gradientPairs.length];
}

const highlights = [
  "Private guided tours",
  "Hotel pickup & drop-off",
  "Professional local guides",
  "Flexible itinerary",
  "24/7 travel support",
];

export function PackageDetailClient({ pkg }: Props) {
  const fallback = hashGradient(pkg.title);
  const hasImage = !!pkg.coverImage;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/40 z-10" />
        {!hasImage && (
          <div className={`absolute inset-0 bg-gradient-to-br ${fallback[0]} ${fallback[1]} opacity-30`} />
        )}
        {hasImage && (
          <Image
            src={pkg.coverImage!}
            alt={pkg.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30 z-10" />
        <div className="absolute top-20 right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />

        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/20 hover:text-white transition-colors mb-8"
          >
            <IconArrowLeft className="h-4 w-4" /> Back to Packages
          </Link>

          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="gold" className="rounded-full px-4 py-1.5 text-sm font-semibold">
              <IconCalendar className="mr-1.5 h-4 w-4" /> {pkg.durationDays} Days
            </Badge>
            {pkg.country && (
              <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm font-semibold bg-white/10 text-white border-white/20 backdrop-blur-md">
                <IconMapPin className="mr-1.5 h-4 w-4" /> {pkg.country.name}
              </Badge>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-3xl">
            {pkg.title}
          </h1>

          {pkg.summary && (
            <p className="mt-6 text-lg text-white/60 max-w-2xl leading-relaxed">{pkg.summary}</p>
          )}

          {pkg.priceFrom && (
            <div className="mt-8 inline-flex items-baseline gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4">
              <span className="text-white/60">Starting from</span>
              <span className="text-4xl font-bold text-gold">€{Number(pkg.priceFrom).toFixed(0)}</span>
              <span className="text-white/50">/ person</span>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 lg:grid-cols-3 lg:items-start">
          {/* Main */}
          <div className="lg:col-span-2 space-y-10">
            {/* Highlights */}
            <Card className="border-border/40 overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-5">Package Highlights</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {highlights.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 flex-shrink-0">
                        <IconCheck className="h-3.5 w-3.5 text-gold" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Itinerary */}
            {pkg.itineraryDays && pkg.itineraryDays.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Day-by-Day Itinerary</h2>
                <Accordion type="multiple" className="w-full space-y-3">
                  {pkg.itineraryDays.map((day) => (
                    <AccordionItem
                      key={day.id}
                      value={day.id}
                      className="border border-border/50 rounded-2xl px-6 data-[state=open]:border-gold/30 data-[state=open]:shadow-md transition-all"
                    >
                      <AccordionTrigger className="text-left py-5 hover:no-underline">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold font-bold text-sm">
                            D{day.dayNumber}
                          </div>
                          <span className="font-semibold text-base">
                            <span className="text-gold">Day {day.dayNumber}:</span> {day.title}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-5 pl-14">
                        {day.description}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <Card className="border-border/40 overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Book This Package</h3>
                  <p className="text-sm text-muted-foreground mt-1">Send an enquiry and our team will customize it for you.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <IconClock className="h-5 w-5 text-gold" />
                    <span>{pkg.durationDays} days / {pkg.durationDays - 1} nights</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <IconUsers className="h-5 w-5 text-gold" />
                    <span>Private group options</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <IconShieldCheck className="h-5 w-5 text-gold" />
                    <span>Fully insured experience</span>
                  </div>
                </div>

                <div className="pt-5 border-t border-border/50">
                  {pkg.priceFrom && (
                    <div className="mb-4">
                      <span className="text-sm text-muted-foreground">From </span>
                      <span className="text-3xl font-bold text-gold">€{Number(pkg.priceFrom).toFixed(0)}</span>
                      <span className="text-sm text-muted-foreground"> / person</span>
                    </div>
                  )}
                  <Link href="/contact">
                    <Button variant="gold" size="lg" className="w-full rounded-xl">
                      Enquire Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-gradient-to-br from-navy to-navy-light text-white overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold">Need Help?</h3>
                <p className="text-sm text-white/60">Our travel experts are available to help plan your perfect trip.</p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <IconPhone className="h-4 w-4 text-gold" />
                    <span>+49 123 456 789</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <IconMail className="h-4 w-4 text-gold" />
                    <span>info@europetransfers.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
