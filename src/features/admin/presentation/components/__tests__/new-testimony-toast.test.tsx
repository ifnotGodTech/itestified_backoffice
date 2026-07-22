import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { NewTestimonyToast } from "@/features/admin/presentation/components/testimonies/new-testimony-toast";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe("NewTestimonyToast", () => {
  test("marks a notification as seen when it is shown", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          item: {
            id: 42,
            title: "New testimony submitted",
            message: "A user submitted a written testimony.",
            created_at: "2026-07-22T10:00:00Z",
          },
        }),
      }),
    );

    render(<NewTestimonyToast />);

    await waitFor(() => {
      expect(screen.getByText("New testimony submitted")).toBeInTheDocument();
    });
    expect(window.localStorage.getItem("admin:last_seen_testimony_notification_id")).toBe("42");
  });
});
