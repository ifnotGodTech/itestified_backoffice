import type { AdminManagementViewModel } from "@/features/admin/domain/entities/admin-management";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminManagementOverlays } from "@/features/admin/presentation/components/admin-management/admin-management-overlays";
import { AdminManagementTable } from "@/features/admin/presentation/components/admin-management/admin-management-table";

export function AdminManagementPage({ viewModel }: { viewModel: AdminManagementViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <AdminManagementTable viewModel={viewModel} />
      <AdminManagementOverlays viewModel={viewModel} />
    </AdminDashboardShell>
  );
}
