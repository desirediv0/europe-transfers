import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `https://theeuropetransfers.com/careers/${slug}`;
  return {
    title: "Career Opportunity | The Europe Transfers",
    description: "View this career opportunity and apply at The Europe Transfers.",
    alternates: { canonical },
    openGraph: {
      title: "Career Opportunity | The Europe Transfers",
      description: "View this career opportunity and apply at The Europe Transfers.",
      url: canonical,
      type: "website",
    },
  };
}

export default function CareerSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
