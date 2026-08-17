import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getAIJobsViewModelFromApi } from "@/features/admin/data/services/get-ai-jobs-view-model";
import { AIJobsPage } from "@/features/admin/presentation/components/ai-jobs-page";

export default async function AIJobsRoute({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; success?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getAIJobsViewModelFromApi(
    {
      status: params.status,
      success: params.success,
      fullName: session?.fullName ?? session?.email,
    },
    cookieHeader,
  );

  return <AIJobsPage viewModel={viewModel} />;
}
