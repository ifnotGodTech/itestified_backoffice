import type { DonationsViewModel } from "@/features/admin/domain/entities/donations";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { DonationsOverlays } from "@/features/admin/presentation/components/donations/donations-overlays";
import { DonationsTable } from "@/features/admin/presentation/components/donations/donations-table";

export function DonationsPage({ viewModel }: { viewModel: DonationsViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <DonationsTable viewModel={viewModel} />
      <DonationsOverlays viewModel={viewModel} />
    </AdminDashboardShell>
  );
}
