import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type SettingsState = "populated" | "loading" | "error" | "success" | "validation";

export type MyProfileScreen = "profile" | "personal" | "contact" | "otp";

export type MyProfileViewModel = {
  shell: AdminShellViewModel;
  pageTitle: string;
  pageDescription: string;
  fullName: string;
  roleLabel: string;
  mobileNumber: string;
  emailAddress: string;
  hasProfileImage: boolean;
  screen: MyProfileScreen;
  phaseState: SettingsState;
  showPictureMenu: boolean;
  showPasswordModal: boolean;
  successMessage?: string;
  errorMessage?: string;
  validationMessage?: string;
};

export type NotificationPreference = {
  name: "allow_email_notifications" | "allow_push_notifications" | "notify_new_donation_received" | "send_donation_thank_you_email";
  title: string;
  description: string;
  enabled: boolean;
};

export type NotificationSettingsViewModel = {
  shell: AdminShellViewModel;
  pageTitle: string;
  pageDescription: string;
  phaseState: SettingsState;
  preferences: NotificationPreference[];
  successMessage?: string;
  errorMessage?: string;
  validationMessage?: string;
};
