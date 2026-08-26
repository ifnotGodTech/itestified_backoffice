import Link from "next/link";
import { buildPlaylistsHref } from "@/features/admin/data/services/get-playlists-view-model";
import type { PlaylistItemRow, PlaylistsViewModel } from "@/features/admin/domain/entities/playlists";
import {
  AdminErrorState,
  AdminStatusBadge,
} from "@/features/admin/presentation/components/shared/admin-table-primitives";

function typeIcon(type: PlaylistItemRow["testimonyType"]) {
  if (type === "video") return "▶";
  if (type === "audio") return "♪";
  return "≡";
}

function typeLabel(type: PlaylistItemRow["testimonyType"]) {
  if (type === "video") return "Video";
  if (type === "audio") return "Audio";
  return "Written";
}

function ItemRow({ item }: { item: PlaylistItemRow }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-[11px] last:border-b-0">
      <span className="w-5 text-center text-[11.5px] tabular-nums text-white/50">{item.position + 1}</span>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[var(--color-surface-muted)] text-[13px] text-white/70">
        {typeIcon(item.testimonyType)}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-[12.5px] font-semibold ${item.isAvailable ? "text-white" : "text-white/45 line-through"}`}>
          {item.title}
        </div>
        <div className="text-[10.5px] uppercase tracking-wide text-white/40">{typeLabel(item.testimonyType)}</div>
      </div>
      {item.isAvailable ? (
        <AdminStatusBadge label="Approved" toneClassName="border-[#0cbc32]/40 bg-transparent text-[#0cbc32]" />
      ) : (
        <AdminStatusBadge label="No longer available" toneClassName="border-[#ef4335]/40 bg-transparent text-[#ef4335]" />
      )}
    </div>
  );
}

export function PlaylistDetailPanel({ viewModel }: { viewModel: PlaylistsViewModel }) {
  const backHref = buildPlaylistsHref({ q: viewModel.searchQuery, visibility: viewModel.visibilityFilter, page: viewModel.page });

  if (!viewModel.detail) {
    return (
      <div>
        <Link href={backHref} className="mb-4 inline-block text-[12.5px] text-[var(--color-primary)]">
          ← Back to all playlists
        </Link>
        <AdminErrorState title="Playlist not found" message={viewModel.detailError} />
      </div>
    );
  }

  const playlist = viewModel.detail;

  return (
    <div>
      <Link href={backHref} className="mb-4 inline-block text-[12.5px] text-[var(--color-primary)]">
        ← Back to all playlists
      </Link>
      <h1 className="mb-5 text-[22px] font-semibold text-white">{playlist.title}</h1>
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="rounded-[16px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-[18px]">
          <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[13px] font-bold text-white/80">
              {playlist.ownerName.slice(0, 1).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-bold text-white">{playlist.ownerName}</div>
              <div className="truncate text-[11px] text-white/50">{playlist.ownerEmail}</div>
            </div>
          </div>

          <dl className="space-y-0">
            <div className="flex items-center justify-between border-b border-white/10 py-[9px] text-[12.5px]">
              <dt className="text-white/50">Visibility</dt>
              <dd>
                {playlist.visibility === "shared" ? (
                  <AdminStatusBadge label="Shared" toneClassName="border-[#9966cc]/40 bg-transparent text-[#9966cc]" />
                ) : (
                  <AdminStatusBadge label="Private" toneClassName="border-[#8d9aa8]/40 bg-transparent text-[#8d9aa8]" />
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 py-[9px] text-[12.5px]">
              <dt className="text-white/50">Show owner name</dt>
              <dd className="font-semibold text-white">{playlist.showOwnerName ? "Yes" : "No"}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 py-[9px] text-[12.5px]">
              <dt className="text-white/50">Items</dt>
              <dd className="font-semibold tabular-nums text-white">{playlist.itemCount}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 py-[9px] text-[12.5px]">
              <dt className="text-white/50">Created</dt>
              <dd className="tabular-nums text-white/80">{playlist.createdAt}</dd>
            </div>
            <div className="flex items-center justify-between py-[9px] text-[12.5px]">
              <dt className="text-white/50">Last edited</dt>
              <dd className="tabular-nums text-white/80">{playlist.updatedAt}</dd>
            </div>
          </dl>

          <Link
            href={buildPlaylistsHref({ view: playlist.id, takedown: playlist.id })}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#ef4335] px-4 py-[10px] text-[12.5px] font-bold text-[#ef4335]"
          >
            Take Down Playlist
          </Link>
        </div>

        <div className="rounded-[16px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-[13px]">
            <h2 className="text-[13.5px] font-bold text-white">Ordered contents</h2>
            <span className="text-[11.5px] text-white/50">{playlist.itemCount} testimonies</span>
          </div>
          {playlist.items.length === 0 ? (
            <div className="px-6 py-14 text-center text-[13px] text-white/50">This playlist has no items.</div>
          ) : (
            <div>
              {playlist.items.map((item) => (
                <ItemRow key={item.testimonyId} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
