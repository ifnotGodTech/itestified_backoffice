import Link from "next/link";
import type { ReactNode } from "react";

export function AdminSearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[14px] w-[14px]" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="4.75" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12.7 12.7 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function AdminRowMenuIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="4.5" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="10" cy="15.5" r="1.5" />
    </svg>
  );
}

export function AdminActionMenuPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-[118px] overflow-hidden rounded-[12px] border border-[#5b5b5b] bg-[#242424] text-left shadow-[0_14px_24px_rgba(0,0,0,0.35)] ${className}`}>
      {children}
    </div>
  );
}

export function AdminActionMenuBackdrop({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="fixed inset-0 z-40" aria-label={label} />;
}

export function AdminStatusBadge({
  label,
  toneClassName,
}: {
  label: string;
  toneClassName: string;
}) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] leading-[1.36] ${toneClassName}`}>{label}</span>;
}
