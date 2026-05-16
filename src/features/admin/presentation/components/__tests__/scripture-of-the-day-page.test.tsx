import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getScriptureOfTheDayViewModel } from "@/features/admin";
import { ScriptureOfTheDayPage } from "@/features/admin/presentation/components/scripture-of-the-day-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/scripture-of-the-day",
}));

afterEach(() => {
  cleanup();
});

describe("ScriptureOfTheDayPage", () => {
  test("renders the overview table state", () => {
    render(<ScriptureOfTheDayPage viewModel={getScriptureOfTheDayViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Scripture of the day" })).toBeInTheDocument();
    expect(screen.getByText("Upload New Scripture")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getAllByText("Jeremiah 29:11")).toHaveLength(3);
  });

  test("renders the scripture action menu state", () => {
    render(<ScriptureOfTheDayPage viewModel={getScriptureOfTheDayViewModel({ menu: "1" })} />);

    expect(screen.getByRole("link", { name: "View" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Delete" })).toBeInTheDocument();
  });

  test("renders the scheduled scripture detail state", () => {
    render(<ScriptureOfTheDayPage viewModel={getScriptureOfTheDayViewModel({ view: "2" })} />);

    expect(screen.getByRole("heading", { name: "Scripture Details" })).toBeInTheDocument();
    expect(screen.getByText("Scheduled Date")).toBeInTheDocument();
    expect(screen.getAllByText("Scheduled", { exact: true }).length).toBeGreaterThan(0);
  });

  test("renders the edit scripture overlay", () => {
    render(<ScriptureOfTheDayPage viewModel={getScriptureOfTheDayViewModel({ edit: "1" })} />);

    expect(screen.getByRole("heading", { name: "Edit Scripture" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });

  test("renders the upload new scripture overlay", () => {
    render(<ScriptureOfTheDayPage viewModel={getScriptureOfTheDayViewModel({ edit: "new" })} />);

    expect(screen.getAllByRole("heading", { name: "Schedule Scriptures" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Schedule Settings")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ Add New" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Schedule Scriptures" })).toHaveAttribute("href", "/scripture-of-the-day?edit=new");
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
  });

  test("renders the delete confirmation flow", () => {
    render(<ScriptureOfTheDayPage viewModel={getScriptureOfTheDayViewModel({ remove: "1" })} />);

    expect(screen.getByText("Delete Scripture?")).toBeInTheDocument();
    expect(screen.getByText("Yes, delete")).toBeInTheDocument();
  });

  test("renders the filter modal", () => {
    render(<ScriptureOfTheDayPage viewModel={getScriptureOfTheDayViewModel({ filter: "1" })} />);

    expect(screen.getAllByText("Filter").length).toBeGreaterThan(0);
    expect(screen.getByText("Date Range")).toBeInTheDocument();
    expect(screen.getByText("Clear All")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
  });

  test("renders the save confirmation state", () => {
    render(<ScriptureOfTheDayPage viewModel={getScriptureOfTheDayViewModel({ saved: "1", scripture: "Updated scripture" })} />);

    expect(screen.getByText("Scripture updated successfully.")).toBeInTheDocument();
    expect(screen.getByText("Upload New Scripture")).toBeInTheDocument();
  });
});
