import { afterEach, describe, expect, test, vi } from "vitest";
import { getDonationsViewModelFromApi, mapDonationDetail } from "@/features/admin/data/services/get-donations-view-model";

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

describe("mapDonationDetail", () => {
  // Regression coverage for Phase 5 Slice 6: the dashboard's donation detail
  // modal used to reuse the list row it already had in memory instead of
  // calling AdminDonationDetailView, so provider and status history were
  // never surfaced even though the backend returns them.
  test("maps provider and status history from the admin detail endpoint payload", () => {
    const detail = mapDonationDetail({
      id: 9,
      donor_name: "Grace Okafor",
      donor_email: "grace@example.com",
      amount: 250000,
      currency: "NGN",
      status: "reversed",
      payment_reference: "DON-9",
      provider: "flutterwave",
      provider_transaction_id: "FLW998877",
      created_at: "2026-07-20T10:00:00Z",
      status_reason: "Requested by donor",
      status_history: [
        {
          id: 1,
          from_status: "successful",
          to_status: "reversed",
          reason: "Duplicate charge",
          actor_email: "admin@itestified.org",
          created_at: "2026-07-22T09:30:00Z",
        },
      ],
    });

    expect(detail.provider).toBe("flutterwave");
    expect(detail.statusReason).toBe("Requested by donor");
    expect(detail.statusHistory).toHaveLength(1);
    expect(detail.statusHistory[0]).toMatchObject({
      fromStatus: "successful",
      toStatus: "reversed",
      reason: "Duplicate charge",
      actorEmail: "admin@itestified.org",
    });
  });

  test("defaults status history to an empty list when the backend omits it", () => {
    const detail = mapDonationDetail({ id: 1, donor_name: "X", donor_email: "x@example.com" });
    expect(detail.statusHistory).toEqual([]);
  });
});
