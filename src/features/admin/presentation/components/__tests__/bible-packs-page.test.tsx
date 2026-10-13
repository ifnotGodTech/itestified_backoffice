import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { withGuards } from "@/features/admin/data/services/get-bible-packs-view-model";
import type { BiblePackRow, BiblePacksViewModel } from "@/features/admin/domain/entities/bible-packs";
import { BiblePacksPage } from "@/features/admin/presentation/components/bible-packs-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/bible-packs",
}));

afterEach(() => cleanup());

type Base = Omit<BiblePackRow, "hideBlockedReason" | "canMakeDefault">;

function pack(overrides: Partial<Base>): Base {
  return {
    code: "bsb",
    kind: "version",
    name: "Berean Standard Bible",
    abbreviation: "BSB",
    description: "Modern English",
    attribution: "The Holy Bible, Berean Standard Bible. Public domain.",
    supportsWordStudy: true,
    sizeBytes: 5865473,
    dataVersion: 2,
    isEnabled: true,
    isDefault: true,
    updatedAt: null,
    ...overrides,
  };
}

function viewModel(overrides: Partial<BiblePacksViewModel> = {}): BiblePacksViewModel {
  const rows = withGuards([
    pack({}),
    pack({ code: "kjv", name: "King James Version", abbreviation: "KJV", description: "Classic English", isDefault: false }),
    pack({ code: "niv", name: "New International Version", abbreviation: "NIV", isDefault: false, isEnabled: false }),
    pack({ code: "study", kind: "study", name: "Word study & concordance", abbreviation: "STUDY", isDefault: false, sizeBytes: 10758488, dataVersion: 1 }),
  ]);
  return {
    shell: getAdminShellViewModel({ activeHref: "/bible-packs" }),
    phaseState: "populated",
    versions: rows.filter((row) => row.kind === "version"),
    studyPacks: rows.filter((row) => row.kind === "study"),
    changes: [],
    confirmHide: null,
    ...overrides,
  };
}

describe("BiblePacksPage", () => {
  test("shows each Bible with its status, size, data version and actions", () => {
    render(<BiblePacksPage viewModel={viewModel()} />);

    expect(screen.getByRole("heading", { name: "Bible downloads", level: 1 })).toBeInTheDocument();
    const bsb = screen.getByRole("article", { name: "Berean Standard Bible" });
    expect(within(bsb).getByText("Default for new readers")).toBeInTheDocument();
    expect(within(bsb).getByText("5.6 MB · Data version 2 · Word study")).toBeInTheDocument();
    expect(within(bsb).queryByRole("button", { name: "Make default" })).toBeNull();
    expect(within(bsb).getByText(/Make another version the default before hiding it/)).toBeInTheDocument();

    const kjv = screen.getByRole("article", { name: "King James Version" });
    expect(within(kjv).getByRole("button", { name: "Make default" }).closest("form")).toHaveAttribute(
      "action",
      "/api/admin/bible-packs/kjv/make-default",
    );
    expect(within(kjv).getByRole("link", { name: "Hide from readers" })).toHaveAttribute(
      "href",
      "/bible-packs?confirm=hide&code=kjv",
    );

    const niv = screen.getByRole("article", { name: "New International Version" });
    expect(within(niv).getByText("Hidden")).toBeInTheDocument();
    expect(within(niv).getByRole("button", { name: "Make available" }).closest("form")).toHaveAttribute(
      "action",
      "/api/admin/bible-packs/niv/enable",
    );
  });

  test("word study has its own section and says which Bibles need it", () => {
    render(<BiblePacksPage viewModel={viewModel()} />);
    const study = screen.getByRole("article", { name: "Word study & concordance" });
    expect(within(study).getByText(/Word study is used by BSB, KJV/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Word study" })).toBeInTheDocument();
  });

  test("credits shown to readers are one click away", () => {
    render(<BiblePacksPage viewModel={viewModel()} />);
    const bsb = screen.getByRole("article", { name: "Berean Standard Bible" });
    expect(within(bsb).getByText("The Holy Bible, Berean Standard Bible. Public domain.")).toBeInTheDocument();
  });

  test("hiding asks first and explains what readers will see", () => {
    const model = viewModel();
    render(<BiblePacksPage viewModel={{ ...model, confirmHide: model.versions[1] }} />);

    const dialog = screen.getByRole("dialog", { name: "Hide King James Version?" });
    expect(within(dialog).getByText(/already downloaded it keep it/)).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Hide KJV" }).closest("form")).toHaveAttribute(
      "action",
      "/api/admin/bible-packs/kjv/disable",
    );
    expect(within(dialog).getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/bible-packs");
  });

  test("outcomes show as a banner, and the history lists who did what", () => {
    render(
      <BiblePacksPage
        viewModel={viewModel({
          phaseState: "success",
          bannerMessage: "King James Version is now the Bible new readers download first.",
          changes: [{ packName: "King James Version", action: "made_default", actorName: "Bible Admin", createdAt: "2026-10-13T10:00:00Z" }],
        })}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("King James Version is now the Bible new readers download first.");
    expect(screen.getByText("Bible Admin").closest("li")).toHaveTextContent("Bible Admin made King James Version the default");
  });

  test("a load failure shows the error state", () => {
    render(
      <BiblePacksPage
        viewModel={viewModel({ phaseState: "error", versions: [], studyPacks: [], errorMessage: "We could not load the Bible settings right now." })}
      />,
    );
    expect(screen.getByText("Unable to load the Bible settings")).toBeInTheDocument();
  });

  test("Bible downloads sits among the dashboard's settings", () => {
    const shell = getAdminShellViewModel({ activeHref: "/bible-packs" });
    expect(shell.settingsItems).toContainEqual(expect.objectContaining({ label: "Bible downloads", href: "/bible-packs" }));
  });
});
