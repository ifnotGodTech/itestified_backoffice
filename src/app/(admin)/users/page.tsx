import { getServerSession } from "@/core/auth/session";
import { cookies } from "next/headers";
import { getUsersViewModelFromApi } from "@/features/admin/data/services/get-users-view-model";
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
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getUsersViewModelFromApi({
    tab: params.tab,
    state: params.state,
    q: params.q,
    menu: params.menu,
    view: params.view,
    deactivate: params.deactivate,
    reactivate: params.reactivate,
    success: params.success,
    fullName: session?.fullName ?? session?.email,
  }, cookieHeader);

  return <UsersPage viewModel={viewModel} />;
}
