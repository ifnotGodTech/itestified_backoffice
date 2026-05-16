import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type UserManagementTab = "registered" | "deleted" | "deactivated";
export type UserManagementState = "populated" | "empty" | "loading" | "error";
export type UserStatus = "Registered" | "Deleted" | "Deactivated";

export type UserManagementRow = {
  id: number;
  userId: string;
  name: string;
  email: string;
  registrationDate: string;
  status: UserStatus;
  avatarSrc?: string;
  deletionDate?: string;
  deletionReason?: string;
  deactivatedOn?: string;
  deactivationReason?: string;
  deactivatedBy?: string;
};

export type UserManagementViewModel = {
  shell: AdminShellViewModel;
  activeTab: UserManagementTab;
  phaseState: UserManagementState;
  searchQuery: string;
  tabs: Array<{ key: UserManagementTab; label: string }>;
  rows: UserManagementRow[];
  selectedRow: UserManagementRow | null;
  totalRows: number;
  showingLabel: string;
  errorMessage?: string;
  showActionMenu: boolean;
  showDetails: boolean;
  showDeactivateConfirm: boolean;
  showReactivateConfirm: boolean;
  showSuccess: boolean;
  successMessage?: string;
};
