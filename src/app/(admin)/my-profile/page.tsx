import { findUserByEmail } from "@/core/auth/mock-users";
import { getServerSession } from "@/core/auth/session";
import { getMyProfileViewModel } from "@/features/settings/data/services/get-my-profile-view-model";
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
  const user = session?.email ? findUserByEmail(session.email) : null;

  const viewModel = getMyProfileViewModel({
    screen: params.screen,
    menu: params.menu,
    password: params.password,
    state: params.state,
    fullName: user?.fullName,
    emailAddress: user?.email,
  });

  return <MyProfilePage viewModel={viewModel} />;
}
