import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getInspirationalPicturesViewModel } from "@/features/admin/data/services/get-inspirational-pictures-view-model";
import { InspirationalPicturesPage } from "@/features/admin/presentation/components/inspirational-pictures-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/inspirational-pictures",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("InspirationalPicturesPage", () => {
  test("renders the inspirational pictures grid state", () => {
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Inspirational Pictures", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Thumbnail")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getAllByText("Upload Pictures").length).toBeGreaterThan(0);
  });

  test("renders the empty state", () => {
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({ state: "empty" })} />);

    expect(screen.getByText("No Pictures here Yet")).toBeInTheDocument();
  });

  test("renders the picture details state", () => {
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({ view: "1" })} />);

    expect(screen.getByRole("heading", { name: "Picture Details" })).toBeInTheDocument();
    expect(screen.getAllByText("Uploaded By").length).toBeGreaterThan(0);
  });

  test("renders the last-row action menu fully", () => {
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({ menu: "3" })} />);

    expect(screen.getByText("View")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  test("switches picture status tabs on the client", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const status = new URL(url, "http://localhost").searchParams.get("status") ?? "All";
        return Promise.resolve({
          ok: true,
          json: async () => getInspirationalPicturesViewModel({ status }),
        });
      }),
    );
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({})} />);

    await user.click(screen.getByRole("button", { name: "Scheduled" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Scheduled" })).toHaveAttribute("aria-pressed", "true");
    });
    expect(screen.getByText("03:00PM")).toBeInTheDocument();
  });

  test("opens and closes picture action menu without an extra fetch", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => getInspirationalPicturesViewModel({}) });
    vi.stubGlobal("fetch", fetchSpy);
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({})} />);
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Open actions for picture 1" }));

    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Close inspirational pictures action menu" }));

    expect(screen.queryByRole("button", { name: "View" })).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("opens loaded picture details without an extra fetch", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => getInspirationalPicturesViewModel({}) });
    vi.stubGlobal("fetch", fetchSpy);
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({})} />);
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Open actions for picture 1" }));
    await user.click(screen.getByRole("button", { name: "View" }));

    expect(screen.getByRole("heading", { name: "Picture Details" })).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("renders the scheduled picture details state", () => {
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({ view: "2" })} />);

    expect(screen.getByRole("heading", { name: "Picture Details" })).toBeInTheDocument();
    expect(screen.getByText("Scheduled Date")).toBeInTheDocument();
  });

  test("renders the edit picture state", () => {
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({ edit: "1" })} />);

    expect(screen.getByRole("heading", { name: "Edit Picture" })).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  test("renders the delete picture state", () => {
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({ remove: "1" })} />);

    expect(screen.getByRole("heading", { name: "Delete This Picture?" })).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete this picture? This action cannot be undone.")).toBeInTheDocument();
  });

  test("renders the upload screen", () => {
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({ screen: "upload" })} />);

    expect(screen.getByRole("heading", { name: "Upload Picture" })).toBeInTheDocument();
    expect(screen.getByText("Upload Status")).toBeInTheDocument();
  });

  test("renders the upload success state", () => {
    render(<InspirationalPicturesPage viewModel={getInspirationalPicturesViewModel({ success: "upload" })} />);

    expect(screen.getByText("Uploaded Successfully!")).toBeInTheDocument();
  });
});
