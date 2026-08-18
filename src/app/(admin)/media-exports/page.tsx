import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getMediaExportsViewModelFromApi } from "@/features/admin/data/services/get-media-exports-view-model";
import { MediaExportsPage } from "@/features/admin/presentation/components/media-exports-page";

export default async function MediaExportsRoute({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(({ name, value }) => `${name}=${value}`).join("; ");
  const viewModel = await getMediaExportsViewModelFromApi(
    { state: params.state, fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );
  return <MediaExportsPage viewModel={viewModel} />;
}
