import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getPremiumPricingViewModelFromApi } from "@/features/admin/data/services/get-premium-pricing-view-model";
import { PremiumPricingPage } from "@/features/admin/presentation/components/premium-pricing-page";

export default async function PremiumPricingRoute({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getPremiumPricingViewModelFromApi(
    { state: params.state, fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );

  return <PremiumPricingPage viewModel={viewModel} />;
}
