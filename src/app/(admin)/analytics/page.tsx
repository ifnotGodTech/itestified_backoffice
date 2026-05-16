import { getServerSession } from "@/core/auth/session";
import { getAnalyticsViewModel } from "@/features/admin/data/services/get-analytics-view-model";
import { AnalyticsPage } from "@/features/admin/presentation/components/analytics-page";

export default async function AnalyticsRoute({
  searchParams,
}: {
  searchParams: Promise<{
    area?: string;
    mode?: string;
    period?: string;
    state?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();

  const viewModel = getAnalyticsViewModel({
    area: params.area,
    mode: params.mode,
    period: params.period,
    state: params.state,
    fullName: session?.fullName ?? session?.email,
  });

  return <AnalyticsPage viewModel={viewModel} />;
}
