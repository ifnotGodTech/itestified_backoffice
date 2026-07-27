import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getAppVersionViewModel } from "@/features/admin/data/services/get-app-version-view-model";
import { AppVersionPage } from "@/features/admin/presentation/components/app-version-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/app-version",
}));

afterEach(() => cleanup());

describe("AppVersionPage", () => {
  test("renders both platforms with an empty default and no crash", () => {
    render(<AppVersionPage viewModel={getAppVersionViewModel({})} />);

    expect(screen.getByRole("heading", { name: "App version", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Android")).toBeInTheDocument();
    expect(screen.getByText("iOS")).toBeInTheDocument();
    expect(screen.getAllByText(/Not set yet/)).toHaveLength(2);
  });

  test("pre-fills inputs with the current configured value", () => {
    const viewModel = getAppVersionViewModel({});
    viewModel.rows = [
      { platform: "android", minimumVersion: "1.2.0", latestVersion: "1.5.0", updatedAt: "2026-07-27T10:00:00Z" },
      { platform: "ios", minimumVersion: "", latestVersion: "", updatedAt: null },
    ];

    render(<AppVersionPage viewModel={viewModel} />);

    expect(screen.getByDisplayValue("1.2.0")).toBeInTheDocument();
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
  });

  test("renders success, error, and validation states", () => {
    render(<AppVersionPage viewModel={getAppVersionViewModel({ state: "success" })} />);
    expect(screen.getByText("Version settings updated successfully.")).toBeInTheDocument();
    cleanup();

    render(<AppVersionPage viewModel={getAppVersionViewModel({ state: "validation" })} />);
    expect(screen.getByText(/Enter valid versions in the form MAJOR\.MINOR\.PATCH/)).toBeInTheDocument();
    cleanup();

    render(<AppVersionPage viewModel={getAppVersionViewModel({ state: "error" })} />);
    expect(screen.getByText("Unable to load version settings")).toBeInTheDocument();
    cleanup();

    render(<AppVersionPage viewModel={getAppVersionViewModel({ state: "notified", count: "3" })} />);
    expect(screen.getByText("Notified 3 users to update.")).toBeInTheDocument();
  });

  test("disables the notify button for a platform that has never been configured, enables it otherwise", () => {
    const viewModel = getAppVersionViewModel({});
    viewModel.rows = [
      { platform: "android", minimumVersion: "1.2.0", latestVersion: "1.5.0", updatedAt: "2026-07-27T10:00:00Z" },
      { platform: "ios", minimumVersion: "", latestVersion: "", updatedAt: null },
    ];

    render(<AppVersionPage viewModel={viewModel} />);

    expect(screen.getByRole("button", { name: "Notify Android users" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Notify iOS users" })).toBeDisabled();
  });
});
