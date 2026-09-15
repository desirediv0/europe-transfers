import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Europe Transfers — Premium Travel & Tours",
  description: "Premium transfer and tour services across Europe. Safe, reliable, and comfortable travel.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S1CWM82B0Q"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S1CWM82B0Q');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
