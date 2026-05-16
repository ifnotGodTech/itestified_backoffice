import type { ReviewsViewModel } from "@/features/admin/domain/entities/reviews";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { ReviewsOverlays } from "@/features/admin/presentation/components/reviews/reviews-overlays";
import { ReviewsTable } from "@/features/admin/presentation/components/reviews/reviews-table";

export function ReviewsPage({ viewModel }: { viewModel: ReviewsViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <ReviewsTable viewModel={viewModel} />
      <ReviewsOverlays viewModel={viewModel} />
    </AdminDashboardShell>
  );
}
