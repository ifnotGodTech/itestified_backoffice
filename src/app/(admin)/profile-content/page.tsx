import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getProfileContentViewModelFromApi } from "@/features/admin/data/services/get-profile-content-view-model";
import { ProfileContentPage } from "@/features/admin/presentation/components/profile-content-page";

export default async function ProfileContentRoute({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getProfileContentViewModelFromApi(
    { state: params.state, fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );

  return <ProfileContentPage viewModel={viewModel} />;
}
