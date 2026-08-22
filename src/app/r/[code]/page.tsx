import type { Metadata } from "next";
import { ReferralLandingPage } from "@/features/referrals/presentation/components/referral-landing-page";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Join iTestified | Referral code ${code}`,
    description: "Get the iTestified app and enter this referral code when you create your account.",
  };
}

export default async function Page({ params }: Props) {
  const { code } = await params;
  return <ReferralLandingPage code={code} />;
}
