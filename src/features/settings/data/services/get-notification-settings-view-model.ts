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
        name: "allow_email_notifications",
        title: "Allow Email Notifications",
        description: "When enabled, you receive notifications directly to your Email",
        enabled: true,
      },
      {
        name: "allow_push_notifications",
        title: "Allow Push Notifications",
        description: "When enabled, you receive push notifications on your device (mobile app) for account activity such as testimony approvals and comments.",
        enabled: true,
      },
      {
        name: "notify_new_donation_received",
        title: "New Donation Received",
        description: "Enable to notify the admin after a user submits a donation for verification",
        enabled: true,
      },
      {
        name: "send_donation_thank_you_email",
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
      allow_push_notifications?: boolean;
      notify_new_donation_received?: boolean;
      send_donation_thank_you_email?: boolean;
    };
    const vm = getNotificationSettingsViewModel(input);
    const preferences = vm.preferences.map((preference) => ({
      ...preference,
      enabled: Boolean(payload[preference.name] ?? preference.enabled),
    }));
    return {
      ...vm,
      phaseState: input.state === "validation" || input.state === "success" ? vm.phaseState : "populated",
      preferences,
    };
  } catch {
    return getNotificationSettingsViewModel({ ...input, state: "error" });
  }
}
