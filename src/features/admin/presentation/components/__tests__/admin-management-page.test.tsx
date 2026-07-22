import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getAdminManagementViewModel } from "@/features/admin/data/services/get-admin-management-view-model";
import { AdminManagementPage } from "@/features/admin/presentation/components/admin-management-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/admin",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("admin management page", () => {
  test("renders admin list and key role actions", () => {
    render(<AdminManagementPage viewModel={getAdminManagementViewModel({})} />);
    expect(screen.getByText("All Admin Users")).toBeInTheDocument();
    expect(screen.getByText("Invite New User")).toBeInTheDocument();
    expect(screen.getByText("Create Role")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deactivated" })).toBeInTheDocument();
    expect(screen.getAllByText("Elvis Igiebor").length).toBeGreaterThan(0);
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ menu: "1" })} />);
    expect(screen.getByText("Change Member Roles")).toBeInTheDocument();
    expect(screen.getAllByText("View Permission Details").length).toBeGreaterThan(0);
    expect(screen.getByText("Rename Role")).toBeInTheDocument();
    expect(screen.getByText("Delete Admin User")).toBeInTheDocument();
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ menu: "3" })} />);
    expect(screen.getAllByText("Select Role").length).toBeGreaterThan(0);
    expect(screen.getByText("Delete Admin User")).toBeInTheDocument();
  });

  test("switches admin tabs on the client", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const tab = new URL(url, "http://localhost").searchParams.get("tab") ?? "all";
        return Promise.resolve({
          ok: true,
          json: async () => getAdminManagementViewModel({ tab }),
        });
      }),
    );
    render(<AdminManagementPage viewModel={getAdminManagementViewModel({})} />);

    await user.click(screen.getByRole("button", { name: "Deactivated" }));

    await waitFor(() => {
      expect(screen.getByText("John Stone")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Deactivated" })).toHaveAttribute("aria-pressed", "true");
  });

  test("opens and closes admin row menu without an extra fetch", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => getAdminManagementViewModel({}) });
    vi.stubGlobal("fetch", fetchSpy);
    render(<AdminManagementPage viewModel={getAdminManagementViewModel({})} />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    fetchSpy.mockClear();

    await user.click(screen.getByRole("button", { name: "Open admin actions 1" }));

    expect(screen.getAllByRole("button", { name: "View Permission Details" }).length).toBeGreaterThan(1);
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Close admin actions menu" }));

    expect(screen.queryByRole("button", { name: "Change Member Roles" })).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("opens loaded admin permission and assign-role modals without an extra fetch", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => getAdminManagementViewModel({}) });
    vi.stubGlobal("fetch", fetchSpy);
    render(<AdminManagementPage viewModel={getAdminManagementViewModel({})} />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    fetchSpy.mockClear();

    await user.click(screen.getAllByRole("button", { name: "View Permission Details" })[0]);

    expect(screen.getByRole("heading", { name: "Permission Details" })).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Close permission details" }));
    await user.click(screen.getAllByRole("button", { name: "Select Role" })[0]);

    expect(screen.getByRole("heading", { name: "Select Role" })).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("renders role creation and lifecycle overlays", () => {
    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ createRole: "1" })} />);
    expect(screen.getByRole("heading", { name: "Create Role" })).toBeInTheDocument();
    expect(screen.getAllByText("Select Role").length).toBeGreaterThan(0);
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ invite: "1" })} />);
    expect(screen.getByRole("heading", { name: "Invite New User" })).toBeInTheDocument();
    expect(screen.getByText("Invite a new Super Admin")).toBeInTheDocument();
    expect(screen.getByDisplayValue("newadmin@itestified.app")).toBeInTheDocument();
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ manageRole: "2" })} />);
    expect(screen.getByRole("heading", { name: "Manage Role" })).toBeInTheDocument();
    expect(screen.getByText("Change Member Roles")).toBeInTheDocument();
    expect(screen.getAllByText("Content Admin").length).toBeGreaterThan(0);
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ permission: "1" })} />);
    expect(screen.getByRole("heading", { name: "Permission Details" })).toBeInTheDocument();
    expect(screen.getByText("Permission Page")).toBeInTheDocument();
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ managePermissions: "1" })} />);
    expect(screen.getByRole("heading", { name: "Manage Permissions" })).toBeInTheDocument();
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ assignRole: "3" })} />);
    expect(screen.getByRole("heading", { name: "Select Role" })).toBeInTheDocument();
    expect(screen.getByText("Admin Users")).toBeInTheDocument();
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ renameRole: "1" })} />);
    expect(screen.getByRole("heading", { name: "Rename Role" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Super Admin")).toBeInTheDocument();
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ remove: "1" })} />);
    expect(screen.getByRole("heading", { name: "Delete Admin User?" })).toBeInTheDocument();
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ success: "1" })} />);
    expect(screen.getByText("Role Created Successfully!")).toBeInTheDocument();
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ success: "1", successType: "admin-assigned" })} />);
    expect(screen.getByText("Admin User Assigned Successfully!")).toBeInTheDocument();
  });

  test("renders loading, empty, and error states", () => {
    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ tab: "deactivated" })} />);
    expect(screen.getByText("John Stone")).toBeInTheDocument();
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ state: "loading" })} />);
    expect(screen.getByText("Loading admins...")).toBeInTheDocument();
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ state: "empty" })} />);
    expect(screen.getByText("No Admins Yet")).toBeInTheDocument();
    cleanup();

    render(<AdminManagementPage viewModel={getAdminManagementViewModel({ state: "error" })} />);
    expect(screen.getByText("We could not load admin management right now. Please try again.")).toBeInTheDocument();
  });
});
