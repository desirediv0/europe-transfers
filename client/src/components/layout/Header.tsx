"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useCurrency, type CurrencyCode } from "@/context/CurrencyContext";
import {
  IconMenu2,
  IconLogout,
  IconCar,
  IconPackage,
  IconPhone,
  IconInfoCircle,
  IconHome,
  IconLogin,
  IconUserCircle,
  IconClock,
  IconCompass,
  IconArrowRight,
  IconHeadset,
} from "@tabler/icons-react";

const navLinks = [
  { label: "Home", href: "/", icon: IconHome },
  { label: "Private Transfers", href: "/private-transfers", icon: IconCar },
  { label: "Van & Coach", href: "/van-coach", icon: IconClock },
  { label: "Packages", href: "/packages", icon: IconPackage },
  { label: "Sightseeing", href: "/sightseeing", icon: IconCompass },
  { label: "Blog", href: "/blog", icon: IconInfoCircle },
  { label: "Contact", href: "/contact", icon: IconPhone },
];


function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
      <SelectTrigger className={cn("h-8 sm:h-9 w-17.5 sm:w-19.5 rounded-xl border-gray-200/80 bg-white px-2.5 text-xs font-bold text-navy", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={6} align="end" className="min-w-22.5 z-60 bg-white">
        <SelectItem value="EUR">EUR €</SelectItem>
        <SelectItem value="USD">USD $</SelectItem>
        <SelectItem value="INR">INR ₹</SelectItem>
      </SelectContent>
    </Select>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleNav = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-navy hover:bg-navy/5 p-0">
          <IconMenu2 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-white">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <Link href="/" onClick={handleNav} className="relative h-10 w-40 shrink-0">
            <Image src="/logo-2.jpeg" alt="The Europe Transfers" fill className="object-contain" priority />
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={handleNav}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                pathname === link.href
                  ? "bg-gold/15 text-navy font-black border border-gold/30"
                  : "text-gray-600 hover:bg-gray-50 hover:text-navy"
              )}
            >
              <link.icon className="h-4.5 w-4.5 text-gold" />
              {link.label}
            </Link>
          ))}

          <div className="my-3 h-px bg-gray-100" />

          <div className="px-4 pb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Currency</span>
            <CurrencySwitcher />
          </div>

          <a
            href="tel:+41441234567"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-navy bg-slate-50 border border-gray-100"
          >
            <IconHeadset className="h-4.5 w-4.5 text-gold" />
            <span>Call Now: +41 44 123 4567</span>
          </a>

          {user ? (
            <>
              <Link
                href="/account"
                onClick={handleNav}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold text-navy hover:bg-gray-50"
              >
                <IconUserCircle className="h-4.5 w-4.5 text-gold" /> My Bookings
              </Link>
              <button
                onClick={() => { logout(); handleNav(); }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600"
              >
                <IconLogout className="h-4.5 w-4.5" /> Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link href="/auth/login" onClick={handleNav} className="block">
                <Button className="w-full h-11 rounded-xl bg-navy hover:bg-navy-light font-extrabold text-white">
                  <IconLogin className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>

            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-300 mx-auto",
        scrolled
          ? "top-2 sm:top-4 w-[95%] sm:w-[92%] max-w-7xl bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100"
          : "top-0 w-full bg-white border-b border-gray-100/60"
      )}
    >
      <div className="mx-auto flex h-14 sm:h-18 max-w-7xl items-center justify-between px-2.5 sm:px-5 lg:px-6">

        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <MobileNav />
          <Link href="/" className="relative h-8 sm:h-10 w-28 sm:w-36 shrink-0">
            <Image
              src="/logo-2.jpeg"
              alt="The Europe Transfers"
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-slate-50/90 rounded-2xl px-1.5 py-1 border border-gray-100">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-navy text-gold shadow-sm font-extrabold"
                    : "text-gray-600 hover:text-navy hover:bg-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">

          {/* Currency Switcher */}
          <CurrencySwitcher />

          {/* Call Now Button Pill */}
          <a
            href="tel:+41441234567"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2 text-xs font-bold text-navy hover:border-gold transition-all"
            title="Call Support"
          >
            <IconHeadset className="h-4 w-4 text-gold" />
            <span className="hidden lg:inline">+41 44 123 4567</span>
            <span className="lg:hidden">Call</span>
          </a>

          {/* User Auth or Sign In / Book Now */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/account"
                className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-black text-navy bg-gold/15 hover:bg-gold/30 border border-gold/30 transition-all shadow-sm"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-navy font-black text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>My Bookings</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                onClick={logout}
                title="Logout"
              >
                <IconLogout className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="h-8 sm:h-10 rounded-xl px-2.5 sm:px-3.5 text-xs font-bold text-navy hover:bg-slate-100">
                  Sign In
                </Button>
              </Link>


            </div>
          )}

        </div>

      </div>
    </header>
  );
}
