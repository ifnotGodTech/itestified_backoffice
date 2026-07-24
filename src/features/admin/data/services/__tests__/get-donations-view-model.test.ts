import { afterEach, describe, expect, test, vi } from "vitest";
import { getDonationsViewModelFromApi } from "@/features/admin/data/services/get-donations-view-model";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getDonationsViewModelFromApi", () => {
  // Regression coverage for UI_UX_REVIEW_TODO.md B9: the tab badge total used to be a
  // hardcoded per-tab literal ("Successful Donations (₦5,000)") unrelated to any real data,
  // even when the load genuinely succeeded. It should now reflect the backend's real
  // status-filtered SUM(amount) aggregate.
  test("computes the tab badge total from the backend's real totals aggregate", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              count: 1,
              results: [
                {
                  id: 7,
                  donor_name: "Alpha Donor",
                  donor_email: "alpha@example.com",
                  amount: 150000,
                  currency: "NGN",
                  created_at: "2026-07-20",
                  status: "successful",
                  payment_reference: "DON-7",
                },
              ],
              next: null,
              previous: null,
              totals: [{ currency: "NGN", amount: 150000 }],
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
        ),
      ),
    );

    const viewModel = await getDonationsViewModelFromApi({ tab: "successful" }, "sessionid=ok");

    expect(viewModel.phaseState).toBe("populated");
    expect(viewModel.tableBadge.totalLabel).toBe("Successful Donations (₦1,500.00)");
    expect(viewModel.tableBadge.totalLabel).not.toBe("Successful Donations (₦5,000)");
  });

  test("shows Mixed currencies when the filtered totals span more than one currency", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              count: 2,
              results: [],
              next: null,
              previous: null,
              totals: [
                { currency: "NGN", amount: 100000 },
                { currency: "USD", amount: 250000 },
              ],
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
        ),
      ),
    );

    const viewModel = await getDonationsViewModelFromApi({ tab: "all" }, "sessionid=ok");

    expect(viewModel.tableBadge.totalLabel).toBe("Total Donations (Mixed currencies)");
  });

  test("does not silently serve fixture totals when the backend is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network down"))),
    );

    const viewModel = await getDonationsViewModelFromApi({ tab: "successful" }, "sessionid=network-down");

    expect(viewModel.phaseState).toBe("error");
    expect(viewModel.tableBadge.totalLabel).toBe("Successful Donations (—)");
    expect(viewModel.tableBadge.donorsLabel).toBe("Donors (—)");
    expect(viewModel.tableBadge.totalLabel).not.toBe("Successful Donations (₦5,000)");
  });
});
