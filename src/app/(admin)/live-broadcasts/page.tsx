import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getLiveBroadcastsViewModelFromApi } from "@/features/admin/data/services/get-live-broadcasts-view-model";
import { LiveBroadcastsPage } from "@/features/admin/presentation/components/live-broadcasts-page";

export default async function LiveBroadcastsRoute() {
  const session = await getServerSession();
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getLiveBroadcastsViewModelFromApi(
    { fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );

  return <LiveBroadcastsPage viewModel={viewModel} />;
}
