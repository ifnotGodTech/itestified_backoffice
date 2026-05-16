import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type { MyProfileScreen, MyProfileViewModel, SettingsState } from "@/features/settings/domain/entities/settings";

function normalizeScreen(screen?: string): MyProfileScreen {
  if (screen === "personal" || screen === "contact" || screen === "otp") return screen;
  return "profile";
}

function normalizeState(state?: string): SettingsState {
  if (state === "loading" || state === "error" || state === "success" || state === "validation") return state;
  return "populated";
}

export function getMyProfileViewModel(input: {
  screen?: string;
  menu?: string;
  password?: string;
  state?: string;
  fullName?: string;
  emailAddress?: string;
}): MyProfileViewModel {
  const screen = normalizeScreen(input.screen);
  const phaseState = normalizeState(input.state);

  return {
    shell: getAdminShellViewModel({ activeHref: "/my-profile", fullName: input.fullName }),
    pageTitle: "Profile",
    pageDescription: "Manage Your Account Information",
    fullName: input.fullName ?? "Ore Ore",
    roleLabel: "Super Admin",
    mobileNumber: screen === "profile" || screen === "contact" ? "Not Added Yet" : "091 1234 1234",
    emailAddress: input.emailAddress ?? "oreore@yopmail.com",
    hasProfileImage: true,
    screen,
    phaseState,
    showPictureMenu: input.menu === "1",
    showPasswordModal: input.password === "1",
    successMessage:
      phaseState === "success"
        ? screen === "otp"
          ? "Email address updated successfully."
          : "Profile updated successfully."
        : undefined,
    errorMessage: phaseState === "error" ? "We could not load your profile right now. Please try again." : undefined,
    validationMessage:
      phaseState === "validation"
        ? screen === "otp"
          ? "Enter the 4-digit OTP sent to your email address."
          : "Please complete all required profile fields before saving."
        : undefined,
  };
}
