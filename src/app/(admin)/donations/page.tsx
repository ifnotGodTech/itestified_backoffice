import { findUserByEmail } from "@/core/auth/mock-users";
import { getServerSession } from "@/core/auth/session";
import { getDonationsViewModel } from "@/features/admin/data/services/get-donations-view-model";
import { DonationsPage } from "@/features/admin/presentation/components/donations-page";

export default async function DonationsRoute({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    state?: string;
    month?: string;
    monthMenu?: string;
    q?: string;
    filter?: string;
    minAmount?: string;
    maxAmount?: string;
    currency?: string;
    from?: string;
    to?: string;
    statusFilter?: string;
    menu?: string;
    refund?: string;
    reverse?: string;
    reason?: string;
    remove?: string;
    success?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const user = session?.email ? findUserByEmail(session.email) : null;

  const viewModel = getDonationsViewModel({
    tab: params.tab,
    state: params.state,
    month: params.month,
    monthMenu: params.monthMenu,
    q: params.q,
    filter: params.filter,
    minAmount: params.minAmount,
    maxAmount: params.maxAmount,
    currency: params.currency,
    from: params.from,
    to: params.to,
    statusFilter: params.statusFilter,
    menu: params.menu,
    refund: params.refund,
    reverse: params.reverse,
    reason: params.reason,
    remove: params.remove,
    success: params.success,
    fullName: user?.fullName,
  });

  return <DonationsPage viewModel={viewModel} />;
}
