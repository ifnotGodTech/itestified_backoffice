import type { Metadata } from "next";
import { ReferralLandingPage } from "@/features/referrals/presentation/components/referral-landing-page";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const title = `Join iTestified | Referral code ${code}`;
  const description = "Get the iTestified app and enter this referral code when you create your account.";
  // Without its own openGraph/twitter images, messaging apps (WhatsApp,
  // iMessage, Slack, ...) render a link preview with no icon at all rather
  // than falling back to the site favicon -- same gap the playlist share
  // page had. There's no per-referral image to use, so this uses the app's
  // own icon as a stable, branded fallback, same as that page.
  const shareImageUrl = "/apple-icon.png";
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: shareImageUrl }] },
    twitter: { card: "summary", title, description, images: [shareImageUrl] },
  };
}

export default async function Page({ params }: Props) {
  const { code } = await params;
  return <ReferralLandingPage code={code} />;
}
