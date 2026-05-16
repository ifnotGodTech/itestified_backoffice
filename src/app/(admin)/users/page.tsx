import { findUserByEmail } from "@/core/auth/mock-users";
import { getServerSession } from "@/core/auth/session";
import { getUsersViewModel } from "@/features/admin/data/services/get-users-view-model";
import { UsersPage } from "@/features/admin/presentation/components/users-page";

export default async function UsersRoute({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    state?: string;
    q?: string;
    menu?: string;
    view?: string;
    deactivate?: string;
    reactivate?: string;
    success?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const user = session?.email ? findUserByEmail(session.email) : null;

  const viewModel = getUsersViewModel({
    tab: params.tab,
    state: params.state,
    q: params.q,
    menu: params.menu,
    view: params.view,
    deactivate: params.deactivate,
    reactivate: params.reactivate,
    success: params.success,
    fullName: user?.fullName,
  });

  return <UsersPage viewModel={viewModel} />;
}
