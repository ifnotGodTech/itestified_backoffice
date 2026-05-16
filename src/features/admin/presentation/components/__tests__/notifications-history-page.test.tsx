import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getNotificationsHistoryViewModel } from "@/features/admin/data/services/get-notifications-history-view-model";
import { NotificationsHistoryPage } from "@/features/admin/presentation/components/notifications-history-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/notifications-history",
}));

afterEach(() => {
  cleanup();
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

  test("renders success state", () => {
    render(<NotificationsHistoryPage viewModel={getNotificationsHistoryViewModel({ success: "delete" })} />);
    expect(screen.getByText("Notifications deleted successfully!")).toBeInTheDocument();
  });

  test("marks selected notifications as read in mocked route state", () => {
    const viewModel = getNotificationsHistoryViewModel({ selected: "2", read: "selected", success: "read" });

    expect(viewModel.rows.find((row) => row.id === 2)?.status).toBe("read");
    render(<NotificationsHistoryPage viewModel={viewModel} />);
    expect(screen.getByText("Notifications marked as read.")).toBeInTheDocument();
  });
});
