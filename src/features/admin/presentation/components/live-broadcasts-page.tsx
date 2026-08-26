"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const cancelledRef = useRef(false);

  useEffect(() => {
    setCurrentViewModel(viewModel);
  }, [viewModel]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/admin/live-broadcasts/monitor", { cache: "no-store" });
      if (!response.ok) throw new Error("poll failed");
      const next = (await response.json()) as LiveBroadcastsViewModel;
      if (!cancelledRef.current) setCurrentViewModel(next);
    } catch {
      // A transient poll failure keeps showing the last good snapshot
      // rather than flashing an error state on every hiccup.
    } finally {
      if (!cancelledRef.current) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      cancelledRef.current = true;
      clearInterval(interval);
    };
  }, [refresh]);

  return (
    <AdminDashboardShell viewModel={currentViewModel.shell}>
      <LiveBroadcastsTable viewModel={currentViewModel} isRefreshing={isRefreshing} onBroadcastEnded={refresh} />
    </AdminDashboardShell>
  );
}
