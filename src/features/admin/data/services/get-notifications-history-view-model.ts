import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type {
  NotificationHistoryRow,
  NotificationsHistoryFilterDraft,
  NotificationsHistoryState,
  NotificationsHistoryViewModel,
  NotificationReadStatus,
} from "@/features/admin/domain/entities/notifications-history";

const notifications: NotificationHistoryRow[] = [
  {
    id: 1,
    title: "New Gift Received",
    message: "Gift of ₦5,000.00 received from Emmanuel Oreoluwa(emmanueloreoluwa@gmail.com) via Flutterwave.",
    date: "09/09/2024",
    time: "09:00PM",
    status: "read",
  },
  {
    id: 2,
    title: "New Text Testimony Submitted",
    message: "Michael Chen has submitted a new testimony: \"God's faithfulness in my business journey...\"",
    date: "09/09/2024",
    time: "09:00PM",
    status: "unread",
    href: "/testimonies?view=1&origin=notification",
  },
  {
    id: 3,
    title: "New Comment on Video Testimony",
    message: "Grace Adebayo commented on \"Healing testimony from cancer\" video: \"Prase...\"",
    date: "09/09/2024",
    time: "09:00PM",
    status: "read",
    href: "/testimonies?tab=video&view=1&origin=notification",
  },
  {
    id: 4,
    title: "User Profile Updated",
    message: "Blessing Okoro changed email from blessing.old@email.com to blessing.new@email.com",
    date: "09/09/2024",
    time: "09:00PM",
    status: "read",
  },
  {
    id: 5,
    title: "Account Deletion",
    message: "James Wilson (james.wilson@email.com) has deleted their account. Reason: \"No longer using the platform\"",
    date: "09/09/2024",
    time: "09:00PM",
    status: "read",
  },
];

function normalizeState(state?: string): NotificationsHistoryState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

function normalizeStatus(status?: string): NotificationReadStatus | undefined {
  if (status === "read" || status === "unread") return status;
  return undefined;
}

function parseSelected(selected?: string) {
  if (!selected) return [] as number[];
  return selected
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
}

function parseReadIds(read: string | undefined, selectedIds: number[]) {
  if (!read) return [] as number[];
  if (read === "all") return notifications.map((row) => row.id);
  if (read === "selected") return selectedIds;
  return parseSelected(read);
}

function applyFilter(rows: NotificationHistoryRow[], filterDraft: NotificationsHistoryFilterDraft, query: string) {
  return rows.filter((row) => {
    if (filterDraft.status && row.status !== filterDraft.status) return false;
    if (query && !`${row.title} ${row.message}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
}

export function getNotificationsHistoryViewModel(input: {
  state?: string;
  q?: string;
  panel?: string;
  filter?: string;
  statusFilter?: string;
  from?: string;
  to?: string;
  selected?: string;
  read?: string;
  delete?: string;
  deleteAll?: string;
  success?: string;
  fullName?: string;
}): NotificationsHistoryViewModel {
  const phaseState = normalizeState(input.state);
  const searchQuery = input.q?.trim() ?? "";
  const selectedIds = parseSelected(input.selected);
  const readIds = new Set(parseReadIds(input.read, selectedIds));
  const filterDraft: NotificationsHistoryFilterDraft = {
    status: normalizeStatus(input.statusFilter),
    from: input.from?.trim() || undefined,
    to: input.to?.trim() || undefined,
  };
  const normalizedRows = notifications.map((row) => (readIds.has(row.id) ? { ...row, status: "read" as const } : row));
  const filteredRows = applyFilter(normalizedRows, filterDraft, searchQuery);
  const rows = phaseState === "populated" ? filteredRows : [];
  const deleteId = Number(input.delete ?? "");
  const selectedRow = Number.isFinite(deleteId) ? normalizedRows.find((row) => row.id === deleteId) ?? null : null;
  const successMessage = input.success === "delete" ? "Notifications deleted successfully!" : input.success === "read" ? "Notifications marked as read." : undefined;

  return {
    shell: getAdminShellViewModel({
      activeHref: "/notifications-history",
      fullName: input.fullName,
    }),
    phaseState,
    searchQuery,
    rows,
    selectedIds,
    selectedRow,
    showingLabel: rows.length === 0 ? "Showing 0 of 0" : `Showing 1-${rows.length} of ${rows.length}`,
    errorMessage: phaseState === "error" ? "We could not load notifications right now. Please try again." : undefined,
    filterDraft,
    showPanel: input.panel === "1",
    showFilterModal: input.filter === "1",
    showDeleteModal: Boolean(input.deleteAll === "1" || selectedRow),
    deleteMode: input.deleteAll === "1" ? "bulk" : selectedRow ? "single" : undefined,
    showSuccess: Boolean(successMessage),
    successMessage,
  };
}
