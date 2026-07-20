import Link from "next/link";
import { IconMail, IconPhone, IconMapPin } from "@tabler/icons-react";

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-serif text-lg font-bold">
              <span className="text-gold">The</span> Europe Transfers
            </h3>
            <p className="mt-3 text-sm text-white/60">
              Premium transfer and tour services across Europe. Safe, reliable, and comfortable travel.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gold">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li><Link href="/fleet" className="hover:text-white transition-colors">Our Fleet</Link></li>
              <li><Link href="/packages" className="hover:text-white transition-colors">Tour Packages</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gold">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><IconMail className="h-4 w-4" /> info@europetransfers.com</li>
              <li className="flex items-center gap-2"><IconPhone className="h-4 w-4" /> +49 123 456 789</li>
              <li className="flex items-center gap-2"><IconMapPin className="h-4 w-4" /> Europe</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gold">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-white/40">
          © {new Date().getFullYear()} The Europe Transfers. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
