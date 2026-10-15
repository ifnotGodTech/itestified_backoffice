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
    expect(screen.getByText("Featured Pictures")).toBeInTheDocument();
    expect(screen.getByText("Display Rule")).toBeInTheDocument();
    expect(screen.getByText("Deeply Loved")).toBeInTheDocument();
    expect(screen.getByText("Grace Note")).toBeInTheDocument();
  });

  test("renders the selected display rule in the filter control", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ rule: "Most Recent" })} />);

    expect(screen.getByRole("combobox", { name: "Display Rule" })).toHaveValue("Most Recent");
  });

  test("renders the selected picture count and limits visible rows", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ count: "1" })} />);

    expect(screen.getByRole("spinbutton", { name: "Number of Pictures" })).toHaveValue(1);
    expect(screen.getByText("Deeply Loved")).toBeInTheDocument();
    expect(screen.queryByText("Grace Note")).not.toBeInTheDocument();
  });

  // Phase 35 retired the featured testimonies and the section order: only
  // the featured pictures woven into the app's Home feed are managed here.
  test("offers no testimony tabs or section order, and saving sends only pictures", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => getHomeManagementViewModel({}) });
    vi.stubGlobal("fetch", fetchSpy);
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ tab: "video" })} />);

    expect(screen.queryByText("Video Testimonies")).not.toBeInTheDocument();
    expect(screen.queryByText("Text Testimonies")).not.toBeInTheDocument();
    expect(screen.queryByText("Home Screen Section Order")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+ Add Testimony" })).not.toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole("button", { name: "Move Grace Note up in featured order" }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(Object.keys(body).sort()).toEqual(["count", "featuredPictureIds"]);
  });

  test("renders the remove confirmation state", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ removeId: "1" })} />);

    expect(screen.getByText("Remove from Home Page?")).toBeInTheDocument();
    expect(screen.getByText("Yes, remove")).toBeInTheDocument();
  });

  test("closes route-opened remove confirmation without router navigation", async () => {
    const user = userEvent.setup();
    window.history.pushState(null, "", "/home-management?tab=pictures&remove=1");
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

    expect(screen.getByText("Featured Pictures")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
  });

  test("renders the empty state", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ state: "empty" })} />);

    expect(screen.getByText("No featured pictures yet")).toBeInTheDocument();
  });

  test("renders the error state", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ state: "error" })} />);

    expect(screen.getByText("Unable to load home page content")).toBeInTheDocument();
    expect(screen.getByText("We could not load homepage content right now. Please try again.")).toBeInTheDocument();
  });

  test("renders the inspirational picture detail state", () => {
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ tab: "pictures", viewId: "1" })} />);

    expect(screen.getByText("Picture Details")).toBeInTheDocument();
    expect(screen.getAllByText("Deeply Loved")).toHaveLength(2);
    expect(screen.getAllByText("Instagram.com")).toHaveLength(3);
  });

  // Regression coverage: pictures used to have no add/reorder curation at all --
  // the "Inspirational Pictures" tab only ever showed the full published list
  // with a decorative Remove action. These assert the real add/reorder/apply
  // flows actually POST to the curation endpoint.
  test("opens the add picture modal and adding one posts the new featured list", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => getHomeManagementViewModel({ tab: "pictures" }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    const viewModel = {
      ...getHomeManagementViewModel({ tab: "pictures" }),
      availablePictures: [{ id: 9, title: "New Grace", category: "Hope" }],
    };
    render(<HomeManagementPage viewModel={viewModel} />);

    await user.click(screen.getByRole("button", { name: "+ Add Picture" }));
    expect(screen.getByRole("heading", { name: "Add to Featured Pictures" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith(
      "/api/admin/content/home-curation",
      expect.objectContaining({ method: "POST" }),
    ));
    const [, requestInit] = fetchSpy.mock.calls[0];
    const body = JSON.parse((requestInit as RequestInit).body as string);
    expect(body.featuredPictureIds).toContain(9);
  });

  test("reordering a featured picture posts the swapped order", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => getHomeManagementViewModel({ tab: "pictures" }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ tab: "pictures" })} />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Move Grace Note up in featured order" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const [, requestInit] = fetchSpy.mock.calls[0];
    const body = JSON.parse((requestInit as RequestInit).body as string);
    expect(body.featuredPictureIds).toEqual([2, 1]);
  });

  // Regression coverage: Apply used to submit the trim immediately with no
  // confirmation, silently deleting whatever fell outside the count -- with
  // no way to see what was about to be removed or back out.
  test("applying Display Rule + Count shows a confirmation before removing anything", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => getHomeManagementViewModel({ tab: "pictures" }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ tab: "pictures", count: "1" })} />);

    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByRole("heading", { name: "Remove 1 from Featured?" })).toBeInTheDocument();
    expect(screen.getByText("• Grace Note")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("canceling the apply confirmation submits nothing", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => getHomeManagementViewModel({ tab: "pictures" }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ tab: "pictures", count: "1" })} />);

    await user.click(screen.getByRole("button", { name: "Apply" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("heading", { name: "Remove 1 from Featured?" })).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("confirming the apply confirmation posts the trimmed, sorted list", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => getHomeManagementViewModel({ tab: "pictures" }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ tab: "pictures", count: "1" })} />);

    await user.click(screen.getByRole("button", { name: "Apply" }));
    await user.click(screen.getByRole("button", { name: "Yes, apply" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith(
      "/api/admin/content/home-curation",
      expect.objectContaining({ method: "POST" }),
    ));
    const [, requestInit] = fetchSpy.mock.calls[0];
    const body = JSON.parse((requestInit as RequestInit).body as string);
    expect(body.featuredPictureIds).toHaveLength(1);
  });

  test("applying with no items to remove skips the confirmation entirely", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => getHomeManagementViewModel({ tab: "pictures" }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    // count === the number already featured -- reordering only, nothing removed.
    render(<HomeManagementPage viewModel={getHomeManagementViewModel({ tab: "pictures", count: "2" })} />);

    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.queryByRole("heading", { name: /Remove .* from Featured/ })).not.toBeInTheDocument();
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith(
      "/api/admin/content/home-curation",
      expect.objectContaining({ method: "POST" }),
    ));
  });
});
