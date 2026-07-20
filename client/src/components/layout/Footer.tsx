import Link from "next/link";
import Image from "next/image";
import { IconMail, IconPhone, IconMapPin, IconBrandInstagram, IconBrandFacebook, IconBrandTwitter, IconBrandLinkedin, IconCheck } from "@tabler/icons-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Our Fleet", href: "/fleet" },
  { label: "Tour Packages", href: "/packages" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const serviceLinks = [
  { label: "Airport Transfers", href: "/fleet" },
  { label: "City Tours", href: "/packages" },
  { label: "Business Travel", href: "/fleet" },
  { label: "Group Transfers", href: "/fleet" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cancellation Policy", href: "#" },
];

const highlights = [
  "Licensed chauffeurs",
  "Premium fleet",
  "24/7 support",
  "Fixed pricing",
];

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link href="/" className="relative flex h-16 w-60 items-center justify-start rounded-2xl bg-white px-4 py-2 shadow-sm">
              <Image
                src="/logo.png"
                alt="The Europe Transfers"
                fill
                className="object-contain p-1"
                priority
              />
            </Link>
            <p className="mt-5 text-sm text-gray-600 leading-relaxed max-w-sm">
              Premium airport transfers, city tours, and curated travel experiences across Europe, UK, and Scandinavia. Safe, reliable, and comfortable travel for every journey.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                  <IconCheck className="h-3 w-3 text-gold" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              {[IconBrandInstagram, IconBrandFacebook, IconBrandTwitter, IconBrandLinkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:border-gold hover:text-gold hover:bg-gold/5 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold tracking-wide text-gray-900 uppercase">Quick Links</h4>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold tracking-wide text-gray-900 uppercase">Services</h4>
            <ul className="mt-5 space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold tracking-wide text-gray-900 uppercase">Get in Touch</h4>
            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-gray-200 flex-shrink-0">
                  <IconMail className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p>info@europetransfers.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-gray-200 flex-shrink-0">
                  <IconPhone className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p>+49 123 456 789</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-gray-200 flex-shrink-0">
                  <IconMapPin className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Coverage</p>
                  <p>Europe, UK & Scandinavia</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} The Europe Transfers. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-gray-500 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
