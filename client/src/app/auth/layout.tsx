import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | The Europe Transfers",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
