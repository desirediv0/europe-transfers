import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  MapPin,
  Car,
  Route,
  Package,
  CalendarCheck,
  Users,
  Star,
  Upload,
  LogOut,
  Menu,
  ChevronLeft,
  FileSearch,
  FileText,
  FolderTree,
  Tag,
  Bus,
  Compass,
  CreditCard,
  Ship,
  Settings,
  Briefcase,
} from "lucide-react";

const topNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Homepage Settings", icon: Settings, href: "/homepage-settings" },
];

// Everything below powers /private-transfers on the website (uses Location/CarType/Route/Booking models)
const privateTransfersNavItems = [
  { label: "Locations (Private Transfers)", icon: MapPin, href: "/locations" },
  { label: "Car Types (Private Transfers)", icon: Car, href: "/car-types" },
  { label: "Routes & Prices (Private Transfers)", icon: Route, href: "/routes" },
  { label: "Bookings (Private Transfers)", icon: CalendarCheck, href: "/bookings" },
];

const vanCoachNavItems = [
  { label: "Van & Coach", icon: Bus, href: "/van-coach" },
  { label: "Van & Coach Orders", icon: Ship, href: "/fleet-orders" },
];

const packagesNavItems = [
  { label: "Packages", icon: Package, href: "/packages" },
];

const sightseeingNavItems = [
  { label: "Sightseeing", icon: Compass, href: "/sightseeing" },
  { label: "Sightseeing Orders", icon: CreditCard, href: "/sightseeing-orders" },
];

const careersNavItems = [
  { label: "Jobs", icon: Briefcase, href: "/careers" },
  { label: "Applicants", icon: Users, href: "/careers/applicants" },
];

const otherNavItems = [
  { label: "Users (KYC)", icon: Users, href: "/users" },
  { label: "Testimonials", icon: Star, href: "/testimonials" },
  { label: "Uploads", icon: Upload, href: "/uploads" },
];

const blogNavItems = [
  { label: "SEO Pages", icon: FileSearch, href: "/seo-pages" },
  { label: "All Posts", icon: FileText, href: "/blog/posts" },
  { label: "Categories", icon: FolderTree, href: "/blog/categories" },
  { label: "Tags", icon: Tag, href: "/blog/tags" },
];


function SidebarContent({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const { logout } = useAuth();

  const renderLink = (item: { label: string; icon: any; href: string }) => {
    const isActive =
      location.pathname === item.href ||
      (item.href !== "/" && location.pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md mx-2 px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-[#C9A227] text-[#1B2A4A]"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const renderSection = (title: string, items: typeof topNavItems) => (
    <div className="mt-4 pt-4 border-t border-white/10 first:mt-0 first:pt-0 first:border-t-0">
      {!collapsed && (
        <div className="px-5 mb-2 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
          {title}
        </div>
      )}
      <div className="space-y-1">{items.map(renderLink)}</div>
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-[#1B2A4A]">
      <div className="flex h-14 items-center justify-between px-4">
        {!collapsed && <span className="text-lg font-bold text-white">Europe Transfers</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-white hover:bg-white/10">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <Separator className="bg-white/10" />
      <ScrollArea className="flex-1 py-2">
        <div className="space-y-1">
          {topNavItems.map(renderLink)}
        </div>

        {renderSection("Private Transfers (/private-transfers)", privateTransfersNavItems)}
        {renderSection("Van & Coach (/van-coach)", vanCoachNavItems)}
        {renderSection("Packages (/packages)", packagesNavItems)}
        {renderSection("Sightseeing (/sightseeing)", sightseeingNavItems)}
        {renderSection("Careers (/careers)", careersNavItems)}
        {renderSection("Users & Site", otherNavItems)}
        {renderSection("Blog", blogNavItems)}
      </ScrollArea>

      <Separator className="bg-white/10" />
      <div className="p-2">
        <Button
          variant="ghost"
          className={cn("w-full text-white/70 hover:bg-white/10 hover:text-white", collapsed && "px-2")}
          onClick={logout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-3 z-40 md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <aside className="hidden md:block">
        <div className={cn("fixed inset-y-0 left-0 z-30 transition-all duration-300", collapsed ? "w-16" : "w-60")}>
          <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SidebarContent collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function AdminHeader() {
  const { admin } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{admin?.name}</span>
        <span className="rounded-full bg-[#1B2A4A] px-2 py-0.5 text-xs text-white">{admin?.role}</span>
      </div>
    </header>
  );
}
