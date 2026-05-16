import { findUserByEmail } from "@/core/auth/mock-users";
import { getServerSession } from "@/core/auth/session";
import { getNotificationsHistoryViewModel } from "@/features/admin/data/services/get-notifications-history-view-model";
import { NotificationsHistoryPage } from "@/features/admin/presentation/components/notifications-history-page";

export default async function NotificationsHistoryRoute({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string;
    q?: string;
    panel?: string;
    filter?: string;
    statusFilter?: string;
    from?: string;
    to?: string;
    selected?: string;
    read?: string;
    delete?: string;
    deleteAll?: string;
    success?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const user = session?.email ? findUserByEmail(session.email) : null;

  const viewModel = getNotificationsHistoryViewModel({
    state: params.state,
    q: params.q,
    panel: params.panel,
    filter: params.filter,
    statusFilter: params.statusFilter,
    from: params.from,
    to: params.to,
    selected: params.selected,
    read: params.read,
    delete: params.delete,
    deleteAll: params.deleteAll,
    success: params.success,
    fullName: user?.fullName,
  });

  return <NotificationsHistoryPage viewModel={viewModel} />;
}
