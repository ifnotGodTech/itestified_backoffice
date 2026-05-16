import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type { NotificationSettingsViewModel, SettingsState } from "@/features/settings/domain/entities/settings";

function normalizeState(state?: string): SettingsState {
  if (state === "loading" || state === "error" || state === "success" || state === "validation") return state;
  return "populated";
}

export function getNotificationSettingsViewModel(input: {
  state?: string;
  success?: string;
  fullName?: string;
}): NotificationSettingsViewModel {
  const phaseState = normalizeState(input.state ?? (input.success === "1" ? "success" : undefined));

  return {
    shell: getAdminShellViewModel({ activeHref: "/notification-settings", fullName: input.fullName }),
    pageTitle: "Notification settings",
    pageDescription: "Control how the dashboard notifies you about important admin activity.",
    phaseState,
    preferences: [
      {
        title: "Allow Email Notifications",
        description: "When enabled, you receive notifications directly to your Email",
        enabled: true,
      },
      {
        title: "New Donation Received",
        description: "Enable to notify the admin after a user submits a donation for verification",
        enabled: true,
      },
      {
        title: "Thank you Email",
        description: "Send a confirmation email to donors after a donation is successfully processed.",
        enabled: false,
      },
    ],
    successMessage: phaseState === "success" ? "Notification settings saved successfully." : undefined,
    errorMessage: phaseState === "error" ? "We could not load notification settings right now. Please try again." : undefined,
    validationMessage: phaseState === "validation" ? "Please enable at least one notification preference before saving." : undefined,
  };
}
