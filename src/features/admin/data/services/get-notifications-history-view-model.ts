import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import { formatShowingLabel, paginateRows, parsePageParam } from "@/features/admin/data/services/pagination";
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
  page?: string;
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
  const allRows = phaseState === "populated" ? filteredRows : [];
  const page = parsePageParam(input.page);
  const { pageRows: rows, hasNextPage, hasPreviousPage } = paginateRows(allRows, page);
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
    showingLabel: formatShowingLabel(page, rows.length, allRows.length),
    page,
    hasNextPage,
    hasPreviousPage,
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

function toDateAndTime(value: string): { date: string; time: string } {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { date: value || "-", time: "-" };
  }
  const date = parsed.toLocaleDateString("en-GB");
  const time = parsed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return { date, time };
}

function mapRows(results: Array<Record<string, unknown>>): NotificationHistoryRow[] {
  return results.map((item) => {
    const dateTime = toDateAndTime(String(item.created_at ?? ""));
    return {
      id: Number(item.id ?? 0),
      title: String(item.title ?? "Notification"),
      message: String(item.message ?? ""),
      date: dateTime.date,
      time: dateTime.time,
      status: (item.is_read as boolean | undefined) === true ? "read" : "unread",
    };
  });
}

export async function getNotificationsHistoryViewModelFromApi(
  input: {
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
    page?: string;
  },
  cookieHeader: string,
): Promise<NotificationsHistoryViewModel> {
  const page = parsePageParam(input.page);
  try {
    const searchParams = new URLSearchParams();
    if (input.q?.trim()) searchParams.set("q", input.q.trim());
    if (input.statusFilter?.trim()) searchParams.set("status", input.statusFilter.trim());
    if (input.from?.trim()) searchParams.set("from", input.from.trim());
    if (input.to?.trim()) searchParams.set("to", input.to.trim());
    searchParams.set("page", String(page));
    const query = searchParams.toString();
    const url = `${backendBaseUrl}/notifications/admin/history/${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return { ...getNotificationsHistoryViewModel({ ...input, state: "error" }), page, hasNextPage: false, hasPreviousPage: page > 1 };
    }
    const payload = (await response.json().catch(() => ({}))) as {
      count?: number;
      results?: Array<Record<string, unknown>>;
      next?: string | null;
      previous?: string | null;
    };
    const mappedRows = mapRows(payload.results ?? []);
    const vm = getNotificationsHistoryViewModel(input);
    const total = payload.count ?? mappedRows.length;
    return {
      ...vm,
      phaseState: mappedRows.length == 0 ? "empty" : "populated",
      rows: mappedRows,
      showingLabel: formatShowingLabel(page, mappedRows.length, total),
      page,
      hasNextPage: Boolean(payload.next),
      hasPreviousPage: Boolean(payload.previous) || page > 1,
      selectedRow: (() => {
        const selectedId = Number(input.delete ?? "");
        return Number.isFinite(selectedId) ? mappedRows.find((row) => row.id === selectedId) ?? null : null;
      })(),
    };
  } catch {
    return { ...getNotificationsHistoryViewModel({ ...input, state: "error" }), page, hasNextPage: false, hasPreviousPage: page > 1 };
  }
}
