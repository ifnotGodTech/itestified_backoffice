import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getMyProfileViewModel } from "@/features/settings/data/services/get-my-profile-view-model";
import { getNotificationSettingsViewModel } from "@/features/settings/data/services/get-notification-settings-view-model";
import { MyProfilePage } from "@/features/settings/presentation/components/my-profile-page";
import { NotificationSettingsPage } from "@/features/settings/presentation/components/notification-settings-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/my-profile",
}));

afterEach(() => cleanup());

describe("settings pages", () => {
  test("renders profile overview and password modal states", () => {
    render(<MyProfilePage viewModel={getMyProfileViewModel({})} />);
    expect(screen.getByRole("heading", { name: "Profile", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    cleanup();
    render(<MyProfilePage viewModel={getMyProfileViewModel({ password: "1" })} />);
    expect(screen.getByRole("heading", { name: "Change Password" })).toBeInTheDocument();
  });

  test("renders edit, otp, and menu states", () => {
    render(<MyProfilePage viewModel={getMyProfileViewModel({ screen: "personal" })} />);
    expect(screen.getByDisplayValue("091 1234 1234")).toBeInTheDocument();
    cleanup();
    render(<MyProfilePage viewModel={getMyProfileViewModel({ screen: "contact" })} />);
    expect(screen.getByLabelText("New Email Address")).toBeInTheDocument();
    cleanup();
    render(<MyProfilePage viewModel={getMyProfileViewModel({ screen: "otp" })} />);
    expect(screen.getByLabelText("OTP")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Resend OTP" })).toBeInTheDocument();
    cleanup();
    render(<MyProfilePage viewModel={getMyProfileViewModel({ menu: "1" })} />);
    expect(screen.getByText("Change Picture")).toBeInTheDocument();
    expect(screen.getByText("Remove Picture")).toBeInTheDocument();
    cleanup();
    render(<MyProfilePage viewModel={getMyProfileViewModel({ screen: "otp", state: "validation" })} />);
    expect(screen.getByText("Enter the 4-digit OTP sent to your email address.")).toBeInTheDocument();
    cleanup();
    render(<MyProfilePage viewModel={getMyProfileViewModel({ screen: "otp", state: "success" })} />);
    expect(screen.getByText("Email address updated successfully.")).toBeInTheDocument();
  });

  test("renders notification settings, success, and error states", () => {
    render(<NotificationSettingsPage viewModel={getNotificationSettingsViewModel({})} />);
    expect(screen.getByRole("heading", { name: "Notification settings", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Allow Email Notifications")).toBeInTheDocument();
    expect(screen.getAllByRole("switch")).toHaveLength(3);
    cleanup();
    render(<NotificationSettingsPage viewModel={getNotificationSettingsViewModel({ success: "1" })} />);
    expect(screen.getByText("Notification settings saved successfully.")).toBeInTheDocument();
    cleanup();
    render(<NotificationSettingsPage viewModel={getNotificationSettingsViewModel({ state: "validation" })} />);
    expect(screen.getByText("Please enable at least one notification preference before saving.")).toBeInTheDocument();
    cleanup();
    render(<NotificationSettingsPage viewModel={getNotificationSettingsViewModel({ state: "error" })} />);
    expect(screen.getByText("We could not load notification settings right now. Please try again.")).toBeInTheDocument();
  });
});
