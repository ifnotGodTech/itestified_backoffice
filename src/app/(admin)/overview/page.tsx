import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { AdminOverview } from "@/features/admin";
import { getAdminOverviewViewModelFromApi } from "@/features/admin/data/services/get-admin-overview-view-model";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
  const viewModel = await getAdminOverviewViewModelFromApi({
    empty: params.state === "empty",
    fullName: session?.fullName ?? session?.email,
  }, cookieHeader);

  return <AdminOverview viewModel={viewModel} />;
}
