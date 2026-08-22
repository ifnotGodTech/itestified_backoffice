import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getReferralCommissionsViewModelFromApi } from "@/features/admin/data/services/get-referral-commissions-view-model";
import { ReferralCommissionsPage } from "@/features/admin/presentation/components/referral-commissions-page";

export default async function ReferralPayoutsRoute({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    state?: string;
    q?: string;
    menu?: string;
    markPaid?: string;
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

  const viewModel = await getReferralCommissionsViewModelFromApi(
    {
      tab: params.tab,
      state: params.state,
      q: params.q,
      menu: params.menu,
      markPaid: params.markPaid,
      success: params.success,
      page: params.page,
      fullName: session?.email ?? undefined,
    },
    cookieHeader,
  );

  return <ReferralCommissionsPage viewModel={viewModel} />;
}
