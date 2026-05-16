import { cookies } from "next/headers";
import { getServerSession } from "@/core/auth/session";
import { getNotificationSettingsViewModelFromApi } from "@/features/settings/data/services/get-notification-settings-view-model";
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
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const viewModel = await getNotificationSettingsViewModelFromApi({
    state: params.state,
    success: params.success,
    fullName: session?.fullName ?? session?.email,
  }, cookieHeader);

  return <NotificationSettingsPage viewModel={viewModel} />;
}
