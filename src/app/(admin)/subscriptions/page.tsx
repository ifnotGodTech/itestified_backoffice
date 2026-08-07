import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getSubscriptionsViewModelFromApi } from "@/features/admin/data/services/get-subscriptions-view-model";
import { SubscriptionsPage } from "@/features/admin/presentation/components/subscriptions-page";

export default async function SubscriptionsRoute({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    state?: string;
    q?: string;
    menu?: string;
    detail?: string;
    cancel?: string;
    reason?: string;
    success?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getSubscriptionsViewModelFromApi(
    {
      tab: params.tab,
      state: params.state,
      q: params.q,
      menu: params.menu,
      detail: params.detail,
      cancel: params.cancel,
      reason: params.reason,
      success: params.success,
      page: params.page,
      fullName: session?.email ?? undefined,
    },
    cookieHeader,
  );

  return <SubscriptionsPage viewModel={viewModel} />;
}
