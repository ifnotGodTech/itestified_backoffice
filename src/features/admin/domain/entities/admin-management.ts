import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type AdminManagementState = "populated" | "empty" | "loading" | "error";

export type AdminManagementStatus = "Active" | "Invited" | "Deactivated";
export type AdminManagementTab = "all" | "active" | "deactivated";

export type AdminManagementRow = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: AdminManagementStatus;
  lastActive: string;
  canAssignRole: boolean;
  canViewPermissions: boolean;
  canManageRole: boolean;
  canRenameRole: boolean;
  canDelete: boolean;
};

export type AdminManagementViewModel = {
  shell: AdminShellViewModel;
  phaseState: AdminManagementState;
  rows: AdminManagementRow[];
  selectedRow: AdminManagementRow | null;
  activeTab: AdminManagementTab;
  sectionTitle: string;
  searchQuery: string;
  searchPlaceholder: string;
  showingLabel: string;
  showMenuForId?: number;
  showPermissionDetailsModal: boolean;
  showManagePermissionsModal: boolean;
  showInviteUserModal: boolean;
  showCreateRoleModal: boolean;
  showAssignRoleModal: boolean;
  showManageRoleModal: boolean;
  showRenameRoleModal: boolean;
  showDeleteModal: boolean;
  showSuccessModal: boolean;
  successTitle: string;
  errorMessage?: string;
};
