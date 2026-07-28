import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getSocialLinksViewModelFromApi } from "@/features/admin/data/services/get-social-links-view-model";
import { SocialLinksPage } from "@/features/admin/presentation/components/social-links-page";

export default async function SocialLinksRoute({
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

  const viewModel = await getSocialLinksViewModelFromApi(
    { state: params.state, fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );

  return <SocialLinksPage viewModel={viewModel} />;
}
