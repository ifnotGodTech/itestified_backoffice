import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getLiveStreamingPolicyViewModelFromApi } from "@/features/admin/data/services/get-live-streaming-policy-view-model";
import { LiveStreamingPolicyPage } from "@/features/admin/presentation/components/live-streaming-policy-page";

export default async function LiveStreamingPolicyRoute({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; section?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getLiveStreamingPolicyViewModelFromApi(
    { state: params.state, section: params.section, fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );

  return <LiveStreamingPolicyPage viewModel={viewModel} />;
}
