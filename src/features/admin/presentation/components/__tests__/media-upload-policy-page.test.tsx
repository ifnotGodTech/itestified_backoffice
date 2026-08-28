import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type { MediaUploadPolicyViewModel, UploadPolicyForm } from "@/features/admin/domain/entities/media-upload-policy";
import { MediaUploadPolicyPage } from "@/features/admin/presentation/components/media-upload-policy-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/testimonies/upload-policy",
}));

afterEach(() => cleanup());

function videoPolicy(overrides: Partial<UploadPolicyForm> = {}): UploadPolicyForm {
  return {
    maxFileSizeMb: 200,
    maxDurationMinutes: 5,
    allowedContentTypes: ["video/mp4", "video/quicktime"],
    dailyLimit: 3,
    updatedByName: "",
    updatedAt: null,
    ...overrides,
  };
}

function audioPolicy(overrides: Partial<UploadPolicyForm> = {}): UploadPolicyForm {
  return {
    maxFileSizeMb: 50,
    maxDurationMinutes: 15,
    allowedContentTypes: ["audio/aac", "audio/mp4", "audio/x-m4a", "audio/mpeg", "audio/mp3"],
    dailyLimit: 5,
    updatedByName: "",
    updatedAt: null,
    ...overrides,
  };
}

function baseViewModel(overrides: Partial<MediaUploadPolicyViewModel> = {}): MediaUploadPolicyViewModel {
  return {
    shell: getAdminShellViewModel({ activeHref: "/testimonies", activeChildHref: "/testimonies/upload-policy" }),
    pageTitle: "Testimony Upload Policy",
    pageDescription: "Configure the size, length, format, and daily-submission caps.",
    phaseState: "populated",
    bannerSection: null,
    video: videoPolicy(),
    audio: audioPolicy(),
    ...overrides,
  };
}

describe("MediaUploadPolicyPage", () => {
  test("renders both policy forms with their current values", () => {
    render(<MediaUploadPolicyPage viewModel={baseViewModel()} />);

    expect(screen.getByRole("heading", { name: "Testimony Upload Policy", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Video upload policy" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Audio upload policy" })).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("200")).toHaveLength(1);
    expect(screen.getAllByDisplayValue("5")).toHaveLength(2); // video's max duration and audio's daily limit both happen to be 5
    expect(screen.getAllByDisplayValue("3")).toHaveLength(1);
    expect(screen.getAllByDisplayValue("50")).toHaveLength(1);
    expect(screen.getAllByDisplayValue("15")).toHaveLength(1);
  });

  test("checks the formats that are currently allowed", () => {
    render(
      <MediaUploadPolicyPage
        viewModel={baseViewModel({ video: videoPolicy({ allowedContentTypes: ["video/mp4"] }) })}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "MP4" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "MOV" })).not.toBeChecked();
  });

  test("posts each policy form to its own endpoint", () => {
    render(<MediaUploadPolicyPage viewModel={baseViewModel()} />);

    const videoForm = screen.getByRole("button", { name: "Save Video upload policy" }).closest("form");
    const audioForm = screen.getByRole("button", { name: "Save Audio upload policy" }).closest("form");
    expect(videoForm).toHaveAttribute("action", "/api/admin/testimonies/video-upload-policy");
    expect(audioForm).toHaveAttribute("action", "/api/admin/testimonies/audio-upload-policy");
  });

  test("shows the last-changed line once a policy has been edited", () => {
    render(
      <MediaUploadPolicyPage
        viewModel={baseViewModel({
          audio: audioPolicy({ updatedAt: "2026-08-27T12:00:00Z", updatedByName: "Video Policy Admin" }),
        })}
      />,
    );

    expect(screen.getByText(/by Video Policy Admin/)).toBeInTheDocument();
  });

  test("shows a default-values note when a policy has never been changed", () => {
    render(<MediaUploadPolicyPage viewModel={baseViewModel()} />);

    expect(screen.getAllByText("Not changed yet -- currently using system defaults.")).toHaveLength(2);
  });

  test("renders an error state instead of the forms", () => {
    render(<MediaUploadPolicyPage viewModel={baseViewModel({ phaseState: "error", errorMessage: "Backend is down." })} />);

    expect(screen.getByText("Unable to load this page")).toBeInTheDocument();
    expect(screen.getByText("Backend is down.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save Video upload policy" })).not.toBeInTheDocument();
  });

  test("shows a success banner after a save", () => {
    render(
      <MediaUploadPolicyPage
        viewModel={baseViewModel({ phaseState: "success", bannerSection: "video", successMessage: "Video upload policy updated." })}
      />,
    );
    expect(screen.getByText("Video upload policy updated.")).toBeInTheDocument();
  });

  test("shows a validation banner when the submitted values were rejected", () => {
    render(
      <MediaUploadPolicyPage
        viewModel={baseViewModel({ phaseState: "validation", validationMessage: "Check the values you entered and try again." })}
      />,
    );
    expect(screen.getByText("Check the values you entered and try again.")).toBeInTheDocument();
  });
});
