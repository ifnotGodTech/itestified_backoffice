"use client";

import { useEffect, useRef, useState } from "react";

type TestimonyNotification = {
  id: number;
  title: string;
  message: string;
  created_at: string;
};

const STORAGE_KEY = "admin:last_seen_testimony_notification_id";

export function NewTestimonyToast() {
  const [item, setItem] = useState<TestimonyNotification | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const response = await fetch("/api/admin/notifications/latest-testimony", {
        method: "GET",
        cache: "no-store",
      }).catch(() => null);
      if (!response || !response.ok || cancelled) return;
      const payload = (await response.json().catch(() => ({}))) as {
        item?: TestimonyNotification | null;
      };
      const next = payload.item ?? null;
      if (!next) return;

      const seenRaw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      const seenId = seenRaw ? Number(seenRaw) : 0;
      if (seenId >= next.id) return;

      setItem(next);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setItem(null);
      }, 6000);
    }

    poll();
    const id = setInterval(poll, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!item) return null;

  return (
    <div className="fixed right-6 top-6 z-[80] w-full max-w-[380px] rounded-[14px] border border-[#9B68D5]/40 bg-[#221a2c] px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
      <p className="text-[13px] font-semibold text-[#cda4ff]">{item.title}</p>
      <p className="mt-1 text-[13px] leading-5 text-white/85">{item.message}</p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, String(item.id));
            setItem(null);
          }}
          className="text-[12px] text-[#cda4ff]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
