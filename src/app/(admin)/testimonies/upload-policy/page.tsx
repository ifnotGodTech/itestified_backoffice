import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getMediaUploadPolicyViewModelFromApi } from "@/features/admin/data/services/get-media-upload-policy-view-model";
import { MediaUploadPolicyPage } from "@/features/admin/presentation/components/media-upload-policy-page";

export default async function MediaUploadPolicyRoute({
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

  const viewModel = await getMediaUploadPolicyViewModelFromApi(
    { state: params.state, section: params.section, fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );

  return <MediaUploadPolicyPage viewModel={viewModel} />;
}
