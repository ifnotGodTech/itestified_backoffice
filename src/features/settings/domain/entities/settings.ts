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
