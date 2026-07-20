"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import {
  IconMenu2,
  IconUser,
  IconLogout,
  IconCar,
  IconPackage,
  IconPhone,
  IconInfoCircle,
  IconHome,
} from "@tabler/icons-react";

const navLinks = [
  { label: "Home", href: "/", icon: IconHome },
  { label: "Fleet", href: "/fleet", icon: IconCar },
  { label: "Packages", href: "/packages", icon: IconPackage },
  { label: "About", href: "/about", icon: IconInfoCircle },
  { label: "Contact", href: "/contact", icon: IconPhone },
];

function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleNav = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white/80 hover:text-white hover:bg-white/10">
          <IconMenu2 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-navy border-navy-lighter">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <Link
            href="/"
            onClick={handleNav}
            className="relative flex h-12 w-44 items-center justify-center rounded-xl bg-white px-3 py-1 shadow-sm"
          >
            <Image
              src="/logo.png"
              alt="The Europe Transfers"
              fill
              className="object-contain p-1"
              priority
            />
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleNav}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all",
                pathname === link.href
                  ? "bg-gold/10 text-gold"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <div className="my-3 h-px bg-white/10" />
          {user ? (
            <>
              <Link
                href="/account"
                onClick={handleNav}
                className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
              >
                <IconUser className="h-4 w-4" /> My Account
              </Link>
              <button
                onClick={() => { logout(); handleNav(); }}
                className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
              >
                <IconLogout className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" onClick={handleNav}>
              <Button variant="gold" className="w-full mt-1">Login</Button>
            </Link>
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-navy",
        scrolled && "glass shadow-lg shadow-black/10 border-b border-white/5"
      )}
    >
      <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 lg:gap-8">
          <MobileNav />
          <Link href="/" className="relative h-10 sm:h-12 w-32 sm:w-44 shrink-0">
            <Image
              src="/logo-2.jpeg"
              alt="The Europe Transfers"
              fill
              className="object-contain"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  pathname === link.href
                    ? "text-gold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-gold" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                  <IconUser className="h-3.5 w-3.5" />
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10"
                onClick={logout}
              >
                <IconLogout className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="gold" size="sm" className="rounded-lg px-4">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
