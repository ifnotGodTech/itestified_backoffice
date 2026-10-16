import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getReactionsViewModelFromApi } from "@/features/admin/data/services/get-reactions-view-model";
import { ReactionsPage } from "@/features/admin/presentation/components/reactions/reactions-page";

export default async function ReactionsRoute({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; set?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getReactionsViewModelFromApi(
    { view: params.view, set: params.set, fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );

  return <ReactionsPage viewModel={viewModel} />;
}
