import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getAppVersionViewModelFromApi } from "@/features/admin/data/services/get-app-version-view-model";
import { AppVersionPage } from "@/features/admin/presentation/components/app-version-page";

export default async function AppVersionRoute({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string;
    success?: string;
    count?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getAppVersionViewModelFromApi(
    {
      state: params.state,
      count: params.count,
      fullName: session?.fullName ?? session?.email,
    },
    cookieHeader,
  );

  return <AppVersionPage viewModel={viewModel} />;
}
