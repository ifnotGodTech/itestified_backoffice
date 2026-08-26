"use client";

import type { PlaylistsViewModel } from "@/features/admin/domain/entities/playlists";
import { PlaylistDetailPanel } from "@/features/admin/presentation/components/playlists/playlist-detail-panel";
import { PlaylistTakedownModal } from "@/features/admin/presentation/components/playlists/playlist-takedown-modal";
import { PlaylistsTable } from "@/features/admin/presentation/components/playlists/playlists-table";

export function PlaylistsPage({ viewModel }: { viewModel: PlaylistsViewModel }) {
  const isViewingDetail = Boolean(viewModel.detail || viewModel.detailError);

  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      {isViewingDetail ? <PlaylistDetailPanel viewModel={viewModel} /> : <PlaylistsTable viewModel={viewModel} />}
      {viewModel.showTakedownModal && viewModel.detail ? <PlaylistTakedownModal playlist={viewModel.detail} /> : null}
    </div>
  );
}
