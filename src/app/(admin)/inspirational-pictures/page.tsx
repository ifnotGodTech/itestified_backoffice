import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getInspirationalPicturesViewModelFromApi } from "@/features/admin/data/services/get-inspirational-pictures-view-model";
import { InspirationalPicturesPage } from "@/features/admin/presentation/components/inspirational-pictures-page";

export default async function InspirationalPicturesRoute({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    screen?: string;
    state?: string;
    q?: string;
    menu?: string;
    view?: string;
    edit?: string;
    remove?: string;
    success?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getInspirationalPicturesViewModelFromApi(
    {
      status: params.status,
      screen: params.screen,
      state: params.state,
      q: params.q,
      menu: params.menu,
      view: params.view,
      edit: params.edit,
      remove: params.remove,
      success: params.success,
      fullName: session?.email ?? undefined,
    },
    cookieHeader,
  );

  return <InspirationalPicturesPage viewModel={viewModel} />;
}
