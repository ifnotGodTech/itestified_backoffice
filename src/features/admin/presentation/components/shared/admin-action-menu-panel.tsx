"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const GAP = 8;
const EDGE = 8;

// Positioning classes callers pass for the old in-table placement; the panel
// now places itself, so they're dropped.
const PLACEMENT = /^(absolute|relative|fixed|(-)?(right|left|top|bottom|inset)-\S+|z-\S+)$/;

/**
 * A row's action menu. It's drawn over the page (a portal on <body>), lined
 * up with the row's menu button: below it, or above when there's no room
 * below. Drawn inside the table, it was clipped by the table's scrolling
 * container -- with one row only the last action showed.
 *
 * It anchors to the element it's placed in (the button's wrapper); inside a
 * <details>, it shows only while that is open.
 */
export function AdminActionMenuPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  const markerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // False while rendering on the server (no <body> to draw into yet).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [open, setOpen] = useState(true);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!mounted) return;
    const anchor = markerRef.current?.parentElement;
    if (!anchor) return;
    const details = anchor.closest("details");

    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const width = panelRef.current?.offsetWidth ?? 0;
      const height = panelRef.current?.offsetHeight ?? 0;
      const below = rect.bottom + GAP;
      const above = rect.top - GAP - height;
      const roomBelow = below + height <= window.innerHeight - EDGE;
      const top = roomBelow || above < EDGE ? below : above;
      const left = Math.max(EDGE, Math.min(rect.right - width, window.innerWidth - width - EDGE));
      setPosition({ top, left });
    };
    const sync = () => {
      if (details) setOpen(details.open);
      place();
    };

    sync();
    // Once more after the panel has been laid out and can be measured.
    const frame = requestAnimationFrame(place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    details?.addEventListener("toggle", sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      details?.removeEventListener("toggle", sync);
    };
  }, [mounted]);

  const extra = className
    .split(/\s+/)
    .filter((name) => name && !PLACEMENT.test(name))
    .join(" ");

  return (
    <>
      <span ref={markerRef} hidden />
      {mounted && open
        ? createPortal(
            <div
              ref={panelRef}
              style={{ top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? "visible" : "hidden" }}
              className={`fixed z-[60] min-w-[118px] overflow-hidden rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] text-left shadow-[0_14px_24px_rgba(0,0,0,0.35)] ${extra}`}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
