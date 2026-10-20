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
  // The admin layout draws the shell (and checks the session), so this page
  // goes straight to the list -- one backend round trip per tab switch.
  const params = await searchParams;

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
    cookieHeader,
  });

  return <PlaylistsPage viewModel={viewModel} />;
}
