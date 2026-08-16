import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getHomePromosViewModel } from "@/features/admin/data/services/get-home-promos-view-model";
import { HomePromosPage } from "@/features/admin/presentation/components/home-promos-page";
import type { HomePromoRow } from "@/features/admin/domain/entities/home-promos";

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
  }),
  usePathname: () => "/home-promos",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  routerPush.mockClear();
  routerRefresh.mockClear();
  window.history.pushState(null, "", "/");
});

function makeRow(overrides: Partial<HomePromoRow> = {}): HomePromoRow {
  return {
    id: 1,
    title: "Someone's breakthrough is waiting on yours",
    body: "Every gift keeps testimonies free to read, share, and film.",
    imageUrl: "",
    ctaLabel: "Give Today",
    ctaDestination: "giving",
    ctaUrl: "",
    startsAt: "2026-08-10T00:00:00Z",
    endsAt: "",
    isActive: true,
    status: "active",
    updatedByEmail: "admin@example.com",
    windowLabel: "10 Aug 2026 – No end date",
    ...overrides,
  };
}

describe("HomePromosPage", () => {
  test("renders the promo list with a row and the create form", () => {
    const viewModel = { ...getHomePromosViewModel({}), phaseState: "populated" as const, rows: [makeRow()] };

    render(<HomePromosPage viewModel={viewModel} />);

    expect(screen.getByRole("heading", { name: "Home Promos", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Someone's breakthrough is waiting on yours")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "New Promo Card" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Promo Card" })).toBeInTheDocument();
  });

  test("renders an empty state when there are no promo cards", () => {
    const viewModel = { ...getHomePromosViewModel({}), phaseState: "empty" as const, rows: [] };

    render(<HomePromosPage viewModel={viewModel} />);

    expect(screen.getByText("No promo cards here yet.")).toBeInTheDocument();
  });

  test("renders an error state", () => {
    const viewModel = getHomePromosViewModel({ state: "error" });

    render(<HomePromosPage viewModel={viewModel} />);

    expect(screen.getByText("Unable to load promo cards")).toBeInTheDocument();
  });

  test("editing a row pre-fills the form and shows Save Changes", () => {
    const row = makeRow();
    const viewModel = { ...getHomePromosViewModel({}), phaseState: "populated" as const, rows: [row], editingRow: row };

    render(<HomePromosPage viewModel={viewModel} />);

    expect(screen.getByRole("heading", { name: "Edit Promo Card" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Someone's breakthrough is waiting on yours")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });

  test("opening a row's menu offers Deactivate for an active card and Activate for an inactive one", async () => {
    const user = userEvent.setup();
    const activeRow = makeRow({ id: 1, isActive: true, status: "active" });
    const inactiveRow = makeRow({ id: 2, title: "Invite a friend", isActive: false, status: "inactive" });
    const viewModel = {
      ...getHomePromosViewModel({}),
      phaseState: "populated" as const,
      rows: [activeRow, inactiveRow],
    };

    render(<HomePromosPage viewModel={viewModel} />);

    await user.click(screen.getByLabelText("Open actions for promo 1"));
    expect(screen.getByRole("button", { name: "Deactivate" })).toBeInTheDocument();
    await user.click(screen.getByLabelText("Open actions for promo 1"));

    await user.click(screen.getByLabelText("Open actions for promo 2"));
    expect(screen.getByRole("button", { name: "Activate" })).toBeInTheDocument();
  });

  test("the CTA URL field only appears when the destination is External URL", async () => {
    const user = userEvent.setup();
    render(<HomePromosPage viewModel={{ ...getHomePromosViewModel({}), phaseState: "populated" as const, rows: [] }} />);

    expect(screen.queryByPlaceholderText("https://itestified.app/events/convention")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByDisplayValue("No CTA"), "external_url");

    expect(screen.getByPlaceholderText("https://itestified.app/events/convention")).toBeInTheDocument();
  });

  test("switching status tabs fetches and swaps in the new view model", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const status = new URL(url, "http://localhost").searchParams.get("status") ?? "all";
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ...getHomePromosViewModel({}),
            activeStatus: status,
            phaseState: "populated",
            rows: [makeRow({ title: `${status} card` })],
          }),
        });
      }),
    );

    render(<HomePromosPage viewModel={{ ...getHomePromosViewModel({}), phaseState: "populated" as const, rows: [makeRow()] }} />);

    await user.click(screen.getByRole("button", { name: "Scheduled" }));

    await waitFor(() => {
      expect(screen.getByText("scheduled card")).toBeInTheDocument();
    });
  });
});
