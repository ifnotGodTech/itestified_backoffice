import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type {
  UserManagementRow,
  UserManagementState,
  UserManagementTab,
  UserManagementViewModel,
} from "@/features/admin/domain/entities/users";

const tabs: Array<{ key: UserManagementTab; label: string }> = [
  { key: "registered", label: "Registered" },
  { key: "deleted", label: "Deleted accounts" },
  { key: "deactivated", label: "Deactivated accounts" },
];

const registeredRows: UserManagementRow[] = [
  { id: 1, userId: "U12345", name: "Emmanuel Oreoluwa", email: "Emmanuel123@gmail.com", registrationDate: "8th Aug 2024", status: "Registered", avatarSrc: "/admin-logo.svg" },
  { id: 2, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "8th Aug 2024", status: "Registered", avatarSrc: "/admin-logo.svg" },
  { id: 3, userId: "U12345", name: "Kelechi Ubani", email: "Emmanuel123@gmail.com", registrationDate: "8th Aug 2024", status: "Registered", avatarSrc: "/admin-logo.svg" },
  { id: 4, userId: "U12345", name: "Alexander williams", email: "Emmanuel123@gmail.com", registrationDate: "8th Aug 2024", status: "Registered", avatarSrc: "/admin-logo.svg" },
  { id: 5, userId: "U12345", name: "Oluwole Oyewole", email: "Emmanuel123@gmail.com", registrationDate: "8th Aug 2024", status: "Registered", avatarSrc: "/admin-logo.svg" },
  { id: 6, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "8th Aug 2024", status: "Registered", avatarSrc: "/admin-logo.svg" },
  { id: 7, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "8th Aug 2024", status: "Registered", avatarSrc: "/admin-logo.svg" },
  { id: 8, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "8th Aug 2024", status: "Registered", avatarSrc: "/admin-logo.svg" },
  { id: 9, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "8th Aug 2024", status: "Registered", avatarSrc: "/admin-logo.svg" },
];

const deletedRows: UserManagementRow[] = [
  { id: 1, userId: "John@gmail.com", name: "John Paul", email: "John@gmail.com", registrationDate: "8th Aug 2024", status: "Deleted", deletionDate: "22/08/2024", deletionReason: "-", avatarSrc: "/admin-logo.svg" },
  { id: 2, userId: "Felix@gmail.com", name: "Felix Stone", email: "Felix@gmail.com", registrationDate: "8th Aug 2024", status: "Deleted", deletionDate: "22/08/2024", deletionReason: "I felt like", avatarSrc: "/admin-logo.svg" },
];

const deactivatedRows: UserManagementRow[] = [
  {
    id: 1,
    userId: "U12345",
    name: "John Stone",
    email: "JohnStone125@gmail.com",
    registrationDate: "22/08/2024",
    status: "Deactivated",
    deactivatedOn: "22/04/2025",
    deactivationReason: "Multiple policy violations including spam content and inappropriate behavior. User failed to respond to warnings within the required timeframe.",
    deactivatedBy: "Ore Adu (Admin)",
    avatarSrc: "/admin-logo.svg",
  },
  { id: 2, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "22/08/2024", status: "Deactivated", deactivatedOn: "22/04/2025", avatarSrc: "/admin-logo.svg" },
  { id: 3, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "22/08/2024", status: "Deactivated", deactivatedOn: "22/04/2025", avatarSrc: "/admin-logo.svg" },
  { id: 4, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "22/08/2024", status: "Deactivated", deactivatedOn: "22/04/2025", avatarSrc: "/admin-logo.svg" },
  { id: 5, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "22/08/2024", status: "Deactivated", deactivatedOn: "22/04/2025", avatarSrc: "/admin-logo.svg" },
  { id: 6, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "22/08/2024", status: "Deactivated", deactivatedOn: "22/04/2025", avatarSrc: "/admin-logo.svg" },
  { id: 7, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "22/08/2024", status: "Deactivated", deactivatedOn: "22/04/2025", avatarSrc: "/admin-logo.svg" },
  { id: 8, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "22/08/2024", status: "Deactivated", deactivatedOn: "22/04/2025", avatarSrc: "/admin-logo.svg" },
  { id: 9, userId: "U12345", name: "John Stone", email: "Emmanuel123@gmail.com", registrationDate: "22/08/2024", status: "Deactivated", deactivatedOn: "22/04/2025", avatarSrc: "/admin-logo.svg" },
];

function normalizeTab(tab?: string): UserManagementTab {
  if (tab === "deleted" || tab === "deactivated") return tab;
  return "registered";
}

