"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Package } from "@/lib/types";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ items: Package[] }>("/packages?limit=50").then((d) => setPackages(d.items)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold">Tour Packages</h1>
      <p className="mt-1 text-muted-foreground">Curated travel experiences across Europe</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="p-0"><Skeleton className="h-48 w-full rounded-t-xl" /><div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></CardContent></Card>
            ))
          : packages.map((pkg) => (
              <Link key={pkg.id} href={`/packages/${pkg.slug}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative h-48 bg-muted">
                    {pkg.coverImage && <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover" />}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="gold">{pkg.durationDays} Days</Badge>
                      {pkg.country && <Badge variant="outline">{pkg.country.name}</Badge>}
                    </div>
                    <h3 className="mt-2 font-serif text-lg font-bold">{pkg.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{pkg.summary}</p>
                    {pkg.priceFrom && (
                      <div className="mt-3">
                        <span className="text-sm text-muted-foreground">From </span>
                        <span className="text-lg font-bold text-gold">€{Number(pkg.priceFrom).toFixed(0)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  );
}
