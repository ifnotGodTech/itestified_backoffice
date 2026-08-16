import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getHomePromosViewModelFromApi } from "@/features/admin/data/services/get-home-promos-view-model";
import { HomePromosPage } from "@/features/admin/presentation/components/home-promos-page";

export default async function HomePromosRoute({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    state?: string;
    q?: string;
    edit?: string;
    success?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getHomePromosViewModelFromApi(
    {
      status: params.status,
      state: params.state,
      q: params.q,
      edit: params.edit,
      success: params.success,
      page: params.page,
      fullName: session?.fullName ?? session?.email,
    },
    cookieHeader,
  );

  return <HomePromosPage viewModel={viewModel} />;
}
