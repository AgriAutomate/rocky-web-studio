import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Upgrade for DIY Stuck CQ Businesses | Rocky Web Studio",
  description: "Stop struggling with Wix/Facebook. Get a professional lead-generating website from Rocky Web Studio. Local CQ partner, AI-first, 15-25% under Brisbane prices. Free call.",
  openGraph: {
    title: "Website Upgrade for DIY Stuck CQ Businesses | Rocky Web Studio",
    description: "Stop struggling with Wix/Facebook. Get a professional lead-generating website from Rocky Web Studio. Local CQ partner, AI-first, 15-25% under Brisbane prices.",
    type: "website",
    url: "https://rockywebstudio.com.au/campaign",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://rockywebstudio.com.au/campaign",
  },
};

export default function CampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
