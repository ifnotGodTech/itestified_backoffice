"use client";

import { useEffect, useState } from "react";
import type { LiveBroadcastsViewModel } from "@/features/admin/domain/entities/live-broadcasts";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { LiveBroadcastsTable } from "@/features/admin/presentation/components/live-broadcasts/live-broadcasts-table";

// Panel is meant to stay open and be glanced at, not refreshed by the
// admin's own action -- 20s lands inside the plan's own "every 15-30s"
// polling cadence.
const POLL_INTERVAL_MS = 20000;

export function LiveBroadcastsPage({ viewModel }: { viewModel: LiveBroadcastsViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setCurrentViewModel(viewModel);
  }, [viewModel]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      setIsRefreshing(true);
      try {
        const response = await fetch("/api/admin/live-broadcasts/monitor", { cache: "no-store" });
        if (!response.ok) throw new Error("poll failed");
        const next = (await response.json()) as LiveBroadcastsViewModel;
        if (!cancelled) setCurrentViewModel(next);
      } catch {
        // A transient poll failure keeps showing the last good snapshot
        // rather than flashing an error state on every hiccup.
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <AdminDashboardShell viewModel={currentViewModel.shell}>
      <LiveBroadcastsTable viewModel={currentViewModel} isRefreshing={isRefreshing} />
    </AdminDashboardShell>
  );
}
