import type {
  AdminOverviewTableRow,
  AdminOverviewViewModel,
} from "@/features/admin/domain/entities/overview";
import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";

const filledRows: AdminOverviewTableRow[] = [
  { id: 1, category: "Deliverance", type: "Video", likes: 100, shares: 25, comments: 30, overall: 155 },
  { id: 2, category: "Healing", type: "Video", likes: 150, shares: 55, comments: 50, overall: 255 },
  { id: 3, category: "Salvation", type: "Video", likes: 150, shares: 55, comments: 50, overall: 255 },
  { id: 4, category: "Child Birth", type: "Video", likes: 150, shares: 55, comments: 50, overall: 255 },
  { id: 5, category: "Financial Miracles", type: "Video", likes: 150, shares: 55, comments: 50, overall: 255 },
];

export function getAdminOverviewViewModel(input: {
  empty?: boolean;
  fullName?: string;
}): AdminOverviewViewModel {
  const empty = input.empty ?? false;

  return {
    shell: getAdminShellViewModel({
      activeHref: "/overview",
      fullName: input.fullName,
    }),
    metrics: [
      { label: "Pending Testimonies", value: empty ? 0 : 100 },
      { label: "Pending Donations", value: empty ? 0 : 10 },
    ],
    rows: empty ? [] : filledRows,
    empty,
  };
}

type BackendTestimonyRow = {
  id: number;
  category: string;
  testimony_type: string;
  comment_count: number;
};

export async function getAdminOverviewViewModelFromApi(
  input: { empty?: boolean; fullName?: string },
  cookieHeader: string,
): Promise<AdminOverviewViewModel> {
  try {
    const [pendingTestimoniesResponse, pendingDonationsResponse] = await Promise.all([
      fetch(`${backendBaseUrl}/testimonies/admin/testimonies/?status=pending_review&page_size=1`, {
        headers: cookieHeader ? { cookie: cookieHeader } : {},
        cache: "no-store",
      }),
      fetch(`${backendBaseUrl}/donations/admin/donations/?status=pending&page_size=1`, {
        headers: cookieHeader ? { cookie: cookieHeader } : {},
        cache: "no-store",
      }),
    ]);

    if (!pendingTestimoniesResponse.ok || !pendingDonationsResponse.ok) {
      return getAdminOverviewViewModel({ ...input, empty: true });
    }

    const pendingTestimoniesPayload = (await pendingTestimoniesResponse.json().catch(() => ({}))) as {
      count?: number;
    };
    const pendingDonationsPayload = (await pendingDonationsResponse.json().catch(() => ({}))) as {
      count?: number;
    };

    const topEngagementResponse = await fetch(`${backendBaseUrl}/testimonies/admin/testimonies/?status=approved&page_size=50`, {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    const topRows: AdminOverviewTableRow[] = [];
    if (topEngagementResponse.ok) {
      const topPayload = (await topEngagementResponse.json().catch(() => ({}))) as {
        results?: BackendTestimonyRow[];
      };
      for (const [index, row] of (topPayload.results ?? []).slice(0, 5).entries()) {
        const comments = row.comment_count ?? 0;
        topRows.push({
          id: row.id ?? index + 1,
          category: row.category ?? "Uncategorized",
          type: row.testimony_type === "video" ? "Video" : "Text",
          likes: 0,
          shares: 0,
          comments,
          overall: comments,
        });
      }
    }

    const pendingTestimonies = pendingTestimoniesPayload.count ?? 0;
    const pendingDonations = pendingDonationsPayload.count ?? 0;
    const empty = pendingTestimonies === 0 && pendingDonations === 0 && topRows.length === 0;

    return {
      shell: getAdminShellViewModel({
        activeHref: "/overview",
        fullName: input.fullName,
      }),
      metrics: [
        { label: "Pending Testimonies", value: pendingTestimonies },
        { label: "Pending Donations", value: pendingDonations },
      ],
      rows: topRows,
      empty,
    };
  } catch {
    return getAdminOverviewViewModel({ ...input, empty: true });
  }
}
