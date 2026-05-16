import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type {
  AdminManagementRow,
  AdminManagementState,
  AdminManagementTab,
  AdminManagementViewModel,
} from "@/features/admin/domain/entities/admin-management";

const adminRows: AdminManagementRow[] = [
  {
    id: 1,
    fullName: "Elvis Igiebor",
    email: "elvis@itestified.app",
    role: "Super Admin",
    status: "Active",
    lastActive: "8 Aug 2024, 10:30 AM",
    canAssignRole: false,
    canViewPermissions: true,
    canManageRole: true,
    canRenameRole: true,
    canDelete: true,
  },
  {
    id: 2,
    fullName: "Ore Ore",
    email: "oreore@itestified.app",
    role: "Content Admin",
    status: "Active",
    lastActive: "8 Aug 2024, 09:15 AM",
    canAssignRole: false,
    canViewPermissions: true,
    canManageRole: true,
    canRenameRole: true,
    canDelete: true,
  },
  {
    id: 3,
    fullName: "Ubani Kelechi",
    email: "kelechi@itestified.app",
    role: "No Role Assigned",
    status: "Active",
    lastActive: "Pending acceptance",
    canAssignRole: true,
    canViewPermissions: false,
    canManageRole: false,
    canRenameRole: false,
    canDelete: true,
  },
  {
    id: 4,
    fullName: "John Stone",
    email: "johnstone@itestified.app",
    role: "Moderator",
    status: "Deactivated",
    lastActive: "6 Aug 2024, 04:12 PM",
    canAssignRole: false,
    canViewPermissions: true,
    canManageRole: false,
    canRenameRole: false,
    canDelete: true,
  },
];

function normalizeState(state?: string): AdminManagementState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

function normalizeTab(tab?: string): AdminManagementTab {
  if (tab === "active" || tab === "deactivated") return tab;
  return "all";
}

function filterByTab(rows: AdminManagementRow[], tab: AdminManagementTab) {
  if (tab === "active") return rows.filter((row) => row.status === "Active");
  if (tab === "deactivated") return rows.filter((row) => row.status === "Deactivated");
  return rows;
}

function filterRows(rows: AdminManagementRow[], query: string) {
  if (!query) return rows;
  const needle = query.toLowerCase();
  return rows.filter((row) => `${row.fullName} ${row.email} ${row.role} ${row.status}`.toLowerCase().includes(needle));
}

export function getAdminManagementViewModel(input: {
  state?: string;
  tab?: string;
  q?: string;
  menu?: string;
  permission?: string;
  managePermissions?: string;
  invite?: string;
  createRole?: string;
  assignRole?: string;
  manageRole?: string;
  renameRole?: string;
  remove?: string;
  success?: string;
  successType?: string;
  fullName?: string;
}): AdminManagementViewModel {
  const phaseState = normalizeState(input.state);
  const activeTab = normalizeTab(input.tab);
  const searchQuery = input.q?.trim() ?? "";
  const rows = phaseState === "populated" ? filterRows(filterByTab(adminRows, activeTab), searchQuery) : [];
  const selectedId = Number(
    input.permission ?? input.managePermissions ?? input.assignRole ?? input.manageRole ?? input.renameRole ?? input.remove ?? "",
  );
  const selectedRow = Number.isFinite(selectedId) ? adminRows.find((row) => row.id === selectedId) ?? null : null;
  const successTitle = input.successType === "admin-assigned" ? "Admin User Assigned Successfully!" : "Role Created Successfully!";

  return {
    shell: getAdminShellViewModel({
      activeHref: "/admin",
      fullName: input.fullName,
    }),
    phaseState,
    rows,
    selectedRow,
    activeTab,
    sectionTitle: "All Admin Users",
    searchQuery,
    searchPlaceholder: "Search by name, email or role",
    showingLabel: rows.length === 0 ? "Showing 0 of 0" : `Showing 1-${rows.length} of ${rows.length}`,
    showMenuForId: input.menu ? Number(input.menu) : undefined,
    showPermissionDetailsModal: Boolean(input.permission),
    showManagePermissionsModal: Boolean(input.managePermissions),
    showInviteUserModal: input.invite === "1",
    showCreateRoleModal: input.createRole === "1",
    showAssignRoleModal: Boolean(input.assignRole),
    showManageRoleModal: Boolean(input.manageRole),
    showRenameRoleModal: Boolean(input.renameRole),
    showDeleteModal: Boolean(input.remove),
    showSuccessModal: input.success === "1",
    successTitle,
    errorMessage: phaseState === "error" ? "We could not load admin management right now. Please try again." : undefined,
  };
}
