import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getHomeEngagementViewModelFromApi } from "@/features/admin/data/services/get-home-engagement-view-model";
import { HomeEngagementPage } from "@/features/admin/presentation/components/home-engagement-page";

export default async function HomeEngagementRoute({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getHomeEngagementViewModelFromApi(
    { period: params.period, fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );

  return <HomeEngagementPage viewModel={viewModel} />;
}
