import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getHomeManagementViewModel } from "@/features/admin";
import { HomeManagementPage } from "@/features/admin/presentation/components/home-management-page";

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
  }),
  usePathname: () => "/home-management",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  routerPush.mockClear();
  routerRefresh.mockClear();
  window.history.pushState(null, "", "/");
});

describe("HomeManagementPage", () => {
  test("renders the management table state", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ fullName: "Elvis Igiebor" })} />);

    expect(screen.getByRole("heading", { name: "Home Page Management" })).toBeInTheDocument();
    expect(screen.getByText("Video Testimonies")).toBeInTheDocument();
    expect(screen.getByText("Available Testimonies")).toBeInTheDocument();
    expect(screen.getByText("Display Rule")).toBeInTheDocument();
    expect(screen.getAllByText("God healed...")).toHaveLength(5);
  });

  test("renders the selected display rule in the filter control", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ rule: "Most Shared" })} />);

    expect(screen.getByRole("combobox", { name: "Display Rule" })).toHaveValue("Most Shared");
  });

  test("switches home management tabs on the client", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const tab = new URL(url, "http://localhost").searchParams.get("tab") ?? "video";
        return Promise.resolve({
          ok: true,
          json: async () => getHomeManagementViewModel({ tab }),
        });
      }),
    );
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({})} />);

    await user.click(screen.getByRole("button", { name: "Inspirational Pictures" }));

    await waitFor(() => {
      expect(screen.getByText("Available Pictures")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Inspirational Pictures" })).toHaveAttribute("aria-pressed", "true");
  });

  test("renders the selected testimony count and limits visible rows", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ count: "3" })} />);

    expect(screen.getByRole("spinbutton", { name: "Number of Testimonies" })).toHaveValue(3);
    expect(screen.getAllByText("God healed...")).toHaveLength(3);
  });

  test("renders the remove confirmation state", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ removeId: "1" })} />);

    expect(screen.getByText("Remove from Home Page?")).toBeInTheDocument();
    expect(screen.getByText("Yes, remove")).toBeInTheDocument();
  });

  test("closes route-opened remove confirmation without router navigation", async () => {
    const user = userEvent.setup();
    window.history.pushState(null, "", "/home-management?tab=video&remove=1");
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ removeId: "1" })} />);

    await user.click(screen.getByRole("button", { name: "Cancel remove from home page" }));

    expect(screen.queryByText("Remove from Home Page?")).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe("/home-management");
    expect(window.location.search).not.toContain("remove=");
  });

  test("renders the row action menu state", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ menuId: "1" })} />);

    expect(screen.getByText("View")).toBeInTheDocument();
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  test("renders the loading state", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ state: "loading" })} />);

    expect(screen.getByText("Available Testimonies")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
  });

  test("renders the empty state", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ state: "empty" })} />);

    expect(screen.getByText("No featured testimonies yet")).toBeInTheDocument();
  });

  test("renders the error state", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ state: "error" })} />);

    expect(screen.getByText("Unable to load home page content")).toBeInTheDocument();
    expect(screen.getByText("We could not load homepage content right now. Please try again.")).toBeInTheDocument();
  });

  test("renders the inspirational picture detail state", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ tab: "pictures", viewId: "1" })} />);

    expect(screen.getByText("Picture Details")).toBeInTheDocument();
    expect(screen.getByText("Number of downloads")).toBeInTheDocument();
    expect(screen.getAllByText("Instagram.com")).toHaveLength(3);
  });

  test("renders the text testimony detail state from the reference layout", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ tab: "text", viewId: "1" })} />);

    expect(screen.getByText("John Stone")).toBeInTheDocument();
    expect(screen.getByText("Johnstone@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Miraculous Healing After Prayer" })).toBeInTheDocument();
    expect(screen.queryByText("Text Details")).not.toBeInTheDocument();
  });
});
