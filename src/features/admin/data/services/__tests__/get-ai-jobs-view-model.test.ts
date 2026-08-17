import { afterEach, describe, expect, test, vi } from "vitest";
import { getAIJobsViewModelFromApi } from "@/features/admin/data/services/get-ai-jobs-view-model";

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

describe("getAIJobsViewModelFromApi", () => {
  test("merges transcription and translation jobs, newest updated_at first", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("transcription-jobs")) {
          return Promise.resolve(
            jsonResponse({
              results: [
                {
                  id: 1,
                  testimony_id: 9,
                  testimony_title: "Restoration",
                  status: "failed",
                  error_message: "boom",
                  retry_count: 1,
                  updated_at: "2026-08-17T10:00:00Z",
                },
              ],
            }),
          );
        }
        return Promise.resolve(
          jsonResponse({
            results: [
              {
                id: 5,
                testimony_id: 9,
                testimony_title: "Restoration",
                language: "fr",
                status: "done",
                error_message: "",
                retry_count: 0,
                updated_at: "2026-08-17T12:00:00Z",
              },
            ],
          }),
        );
      }),
    );

    const viewModel = await getAIJobsViewModelFromApi({}, "sessionid=ok");

    expect(viewModel.phaseState).toBe("populated");
    expect(viewModel.rows).toHaveLength(2);
    // The 12:00 translation job is newer than the 10:00 transcription job.
    expect(viewModel.rows[0].kind).toBe("translation");
    expect(viewModel.rows[0].language).toBe("fr");
    expect(viewModel.rows[1].kind).toBe("transcription");
    expect(viewModel.rows[1].errorMessage).toBe("boom");
  });

  test("reports an error state when either backend call fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("transcription-jobs")) {
          return Promise.resolve(new Response("", { status: 500 }));
        }
        return Promise.resolve(jsonResponse({ results: [] }));
      }),
    );

    const viewModel = await getAIJobsViewModelFromApi({}, "sessionid=ok");

    expect(viewModel.phaseState).toBe("error");
    expect(viewModel.rows).toHaveLength(0);
  });

  test("reports an empty state when both lists are empty", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ results: [] }))));

    const viewModel = await getAIJobsViewModelFromApi({ status: "failed" }, "sessionid=ok");

    expect(viewModel.phaseState).toBe("empty");
    expect(viewModel.statusFilter).toBe("failed");
  });
});
