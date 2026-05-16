import { findUserByEmail } from "@/core/auth/mock-users";
import { getServerSession } from "@/core/auth/session";
import { getHomeManagementViewModel } from "@/features/admin/data/services/get-home-management-view-model";
import { HomeManagementPage } from "@/features/admin/presentation/components/home-management-page";

export default async function HomeManagementRoute({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    rule?: string;
    count?: string;
    state?: string;
    menu?: string;
    view?: string;
    remove?: string;
    success?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const user = session?.email ? findUserByEmail(session.email) : null;

  const viewModel = getHomeManagementViewModel({
    tab: params.tab,
    rule: params.rule,
    count: params.count,
    state: params.state,
    menuId: params.menu,
    viewId: params.view,
    removeId: params.remove,
    success: params.success,
    fullName: user?.fullName,
  });

  return <HomeManagementPage viewModel={viewModel} />;
}
