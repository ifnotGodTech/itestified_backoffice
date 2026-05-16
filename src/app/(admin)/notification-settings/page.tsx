import { findUserByEmail } from "@/core/auth/mock-users";
import { getServerSession } from "@/core/auth/session";
import { getNotificationSettingsViewModel } from "@/features/settings/data/services/get-notification-settings-view-model";
import { NotificationSettingsPage } from "@/features/settings/presentation/components/notification-settings-page";

export default async function NotificationSettingsRoute({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string;
    success?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const user = session?.email ? findUserByEmail(session.email) : null;

  const viewModel = getNotificationSettingsViewModel({
    state: params.state,
    success: params.success,
    fullName: user?.fullName,
  });

  return <NotificationSettingsPage viewModel={viewModel} />;
}
