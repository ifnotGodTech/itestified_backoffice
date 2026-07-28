import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getHelpFaqsViewModel } from "@/features/admin/data/services/get-help-faqs-view-model";
import { HelpFaqsPage } from "@/features/admin/presentation/components/help-faqs-page";
import type { HelpFaqViewModel } from "@/features/admin/domain/entities/help-faqs";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/help-faqs",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function viewModelWithRows(): HelpFaqViewModel {
  const vm = getHelpFaqsViewModel({});
  vm.rows = [
    { id: 1, question: "How do I post?", answer: "Tap the + button.", isActive: true, updatedAt: null },
    { id: 2, question: "How do I donate?", answer: "Open Giving.", isActive: true, updatedAt: null },
  ];
  return vm;
}

describe("HelpFaqsPage", () => {
  test("renders the empty state and the seeded rows", () => {
    render(<HelpFaqsPage viewModel={getHelpFaqsViewModel({})} />);
    expect(screen.getByText("No FAQ entries yet.")).toBeInTheDocument();
    cleanup();

    render(<HelpFaqsPage viewModel={viewModelWithRows()} />);
    expect(screen.getByText("How do I post?")).toBeInTheDocument();
    expect(screen.getByText("How do I donate?")).toBeInTheDocument();
  });

  test("adds a new FAQ entry", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 3, question: "New question?", answer: "New answer.", is_active: true, updated_at: null }),
      }),
    );
    render(<HelpFaqsPage viewModel={getHelpFaqsViewModel({})} />);

    await user.type(screen.getByPlaceholderText("Question"), "New question?");
    await user.type(screen.getByPlaceholderText("Answer"), "New answer.");
    await user.click(screen.getByRole("button", { name: "Add FAQ" }));

    await waitFor(() => {
      expect(screen.getByText("New question?")).toBeInTheDocument();
    });
  });

  test("hides an entry from the app without deleting it", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, question: "How do I post?", answer: "Tap the + button.", is_active: false, updated_at: null }),
      }),
    );
    render(<HelpFaqsPage viewModel={viewModelWithRows()} />);

    await user.click(screen.getAllByRole("button", { name: "Hide" })[0]);

    await waitFor(() => {
      expect(screen.getByText("How do I post?")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Hidden from app")).toHaveLength(1);
  });

  test("removes an entry", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    render(<HelpFaqsPage viewModel={viewModelWithRows()} />);

    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    await waitFor(() => {
      expect(screen.queryByText("How do I post?")).not.toBeInTheDocument();
    });
    expect(screen.getByText("How do I donate?")).toBeInTheDocument();
  });

  test("moving the first row down submits the swapped order to the reorder endpoint", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchSpy);
    render(<HelpFaqsPage viewModel={viewModelWithRows()} />);

    await user.click(screen.getByRole("button", { name: 'Move "How do I post?" down' }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/admin/help-faqs/reorder",
        expect.objectContaining({ method: "PUT" }),
      );
    });
    const [, options] = fetchSpy.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ ordered_ids: [2, 1] });
  });
});
