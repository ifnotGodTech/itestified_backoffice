import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getMyProfileViewModelFromApi } from "@/features/settings/data/services/get-my-profile-view-model";
import { MyProfilePage } from "@/features/settings/presentation/components/my-profile-page";

export default async function MyProfileRoute({
  searchParams,
}: {
  searchParams: Promise<{
    screen?: string;
    menu?: string;
    password?: string;
    state?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getMyProfileViewModelFromApi({
    screen: params.screen,
    menu: params.menu,
    password: params.password,
    state: params.state,
    fullName: session?.fullName ?? session?.email,
    emailAddress: session?.email,
  }, cookieHeader);

  return <MyProfilePage viewModel={viewModel} />;
}
