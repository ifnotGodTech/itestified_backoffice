import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type { HelpFaqRow, HelpFaqViewModel } from "@/features/admin/domain/entities/help-faqs";

export function getHelpFaqsViewModel(input: { fullName?: string }): HelpFaqViewModel {
  return {
    shell: getAdminShellViewModel({ activeHref: "/help-faqs", fullName: input.fullName }),
    pageTitle: "Help FAQ",
    pageDescription:
      "Manage the frequently asked questions shown on the Help screen. Only active entries appear in the app, in the order shown here.",
    rows: [],
  };
}

export async function getHelpFaqsViewModelFromApi(
  input: { fullName?: string },
  cookieHeader: string,
): Promise<HelpFaqViewModel> {
  const vm = getHelpFaqsViewModel(input);
  try {
    const response = await fetch(`${backendBaseUrl}/profile-content/admin/faqs/`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return { ...vm, loadError: "We could not load the FAQ list right now. Please try again." };
    }
    const payload = (await response.json().catch(() => [])) as Array<{
      id: number;
      question: string;
      answer: string;
      is_active: boolean;
      updated_at: string | null;
    }>;
    const rows: HelpFaqRow[] = payload.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      isActive: item.is_active,
      updatedAt: item.updated_at,
    }));
    return { ...vm, rows };
  } catch {
    return { ...vm, loadError: "We could not load the FAQ list right now. Please try again." };
  }
}
