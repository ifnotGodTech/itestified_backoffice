import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
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

export async function getNotificationSettingsViewModelFromApi(
  input: {
    state?: string;
    success?: string;
    fullName?: string;
  },
  cookieHeader: string,
): Promise<NotificationSettingsViewModel> {
  try {
    const response = await fetch(`${backendBaseUrl}/notifications/preferences/me/`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return getNotificationSettingsViewModel({ ...input, state: "error" });
    }
    const payload = (await response.json().catch(() => ({}))) as {
      allow_email_notifications?: boolean;
      notify_new_donation_received?: boolean;
      send_donation_thank_you_email?: boolean;
    };
    const vm = getNotificationSettingsViewModel(input);
    const preferences = [...vm.preferences];
    preferences[0] = { ...preferences[0], enabled: Boolean(payload.allow_email_notifications ?? preferences[0]?.enabled) };
    preferences[1] = { ...preferences[1], enabled: Boolean(payload.notify_new_donation_received ?? preferences[1]?.enabled) };
    preferences[2] = { ...preferences[2], enabled: Boolean(payload.send_donation_thank_you_email ?? preferences[2]?.enabled) };
    return {
      ...vm,
      phaseState: input.state === "validation" || input.state === "success" ? vm.phaseState : "populated",
      preferences,
    };
  } catch {
    return getNotificationSettingsViewModel({ ...input, state: "error" });
  }
}
