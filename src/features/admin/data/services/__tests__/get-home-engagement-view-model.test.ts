import { afterEach, describe, expect, test, vi } from "vitest";
import {
  formatDuration,
  getHomeEngagementViewModelFromApi,
  normalizePeriod,
} from "@/features/admin/data/services/get-home-engagement-view-model";

// Phase 35 Slice 5: the dashboard's Home engagement card.

afterEach(() => {
  vi.unstubAllGlobals();
});

function summary(overrides: Record<string, unknown> = {}) {
  return {
    days: 7,
    median_view_ms: 41000,
    swipes_per_session: 7,
    searches_per_day: 20,
    search_play_rate: 0.333,
    response_rate: 0.08,
    items_viewed: 1200,
    sessions: 300,
    series: [
      { day: "2026-10-09", items_viewed: 150, responses: 11 },
      { day: "2026-10-10", items_viewed: 190, responses: 14 },
      { day: "2026-10-11", items_viewed: 120, responses: 9 },
      { day: "2026-10-12", items_viewed: 210, responses: 16 },
      { day: "2026-10-13", items_viewed: 170, responses: 12 },
      { day: "2026-10-14", items_viewed: 260, responses: 22 },
      { day: "2026-10-15", items_viewed: 100, responses: 12 },
    ],
    ...overrides,
  };
}

function stubBackend(body: unknown, status = 200) {
  const fetchMock = vi.fn<typeof fetch>(async () =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("Home engagement view model", () => {
  test("turns the worked example into plain numbers and sentences", async () => {
    const fetchMock = stubBackend(summary());

    const viewModel = await getHomeEngagementViewModelFromApi({}, "sessionid=abc");

    expect(String(fetchMock.mock.calls[0][0])).toContain("/engagement/admin/home/?days=7");
    expect(viewModel.phaseState).toBe("populated");
    expect(viewModel.numbers.map((number) => [number.label, number.value])).toEqual([
      ["Time on a testimony", "41s"],
      ["Swipes per visit", "7.0"],
      ["Searches a day", "20"],
      ["Response rate", "8%"],
    ]);
    expect(viewModel.numbers[2].meaning).toBe("33% of searches led to a result being played.");
    expect(viewModel.days.map((day) => day.label)).toEqual([
      "Fri 9",
      "Sat 10",
      "Sun 11",
      "Mon 12",
      "Tue 13",
      "Wed 14",
      "Today",
    ]);
    expect(viewModel.shell.sidebarItems.find((item) => item.href === "/analytics")?.children?.[0]).toMatchObject({
      label: "Home engagement",
      active: true,
    });
  });

  test("nothing yet is an empty state with dashes, not zeros dressed as results", async () => {
    stubBackend(
      summary({
        median_view_ms: 0,
        swipes_per_session: null,
        searches_per_day: 0,
        search_play_rate: null,
        response_rate: null,
        items_viewed: 0,
        sessions: 0,
      }),
    );

    const viewModel = await getHomeEngagementViewModelFromApi({ period: "30" }, "");

    expect(viewModel.phaseState).toBe("empty");
    expect(viewModel.period).toBe(30);
    expect(viewModel.numbers.map((number) => number.value)).toEqual(["—", "—", "0", "—"]);
    expect(viewModel.numbers[2].meaning).toBe("No searches in this period yet.");
  });

  test("a failed request is an error state", async () => {
    stubBackend({ detail: "nope" }, 403);

    const viewModel = await getHomeEngagementViewModelFromApi({}, "");

    expect(viewModel.phaseState).toBe("error");
  });

  test("periods and durations", () => {
    expect([normalizePeriod("90"), normalizePeriod("12"), normalizePeriod()]).toEqual([90, 7, 7]);
    expect([formatDuration(0), formatDuration(41000), formatDuration(72000), formatDuration(120000)]).toEqual([
      "—",
      "41s",
      "1m 12s",
      "2m",
    ]);
  });
});
