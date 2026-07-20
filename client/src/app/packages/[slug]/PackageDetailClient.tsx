"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Package } from "@/lib/types";
import { IconCalendar, IconMapPin, IconArrowLeft } from "@tabler/icons-react";

interface Props {
  pkg: Package;
}

export function PackageDetailClient({ pkg }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/packages" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <IconArrowLeft className="h-4 w-4" /> Back to Packages
      </Link>

      <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden bg-muted">
        {pkg.coverImage && <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover" />}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge variant="gold"><IconCalendar className="mr-1 h-3 w-3" /> {pkg.durationDays} Days</Badge>
        {pkg.country && <Badge variant="outline"><IconMapPin className="mr-1 h-3 w-3" /> {pkg.country.name}</Badge>}
      </div>

      <h1 className="mt-4 font-serif text-3xl font-bold">{pkg.title}</h1>

      {pkg.priceFrom && (
        <div className="mt-3">
          <span className="text-muted-foreground">From </span>
          <span className="text-2xl font-bold text-gold">€{Number(pkg.priceFrom).toFixed(0)}</span>
          <span className="text-muted-foreground"> / person</span>
        </div>
      )}

      {pkg.summary && <p className="mt-4 text-muted-foreground leading-relaxed">{pkg.summary}</p>}

      {pkg.itineraryDays && pkg.itineraryDays.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-xl font-bold mb-4">Day-by-Day Itinerary</h2>
          <Accordion type="multiple" className="w-full">
            {pkg.itineraryDays.map((day) => (
              <AccordionItem key={day.id} value={day.id}>
                <AccordionTrigger className="text-left">
                  <span><span className="text-gold font-bold">Day {day.dayNumber}:</span> {day.title}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {day.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      <div className="mt-8">
        <Link href="/contact">
          <Button variant="gold" size="lg">Enquire About This Package</Button>
        </Link>
      </div>
    </div>
  );
}
