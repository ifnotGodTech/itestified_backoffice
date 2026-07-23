import { afterEach, describe, expect, test, vi } from "vitest";
import { getScriptureOfTheDayViewModelFromApi } from "@/features/admin/data/services/get-scripture-of-the-day-view-model";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getScriptureOfTheDayViewModelFromApi", () => {
  test("maps a successful backend response instead of the fixture rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              count: 1,
              results: [
                {
                  id: 42,
                  date: "2026-07-20",
                  bible_text: "Psalm 23:1",
                  scripture: "The Lord is my shepherd.",
                  prayer: "Thank you Lord",
                  bible_version: "NIV",
                  status: "published",
                },
              ],
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
        ),
      ),
    );

    const viewModel = await getScriptureOfTheDayViewModelFromApi({}, "sessionid=ok");

    expect(viewModel.phaseState).toBe("populated");
    expect(viewModel.rows).toHaveLength(1);
    expect(viewModel.rows[0]).toMatchObject({ id: 42, bibleText: "Psalm 23:1", status: "Uploaded" });
  });

  // Regression coverage for UI_UX_REVIEW_TODO.md B1: this service used to silently fall back to
  // fixture rows (and their attached selectedRow/modal state) on failure, with no error signal at all.
  test("does not silently serve fixture rows when the backend is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network down"))),
    );

    const viewModel = await getScriptureOfTheDayViewModelFromApi({ view: "1" }, "sessionid=network-down");

    expect(viewModel.phaseState).toBe("error");
    expect(viewModel.errorMessage).toBeTruthy();
    expect(viewModel.rows).toHaveLength(0);
    expect(viewModel.selectedRow).toBeNull();
    expect(viewModel.showDetails).toBe(false);
    expect(viewModel.showActionMenu).toBe(false);
    expect(viewModel.showEdit).toBe(false);
    expect(viewModel.showDeleteConfirm).toBe(false);
  });

  test("does not silently serve fixture rows when the backend responds with an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("", { status: 500 }))),
    );

    const viewModel = await getScriptureOfTheDayViewModelFromApi({ edit: "1" }, "sessionid=backend-500");

    expect(viewModel.phaseState).toBe("error");
    expect(viewModel.rows).toHaveLength(0);
    expect(viewModel.selectedRow).toBeNull();
    expect(viewModel.showEdit).toBe(false);
  });
});
