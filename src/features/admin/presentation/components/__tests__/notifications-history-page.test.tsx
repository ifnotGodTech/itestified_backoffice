import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getNotificationsHistoryViewModel } from "@/features/admin/data/services/get-notifications-history-view-model";
import { NotificationsHistoryPage } from "@/features/admin/presentation/components/notifications-history-page";

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
  }),
  usePathname: () => "/notifications-history",
}));

afterEach(() => {
  cleanup();
  routerPush.mockClear();
  routerRefresh.mockClear();
  window.history.pushState(null, "", "/");
});

describe("NotificationsHistoryPage", () => {
  test("renders the notifications table state", () => {
    render(<NotificationsHistoryPage viewModel={getNotificationsHistoryViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Notifications", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("New Gift Received")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New Text Testimony Submitted" })).toHaveAttribute("href", "/testimonies?view=1&origin=notification");
  });

  test("renders the notification drawer panel state", () => {
    render(<NotificationsHistoryPage viewModel={getNotificationsHistoryViewModel({ panel: "1" })} />);

    expect(screen.getAllByRole("heading", { name: "Notifications" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "View all notifications" })).toHaveAttribute("href", "/notifications-history");
    expect(screen.getByText("Mark All as Read")).toBeInTheDocument();
  });

  test("renders empty and error states", () => {
    render(<NotificationsHistoryPage viewModel={getNotificationsHistoryViewModel({ state: "empty" })} />);
    expect(screen.getByText("No Notifications Yet")).toBeInTheDocument();
    cleanup();
    render(<NotificationsHistoryPage viewModel={getNotificationsHistoryViewModel({ state: "error" })} />);
    expect(screen.getByText("We could not load notifications right now. Please try again.")).toBeInTheDocument();
  });

  test("renders filter and delete states", () => {
    render(<NotificationsHistoryPage viewModel={getNotificationsHistoryViewModel({ filter: "1" })} />);
    expect(screen.getByRole("heading", { name: "Filter" })).toBeInTheDocument();
    expect(screen.getByText("Date Range")).toBeInTheDocument();
    cleanup();
    render(<NotificationsHistoryPage viewModel={getNotificationsHistoryViewModel({ deleteAll: "1", selected: "1,2" })} />);
    expect(screen.getByRole("heading", { name: "Delete Notification" })).toBeInTheDocument();
  });

  test("selects notifications and opens filter locally", async () => {
    const user = userEvent.setup();
    render(<NotificationsHistoryPage viewModel={getNotificationsHistoryViewModel({})} />);

    await user.click(screen.getByRole("button", { name: "Select notification 1" }));

    expect(screen.getByRole("link", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mark as read" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Filter" }));

    expect(screen.getByRole("heading", { name: "Filter" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dismiss notifications filter" }));

    expect(screen.queryByRole("heading", { name: "Filter" })).not.toBeInTheDocument();
  });

  test("renders success state", () => {
    render(<NotificationsHistoryPage viewModel={getNotificationsHistoryViewModel({ success: "delete" })} />);
    expect(screen.getByText("Notifications deleted successfully!")).toBeInTheDocument();
  });

  test("closes route-opened delete notification modal without router navigation", async () => {
    const user = userEvent.setup();
    window.history.pushState(null, "", "/notifications-history?delete=1");
    render(<NotificationsHistoryPage viewModel={getNotificationsHistoryViewModel({ delete: "1" })} />);

    await user.click(screen.getByRole("button", { name: "Cancel delete notification" }));

    expect(screen.queryByRole("heading", { name: "Delete Notification" })).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe("/notifications-history");
    expect(window.location.search).not.toContain("delete=");
  });

  test("marks selected notifications as read in mocked route state", () => {
    const viewModel = getNotificationsHistoryViewModel({ selected: "2", read: "selected", success: "read" });

    expect(viewModel.rows.find((row) => row.id === 2)?.status).toBe("read");
    render(<NotificationsHistoryPage viewModel={viewModel} />);
    expect(screen.getByText("Notifications marked as read.")).toBeInTheDocument();
  });
});
