"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <IconMenu2 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-navy text-white">
        <nav className="flex flex-col gap-2 mt-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href ? "bg-gold text-navy" : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <div className="my-2 h-px bg-white/10" />
          {user ? (
            <>
              <Link href="/account" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                <IconUser className="h-4 w-4" /> My Account
              </Link>
              <button onClick={logout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                <IconLogout className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
              <IconUser className="h-4 w-4" /> Login
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

  return (
    <header className="sticky top-0 z-50 bg-navy text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight">
              <span className="text-gold">The</span> Europe Transfers
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href ? "bg-gold text-navy" : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/account" className="hidden sm:flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white">
                <IconUser className="h-4 w-4" />
                {user.name}
              </Link>
              <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/10 hover:text-white" onClick={logout}>
                <IconLogout className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="gold" size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
