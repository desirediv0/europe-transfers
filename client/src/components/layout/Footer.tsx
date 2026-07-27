"use client";

import Link from "next/link";
import Image from "next/image";
import {
  IconMail,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconArrowUp,
  IconHeart,
} from "@tabler/icons-react";

function handleScrollTop() {
  if (typeof window !== "undefined") {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  }
}

const navigation = {
  sections: [
    {
      id: "services",
      name: "Services",
      items: [
        { name: "Airport Transfers", href: "/fleet" },
        { name: "Intercity Transfers", href: "/fleet" },
        { name: "Chauffeur By Hour", href: "/fleet" },
        { name: "Private VIP Tours", href: "/packages" },
      ],
    },
    {
      id: "destinations",
      name: "Destinations",
      items: [
        { name: "Paris & France", href: "/rates" },
        { name: "Swiss Alps & Zurich", href: "/rates" },
        { name: "Amalfi & Rome", href: "/rates" },
        { name: "Milan & Venice", href: "/rates" },
        { name: "Vienna & Prague", href: "/rates" },
      ],
    },
    {
      id: "fleet",
      name: "Fleet",
      items: [
        { name: "Mercedes S-Class", href: "/fleet" },
        { name: "Mercedes V-Class Van", href: "/fleet" },
        { name: "Executive Sedans", href: "/fleet" },
        { name: "Private Minibuses", href: "/fleet" },
      ],
    },
    {
      id: "company",
      name: "Company",
      items: [
        { name: "About Us", href: "/about" },
        { name: "Leadership Team", href: "/about" },
        { name: "Fleet Standards", href: "/fleet" },
        { name: "Tour Packages", href: "/packages" },
      ],
    },
    {
      id: "support",
      name: "Support",
      items: [
        { name: "24/7 Concierge Desk", href: "/contact" },
        { name: "Flight Tracking Policy", href: "/about" },
        { name: "Booking Guide", href: "/contact" },
        { name: "Contact Us", href: "/contact" },
      ],
    },
    {
      id: "legal",
      name: "Legal",
      items: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Licensing & Permits", href: "#" },
        { name: "Cancellation Policy", href: "#" },
      ],
    },
  ],
};

const Underline = "hover:-translate-y-1 border border-dotted border-gray-300 rounded-xl p-2.5 transition-all text-navy hover:text-gold hover:border-gold bg-white shadow-sm flex items-center justify-center cursor-pointer";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white text-navy px-2 sm:px-4 pt-10 pb-8 font-sans">

      {/* Top Header Logo & Brand Intro */}
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-6 p-6 sm:p-10 pb-6 md:flex">
        <Link href="/">
          <div className="flex items-center justify-center">
            <Image
              src="/logo-2.jpeg"
              alt="Europe Transfers Logo"
              width={200}
              height={50}
              className="h-12 md:h-16 w-auto object-contain"
              priority
            />
          </div>
        </Link>
        <p className="bg-transparent text-center text-xs leading-5 text-gray-600 md:text-left max-w-3xl font-medium">
          Welcome to <strong className="text-navy font-bold">Europe Transfers</strong>, where luxury chauffeuring meets reliability and punctuality across Europe. We specialize in crafting bespoke airport transfers, intercity long-distance rides, and curated VIP tour packages across France, Switzerland, Italy, and Scandinavia. Our mission is to empower travelers with effortless, comfortable, and first-class transportation.
        </p>
      </div>

      {/* Structured Navigation Categories Grid with Dotted Dividers */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="border-b border-dotted border-gray-300" />

        <div className="py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 leading-6">
            {navigation.sections.map((section) => (
              <div key={section.id}>
                <h4 className="text-xs font-black uppercase tracking-wider text-navy mb-3 border-b border-gold/40 pb-1.5 inline-block">
                  {section.name}
                </h4>
                <ul role="list" className="flex flex-col space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item.name} className="flow-root">
                      <Link
                        href={item.href}
                        className="text-xs font-medium text-gray-600 hover:text-gold transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-dotted border-gray-300" />
      </div>

      {/* Dotted Social Icon Pills & Back To Top Control Bar */}
      <div className="flex flex-wrap justify-center items-center gap-6 py-6">
        <div className="flex flex-wrap items-center justify-center gap-3 px-4">
          <Link
            aria-label="Email Us"
            href="mailto:info@europetransfers.com"
            className={Underline}
            title="Email"
          >
            <IconMail strokeWidth={1.5} className="h-5 w-5" />
          </Link>
          <Link
            aria-label="Twitter / X"
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            className={Underline}
            title="Twitter / X"
          >
            <IconBrandTwitter className="h-5 w-5" />
          </Link>
          <Link
            aria-label="Instagram"
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className={Underline}
            title="Instagram"
          >
            <IconBrandInstagram className="h-5 w-5" />
          </Link>
          <Link
            aria-label="WhatsApp Concierge"
            href="https://wa.me/"
            target="_blank"
            rel="noreferrer"
            className={Underline}
            title="WhatsApp"
          >
            <IconBrandWhatsapp className="h-5 w-5" />
          </Link>
          <Link
            aria-label="Facebook"
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className={Underline}
            title="Facebook"
          >
            <IconBrandFacebook className="h-5 w-5" />
          </Link>
          <Link
            aria-label="LinkedIn"
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className={Underline}
            title="LinkedIn"
          >
            <IconBrandLinkedin className="h-5 w-5" />
          </Link>
        </div>

        {/* Back To Top Dotted Button */}
        <div className="flex items-center rounded-full border border-dotted border-gray-300 p-1 bg-slate-50 shadow-sm">
          <button
            type="button"
            onClick={handleScrollTop}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-navy hover:bg-navy hover:text-white transition-all cursor-pointer"
            title="Scroll to Top"
          >
            <IconArrowUp className="h-4 w-4 text-gold" />
            <span>Back to Top</span>
          </button>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="mx-auto mt-6 flex flex-col justify-between text-center text-xs text-gray-500 max-w-7xl font-medium">
        <div className="flex flex-row items-center justify-center gap-1.5 flex-wrap">
          <span>© {new Date().getFullYear()}</span>
          <span>•</span>
          <span>Made with</span>
          <IconHeart className="text-red-500 h-4 w-4 fill-red-500 animate-pulse" />
          <span>by</span>
          <Link href="/" className="font-bold text-navy hover:text-gold transition-colors">
            The Europe Transfers Team
          </Link>
          <span>— First-Class Chauffeured Services Across Europe</span>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
