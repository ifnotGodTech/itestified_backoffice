import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getHomeManagementViewModelFromApi } from "@/features/admin/data/services/get-home-management-view-model";
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

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const viewModel = await getHomeManagementViewModelFromApi({
    tab: params.tab,
    rule: params.rule,
    count: params.count,
    state: params.state,
    menuId: params.menu,
    viewId: params.view,
    removeId: params.remove,
    success: params.success,
    fullName: session?.fullName ?? session?.email,
  }, cookieHeader);

  return <HomeManagementPage viewModel={viewModel} />;
}
