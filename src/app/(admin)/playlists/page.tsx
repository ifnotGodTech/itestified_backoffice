import { getServerSession } from "@/core/auth/session";
import { cookies } from "next/headers";
import { getPlaylistsViewModelFromBackend } from "@/features/admin/data/services/get-playlists-view-model";
import { PlaylistsPage } from "@/features/admin/presentation/components/playlists-page";

export default async function PlaylistsRoute({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    visibility?: string;
    page?: string;
    view?: string;
    takedown?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getPlaylistsViewModelFromBackend({
    q: params.q,
    visibility: params.visibility,
    page: params.page,
    view: params.view,
    takedown: params.takedown,
    fullName: session?.fullName ?? session?.email,
    cookieHeader,
  });

  return <PlaylistsPage viewModel={viewModel} />;
}
