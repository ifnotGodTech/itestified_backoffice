"use client";

import { useEffect, useState } from "react";

function readCachedUnreadCount() {
  if (typeof window === "undefined") return 0;
  try {
    const cachedCount = Number(window.sessionStorage.getItem("adminUnreadTestimonyCount") ?? "0");
    return Number.isFinite(cachedCount) && cachedCount > 0 ? cachedCount : 0;
  } catch {
    return 0;
  }
}

function readCachedUnreadCountAgeMs() {
  try {
    return Date.now() - Number(window.sessionStorage.getItem("adminUnreadTestimonyCountAt") ?? "0");
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function writeCachedUnreadCount(count: number) {
  try {
    window.sessionStorage.setItem("adminUnreadTestimonyCount", String(count));
    window.sessionStorage.setItem("adminUnreadTestimonyCountAt", String(Date.now()));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

export function useUnreadTestimonyCount() {
  const [count, setCount] = useState(readCachedUnreadCount);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const cacheAgeMs = readCachedUnreadCountAgeMs();
      if (cacheAgeMs >= 0 && cacheAgeMs < 15000) return;

      const response = await fetch("/api/admin/notifications/unread-testimony-count", {
        method: "GET",
        cache: "no-store",
      }).catch(() => null);
      if (!response || !response.ok || cancelled) return;
      const payload = (await response.json().catch(() => ({}))) as { count?: number };
      const nextCount = typeof payload.count === "number" ? payload.count : 0;
      writeCachedUnreadCount(nextCount);
      setCount(nextCount);
    }
    poll();
    const id = setInterval(poll, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return count;
}
