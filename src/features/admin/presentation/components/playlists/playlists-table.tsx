"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buildPlaylistsHref } from "@/features/admin/data/services/get-playlists-view-model";
import type { PlaylistRow, PlaylistVisibility, PlaylistsViewModel } from "@/features/admin/domain/entities/playlists";
import {
  AdminActionMenuPanel,
  AdminErrorState,
  AdminPaginationFooter,
  AdminRowMenuIcon,
  AdminSearchIcon,
  AdminStatusBadge,
} from "@/features/admin/presentation/components/shared/admin-table-primitives";

const visibilityTabs: Array<{ key: PlaylistVisibility | ""; label: string }> = [
  { key: "", label: "All" },
  { key: "shared", label: "Shared" },
  { key: "private", label: "Private" },
];

function VisibilityBadge({ visibility }: { visibility: PlaylistVisibility }) {
  if (visibility === "shared") {
    return <AdminStatusBadge label="Shared" toneClassName="border-[#9966cc]/40 bg-transparent text-[#9966cc]" />;
  }
  return <AdminStatusBadge label="Private" toneClassName="border-[#8d9aa8]/40 bg-transparent text-[#8d9aa8]" />;
}

function PlaylistTypeIcon() {
  return (
    <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[var(--color-primary)]/16">
      <svg viewBox="0 0 20 20" className="h-[16px] w-[16px]" fill="none" aria-hidden="true">
        <path
          d="M6 15.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8-1.2a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 13.5V5.8l6-1.3v7.8"
          stroke="var(--color-primary)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SearchBox({ viewModel }: { viewModel: PlaylistsViewModel }) {
  const router = useRouter();
  const [value, setValue] = useState(viewModel.searchQuery);

  useEffect(() => {
    setValue(viewModel.searchQuery);
  }, [viewModel.searchQuery]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === viewModel.searchQuery.trim()) return;
    const timeout = setTimeout(() => {
      router.push(buildPlaylistsHref({ q: trimmed, visibility: viewModel.visibilityFilter }));
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full sm:w-[340px]">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
        <AdminSearchIcon />
      </span>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search by playlist title or owner name…"
        className="h-[38px] w-full rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] pl-9 pr-4 text-[12.5px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
      />
    </div>
  );
}

function VisibilityFilterChips({ viewModel }: { viewModel: PlaylistsViewModel }) {
  return (
    <div className="flex gap-1 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-1">
      {visibilityTabs.map((tab) => {
        const active = tab.key === viewModel.visibilityFilter;
        return (
          <Link
            key={tab.label}
            href={buildPlaylistsHref({ q: viewModel.searchQuery, visibility: tab.key })}
            className={`rounded-[7px] px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              active
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function RowMenu({ row }: { row: PlaylistRow }) {
  return (
    <div className="relative inline-block text-left">
      <details className="group relative">
        <summary className="flex h-[30px] w-[30px] cursor-pointer list-none items-center justify-center rounded-[8px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] [&::-webkit-details-marker]:hidden">
          <AdminRowMenuIcon />
        </summary>
        <AdminActionMenuPanel className="absolute right-0 top-[36px] z-20">
          <Link
            href={buildPlaylistsHref({ view: row.id })}
            className="block px-4 py-2.5 text-[12.5px] text-[var(--color-text-primary)] hover:bg-white/5"
          >
            View contents
          </Link>
          <Link
            href={buildPlaylistsHref({ view: row.id, takedown: row.id })}
            className="block px-4 py-2.5 text-[12.5px] text-[#ef4335] hover:bg-white/5"
          >
            Take down
          </Link>
        </AdminActionMenuPanel>
      </details>
    </div>
  );
}

export function PlaylistsTable({ viewModel }: { viewModel: PlaylistsViewModel }) {
  return (
    <div className="rounded-[20px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-4 px-4 pt-5 md:px-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-semibold text-[var(--color-text-primary)]">Playlists</h1>
            <p className="mt-1 text-[12.5px] text-[var(--color-text-muted)]">Every Premium-user playlist on the platform</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-[12px] border border-[var(--color-border-subtle)] px-4 py-2 text-right">
              <span className="block text-[16px] font-bold tabular-nums text-[var(--color-text-primary)]">{viewModel.totalCount}</span>
              <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">Total</span>
            </div>
            <div className="rounded-[12px] border border-[var(--color-border-subtle)] px-4 py-2 text-right">
              <span className="block text-[16px] font-bold tabular-nums text-[var(--color-text-primary)]">{viewModel.sharedCount}</span>
              <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">Shared here</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox viewModel={viewModel} />
          <VisibilityFilterChips viewModel={viewModel} />
        </div>
      </div>

      <div className="border-t border-white/5">
        {viewModel.phaseState === "error" ? (
          <AdminErrorState title="Couldn't load playlists" message={viewModel.errorMessage} />
        ) : viewModel.phaseState === "empty" ? (
          <div className="px-8 py-16 text-center">
            <h3 className="text-[18px] font-medium text-white/90">No playlists match this view</h3>
            <p className="mt-2 text-[13px] text-white/55">Try a different search term or visibility filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-muted)] text-left text-[10.5px] uppercase tracking-wide text-white/70">
                  <th className="px-4 py-[10px] font-semibold">Playlist</th>
                  <th className="px-4 py-[10px] font-semibold">Owner</th>
                  <th className="px-4 py-[10px] font-semibold">Visibility</th>
                  <th className="px-4 py-[10px] font-semibold">Items</th>
                  <th className="px-4 py-[10px] font-semibold">Created</th>
                  <th className="px-4 py-[10px]" />
                </tr>
              </thead>
              <tbody>
                {viewModel.rows.map((row) => (
                  <tr key={row.id} className="border-t border-white/10 text-[13px] text-white/85">
                    <td className="px-4 py-[13px]">
                      <Link href={buildPlaylistsHref({ view: row.id })} className="flex items-center gap-3">
                        <PlaylistTypeIcon />
                        <span className="font-semibold text-white">{row.title}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-[13px]">
                      <div>
                        <div className="font-medium">{row.ownerName}</div>
                        <div className="text-[11px] text-white/50">{row.ownerEmail}</div>
                      </div>
                    </td>
                    <td className="px-4 py-[13px]">
                      <VisibilityBadge visibility={row.visibility} />
                    </td>
                    <td className="px-4 py-[13px] tabular-nums">{row.itemCount}</td>
                    <td className="px-4 py-[13px] tabular-nums text-white/60">{row.createdAt}</td>
                    <td className="px-4 py-[13px] text-right">
                      <RowMenu row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewModel.phaseState === "populated" ? (
        <AdminPaginationFooter
          showingLabel={viewModel.showingLabel}
          hasPreviousPage={viewModel.hasPreviousPage}
          hasNextPage={viewModel.hasNextPage}
          previousHref={buildPlaylistsHref({
            q: viewModel.searchQuery,
            visibility: viewModel.visibilityFilter,
            page: viewModel.page - 1,
          })}
          nextHref={buildPlaylistsHref({
            q: viewModel.searchQuery,
            visibility: viewModel.visibilityFilter,
            page: viewModel.page + 1,
          })}
        />
      ) : null}
    </div>
  );
}
