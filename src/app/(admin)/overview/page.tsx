import { findUserByEmail } from "@/core/auth/mock-users";
import { getServerSession } from "@/core/auth/session";
import { getAdminOverviewViewModel, AdminOverview } from "@/features/admin";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const user = session?.email ? findUserByEmail(session.email) : null;
  const viewModel = getAdminOverviewViewModel({
    empty: params.state === "empty",
    fullName: user?.fullName,
  });

  return <AdminOverview viewModel={viewModel} />;
}
