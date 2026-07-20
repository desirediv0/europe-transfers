import Link from "next/link";
import { IconMail, IconPhone, IconMapPin, IconCar, IconBrandInstagram, IconBrandFacebook, IconBrandTwitter } from "@tabler/icons-react";

const quickLinks = [
  { label: "Our Fleet", href: "/fleet" },
  { label: "Tour Packages", href: "/packages" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cancellation Policy", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-light/30" />
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 transition-colors group-hover:bg-gold/20">
                  <IconCar className="h-5 w-5 text-gold" />
                </div>
                <span className="font-semibold text-white tracking-tight text-lg">
                  The <span className="text-gold">Europe</span> Transfers
                </span>
              </Link>
              <p className="mt-5 text-sm text-white/50 leading-relaxed max-w-sm">
                Premium airport transfers, city tours, and curated travel experiences across Europe. Safe, reliable, and comfortable travel for every journey.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-gold/10 hover:text-gold transition-all">
                  <IconBrandInstagram className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-gold/10 hover:text-gold transition-all">
                  <IconBrandFacebook className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-gold/10 hover:text-gold transition-all">
                  <IconBrandTwitter className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-sm font-semibold text-white tracking-wide uppercase">Quick Links</h4>
              <ul className="mt-4 space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/45 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h4 className="text-sm font-semibold text-white tracking-wide uppercase">Get in Touch</h4>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3 text-sm text-white/45">
                  <IconMail className="h-4 w-4 mt-0.5 text-gold/60 flex-shrink-0" />
                  <span>info@europetransfers.com</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white/45">
                  <IconPhone className="h-4 w-4 mt-0.5 text-gold/60 flex-shrink-0" />
                  <span>+49 123 456 789</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white/45">
                  <IconMapPin className="h-4 w-4 mt-0.5 text-gold/60 flex-shrink-0" />
                  <span>Europe-wide service coverage</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} The Europe Transfers. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
