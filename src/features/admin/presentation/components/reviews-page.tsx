"use client";

import { useEffect, useState } from "react";
import type { ReviewRow, ReviewsViewModel } from "@/features/admin/domain/entities/reviews";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { ReviewsOverlays } from "@/features/admin/presentation/components/reviews/reviews-overlays";
import { ReviewsTable } from "@/features/admin/presentation/components/reviews/reviews-table";

export function ReviewsPage({ viewModel }: { viewModel: ReviewsViewModel }) {
  const [menuRow, setMenuRow] = useState<ReviewRow | null>(null);
  const [detailRow, setDetailRow] = useState<ReviewRow | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    setMenuRow(null);
    setDetailRow(null);
    setShowFilterModal(false);
  }, [viewModel]);

  const interactiveViewModel: ReviewsViewModel = {
    ...viewModel,
    selectedRow: menuRow ?? detailRow ?? viewModel.selectedRow,
    showMenuForId: menuRow?.id ?? viewModel.showMenuForId,
    showDetailForId: detailRow?.id ?? viewModel.showDetailForId,
    showFilterModal: showFilterModal || viewModel.showFilterModal,
  };

  return (
    <AdminDashboardShell viewModel={interactiveViewModel.shell}>
      <ReviewsTable
        viewModel={interactiveViewModel}
        onOpenFilter={() => setShowFilterModal(true)}
        onOpenMenu={(row) => setMenuRow(row)}
        onCloseMenu={() => setMenuRow(null)}
        onView={(row) => {
          setMenuRow(null);
          setDetailRow(row);
        }}
      />
      <ReviewsOverlays
        viewModel={interactiveViewModel}
        showFilterModal={showFilterModal}
        onCloseFilter={() => setShowFilterModal(false)}
        onCloseDetails={detailRow ? () => setDetailRow(null) : undefined}
      />
    </AdminDashboardShell>
  );
}
