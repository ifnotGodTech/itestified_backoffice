import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type { LiveBroadcastsViewModel } from "@/features/admin/domain/entities/live-broadcasts";
import { LiveBroadcastsPage } from "@/features/admin/presentation/components/live-broadcasts-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/live-broadcasts",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function baseViewModel(overrides: Partial<LiveBroadcastsViewModel> = {}): LiveBroadcastsViewModel {
  return {
    shell: getAdminShellViewModel({ activeHref: "/live-broadcasts" }),
    phaseState: "populated",
    pageTitle: "Live Broadcasts",
    pageDescription: "Monitor active and scheduled Ministry broadcasts.",
    active: [
      {
        id: 1,
        title: "Sunday Service",
        ministryName: "Grace Chapel",
        ministryAvatar: "",
        startedAtLabel: "25 Aug, 2026, 10:00",
        elapsedLabel: "12m",
        viewerCount: 7,
        maxViewersApplied: 50,
        maxDurationMinutesApplied: 30,
        reservedMinutesThisMonth: 350,
        totalAllowanceMinutes: 1500,
        remainingAllowanceMinutes: 1150,
      },
    ],
    scheduled: [
      {
        id: 2,
        title: "Midweek Prayer",
        ministryName: "River of Life",
        ministryAvatar: "",
        scheduledAtLabel: "26 Aug, 2026, 18:00",
      },
    ],
    policyMaxConcurrentViewers: 50,
    policyMaxDurationMinutes: 30,
    ...overrides,
  };
}

describe("LiveBroadcastsPage", () => {
  test("renders active and scheduled broadcasts", () => {
    render(<LiveBroadcastsPage viewModel={baseViewModel()} />);

    expect(screen.getByRole("heading", { name: "Live Broadcasts", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Grace Chapel")).toBeInTheDocument();
    expect(screen.getByText("Sunday Service")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("River of Life")).toBeInTheDocument();
    expect(screen.getByText("Midweek Prayer")).toBeInTheDocument();
    expect(screen.getByText("Cap: 50 viewers / 30 min")).toBeInTheDocument();
  });

  test("renders empty-section messaging when there is nothing to show", () => {
    render(<LiveBroadcastsPage viewModel={baseViewModel({ active: [], scheduled: [], phaseState: "empty" })} />);

    expect(screen.getByText("No Ministry is broadcasting right now.")).toBeInTheDocument();
    expect(screen.getByText("Nothing scheduled.")).toBeInTheDocument();
  });

  test("renders an error state instead of the tables", () => {
    render(
      <LiveBroadcastsPage
        viewModel={baseViewModel({ phaseState: "error", active: [], scheduled: [], errorMessage: "Backend is down." })}
      />,
    );

    expect(screen.getByText("Unable to load live broadcasts")).toBeInTheDocument();
    expect(screen.getByText("Backend is down.")).toBeInTheDocument();
    expect(screen.queryByText("No Ministry is broadcasting right now.")).not.toBeInTheDocument();
  });

  test("polls the monitor endpoint on an interval and swaps in fresh data", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const refreshed = baseViewModel({
      active: [
        {
          id: 1,
          title: "Sunday Service",
          ministryName: "Grace Chapel",
          ministryAvatar: "",
          startedAtLabel: "25 Aug, 2026, 10:00",
          elapsedLabel: "32m",
          viewerCount: 41,
          maxViewersApplied: 50,
          maxDurationMinutesApplied: 30,
          reservedMinutesThisMonth: 350,
          totalAllowanceMinutes: 1500,
          remainingAllowanceMinutes: 1150,
        },
      ],
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => refreshed,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LiveBroadcastsPage viewModel={baseViewModel()} />);
    expect(screen.getByText("7")).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(20000);

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/live-broadcasts/monitor", { cache: "no-store" });
    await waitFor(() => {
      expect(screen.getByText("41")).toBeInTheDocument();
    });
  });

  test("keeps the last good snapshot when a poll fails", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    render(<LiveBroadcastsPage viewModel={baseViewModel()} />);
    await vi.advanceTimersByTimeAsync(20000);

    expect(fetchMock).toHaveBeenCalled();
    expect(screen.getByText("Grace Chapel")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});
