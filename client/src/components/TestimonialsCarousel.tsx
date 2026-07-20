"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Testimonial } from "@/lib/types";
import { IconStar, IconQuote } from "@tabler/icons-react";

export default function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: true, dragFree: false },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  useEffect(() => {
    api
      .get<{ items: Testimonial[] }>("/testimonials?limit=20")
      .then((data) => setTestimonials(data.items.filter((t) => t.isPublished)))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-10 w-72 mx-auto mt-4" />
          <Skeleton className="h-5 w-96 mx-auto mt-3" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/40">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-muted/30 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.15em] text-gold uppercase">Testimonials</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">What Our Travelers Say</h2>
          <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real experiences from travelers who explored Europe with us.
          </p>
        </div>

        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex -ml-4">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <Card className="h-full border-border/40 bg-white transition-all hover:shadow-lg hover:border-gold/20">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IconStar
                          key={i}
                          className={`h-4 w-4 ${i < item.rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>

                    <div className="mb-4">
                      <IconQuote className="h-8 w-8 text-gold/20" />
                    </div>

                    <p className="text-sm sm:text-base text-foreground leading-relaxed flex-1">
                      &ldquo;{item.message}&rdquo;
                    </p>

                    <div className="mt-6 pt-5 border-t border-border/50 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white text-sm font-bold">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Verified Traveler</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === selectedIndex ? "w-6 bg-gold" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
