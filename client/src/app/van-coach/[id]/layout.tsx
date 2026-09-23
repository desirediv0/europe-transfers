import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const canonical = `https://theeuropetransfers.com/van-coach/${id}`;
  return {
    title: "Van & Coach Hire | The Europe Transfers",
    description: "Hire premium vans and coaches across Europe with The Europe Transfers.",
    alternates: { canonical },
    openGraph: {
      title: "Van & Coach Hire | The Europe Transfers",
      description: "Hire premium vans and coaches across Europe with The Europe Transfers.",
      url: canonical,
      type: "website",
    },
  };
}

export default function VanCoachIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