function normalizeState(state?: string): UserManagementState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

function rowsForTab(tab: UserManagementTab) {
  if (tab === "deleted") return deletedRows;
  if (tab === "deactivated") return deactivatedRows;
  return registeredRows;
}

export function getUsersViewModel(input: {
  tab?: string;
  state?: string;
  q?: string;
  menu?: string;
  view?: string;
  deactivate?: string;
  reactivate?: string;
  success?: string;
  fullName?: string;
}): UserManagementViewModel {
  const activeTab = normalizeTab(input.tab);
  const phaseState = normalizeState(input.state);
  const searchQuery = input.q?.trim() ?? "";
  const baseRows = rowsForTab(activeTab);
  const searchedRows = searchQuery
    ? baseRows.filter((row) =>
        `${row.userId} ${row.name} ${row.email}`.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : baseRows;
  const rows = phaseState === "populated" ? searchedRows : [];
  const selectedId = Number(input.menu ?? input.view ?? input.deactivate ?? input.reactivate ?? "");
  const selectedRow = Number.isFinite(selectedId) ? baseRows.find((row) => row.id === selectedId) ?? null : null;
  const successMessage =
    input.success === "deactivate"
      ? "Account Deactivated Successfully!"
      : input.success === "reactivate"
        ? "Account Reactivated Successfully!"
        : undefined;

  return {
    shell: getAdminShellViewModel({
      activeHref: "/users",
      fullName: input.fullName,
    }),
    activeTab,
    phaseState,
    searchQuery,
    tabs,
    rows,
    selectedRow,
    totalRows: rows.length,
    showingLabel: rows.length === 0 ? "Showing 0 of 0" : `Showing 1-${rows.length} of ${rows.length}`,
    errorMessage: phaseState === "error" ? "We could not load user records right now. Please try again." : undefined,
    showActionMenu: Boolean(input.menu),
    showDetails: Boolean(input.view),
    showDeactivateConfirm: Boolean(input.deactivate),
    showReactivateConfirm: Boolean(input.reactivate),
    showSuccess: Boolean(successMessage),
    successMessage,
  };
}

type BackendUser = {
  id: number;
  email: string;
  full_name: string;
  account_status: "active" | "deactivated" | "deleted";
  created_at: string;
};

function mapBackendStatus(status: BackendUser["account_status"]) {
  if (status === "deactivated") return "Deactivated" as const;
  if (status === "deleted") return "Deleted" as const;
  return "Registered" as const;
}

function mapRow(user: BackendUser): UserManagementRow {
  return {
    id: user.id,
    userId: `U${String(user.id).padStart(5, "0")}`,
    name: user.full_name || user.email,
    email: user.email,
    registrationDate: new Date(user.created_at).toLocaleDateString("en-GB"),
    status: mapBackendStatus(user.account_status),
    avatarSrc: "/admin-logo.svg",
  };
}

export async function getUsersViewModelFromApi(
  input: {
    tab?: string;
    state?: string;
    q?: string;
    menu?: string;
    view?: string;
    deactivate?: string;
    reactivate?: string;
    success?: string;
    fullName?: string;
  },
  cookieHeader: string,
): Promise<UserManagementViewModel> {
  try {
    const statusMap: Record<UserManagementTab, string | null> = {
      registered: "active",
      deactivated: "deactivated",
      deleted: "deleted",
    };
    const activeTab = normalizeTab(input.tab);
    const params = new URLSearchParams();
    const status = statusMap[activeTab];
    if (status) params.set("status", status);
    if (input.q?.trim()) params.set("q", input.q.trim());
    const query = params.toString();
    const url = `${backendBaseUrl}/users/admin/users/${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return getUsersViewModel({ ...input, state: "error" });
    }
    const payload = (await response.json().catch(() => ({}))) as {
      count?: number;
      results?: BackendUser[];
    };
    const rows = (payload.results ?? []).map(mapRow);
    const vm = getUsersViewModel(input);
    const selectedId = Number(input.menu ?? input.view ?? input.deactivate ?? input.reactivate ?? "");
    return {
      ...vm,
      phaseState: rows.length === 0 ? "empty" : "populated",
      rows,
      totalRows: payload.count ?? rows.length,
      selectedRow: Number.isFinite(selectedId) ? rows.find((row) => row.id === selectedId) ?? null : null,
      showingLabel:
        rows.length === 0
          ? "Showing 0 of 0"
          : `Showing 1-${rows.length} of ${payload.count ?? rows.length}`,
    };
  } catch {
    return getUsersViewModel({ ...input, state: "error" });
  }
}
