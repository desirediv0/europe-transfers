"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  IconBriefcase,
  IconMapPin,
  IconClock,
  IconArrowRight,
  IconLoader2,
} from "@tabler/icons-react";

interface Job {
  id: string;
  title: string;
  slug: string;
  location: string;
  type: string;
  description: string;
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ items: Job[] }>("/jobs?limit=100")
      .then((res) => setJobs(res.items))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50/50 min-h-screen font-sans">
      {/* Hero */}
      <section className="relative bg-[#060C17] text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0B1426]/90 to-black/80 z-10" />
        <div className="absolute top-10 right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
        <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-black text-gold uppercase tracking-wider mb-6 border border-gold/30">
            <IconBriefcase className="h-4 w-4 text-gold" />
            Careers at Europe Transfers
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Join Our <span className="text-gold">First-Class</span> Team
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
            We&apos;re always looking for talented chauffeurs, concierge planners, and operations professionals to help deliver luxury travel across Europe.
          </p>
        </div>
      </section>

      {/* Job List */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <IconLoader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-medium">No open positions right now. Please check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/careers/${job.slug}`}
                className="block bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-gold/30 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-navy group-hover:text-gold transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <IconMapPin className="h-4 w-4 text-gold" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <IconClock className="h-4 w-4 text-gold" /> {job.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="shrink-0 inline-flex items-center gap-1.5 text-xs font-black text-navy uppercase tracking-wider">
                    View & Apply <IconArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
