import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getBiblePacksViewModelFromApi } from "@/features/admin/data/services/get-bible-packs-view-model";
import { BiblePacksPage } from "@/features/admin/presentation/components/bible-packs-page";

export default async function BiblePacksRoute({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string;
    action?: string;
    pack?: string;
    message?: string;
    confirm?: string;
    code?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getBiblePacksViewModelFromApi(
    { ...params, fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );

  return <BiblePacksPage viewModel={viewModel} />;
}
