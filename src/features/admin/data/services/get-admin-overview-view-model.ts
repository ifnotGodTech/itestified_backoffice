import type {
  AdminOverviewTableRow,
  AdminOverviewViewModel,
} from "@/features/admin/domain/entities/overview";
import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";

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
