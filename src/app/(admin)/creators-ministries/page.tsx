import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getCreatorsMinistriesViewModelFromApi } from "@/features/admin/data/services/get-creators-ministries-view-model";
import { CreatorsMinistriesPage } from "@/features/admin/presentation/components/creators-ministries-page";

export default async function CreatorsMinistriesRoute({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    state?: string;
    q?: string;
    menu?: string;
    detail?: string;
    verify?: string;
    unverify?: string;
    success?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getCreatorsMinistriesViewModelFromApi(
    {
      tab: params.tab,
      state: params.state,
      q: params.q,
      menu: params.menu,
      detail: params.detail,
      verify: params.verify,
      unverify: params.unverify,
      success: params.success,
      page: params.page,
      fullName: session?.email ?? undefined,
    },
    cookieHeader,
  );

  return <CreatorsMinistriesPage viewModel={viewModel} />;
}
