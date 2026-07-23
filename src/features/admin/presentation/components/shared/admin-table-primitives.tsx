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
    <div className={`min-w-[118px] overflow-hidden rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] text-left shadow-[0_14px_24px_rgba(0,0,0,0.35)] ${className}`}>
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

function AdminErrorIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-6 w-6 shrink-0" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" stroke="#ef4335" strokeWidth="1.5" />
      <path d="M10 6v4.5" stroke="#ef4335" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="13.5" r="0.9" fill="#ef4335" />
    </svg>
  );
}

/**
 * Shared "couldn't load this section" state. One visual language for every
 * table/page in the admin app instead of each one styling its own — see
 * UI_UX_REVIEW_TODO.md A5. Background/border are deliberately literal (not
 * theme tokens): this is the same fixed dark-red-with-white-text treatment
 * used for status badges, so it stays legible regardless of theme.
 */
export function AdminErrorState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="px-8 py-14">
      <div className="flex items-start gap-4 rounded-[18px] border border-[#ef4335]/30 bg-[#2a1615] px-6 py-6">
        <AdminErrorIcon />
        <div>
          <h3 className="text-[20px] font-semibold text-[#ffffff]">{title}</h3>
          <p className="mt-3 max-w-[520px] text-[15px] leading-7 text-[#ffffff]/70">
            {message ?? "An unexpected error occurred while loading this section."}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Shared Previous/Next footer. Renders a real disabled state instead of a static enabled-looking button. */
export function AdminPaginationFooter({
  showingLabel,
  hasPreviousPage,
  hasNextPage,
  previousHref,
  nextHref,
}: {
  showingLabel: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousHref: string;
  nextHref: string;
}) {
  const baseClass = "rounded-[8px] border px-4 py-2 text-[12px] font-medium transition-colors";
  const disabledClass = "cursor-not-allowed border-white/10 text-white/25";

  return (
    <div className="flex items-center justify-between px-4 py-5 text-[12px] text-white/70 md:px-5">
      <span>{showingLabel}</span>
      <div className="flex gap-3">
        {hasPreviousPage ? (
          <Link href={previousHref} className={`${baseClass} border-white/20 text-white/72 hover:border-white/40`}>
            Previous
          </Link>
        ) : (
          <span className={`${baseClass} ${disabledClass}`} aria-disabled="true">
            Previous
          </span>
        )}
        {hasNextPage ? (
          <Link href={nextHref} className={`${baseClass} border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10`}>
            Next
          </Link>
        ) : (
          <span className={`${baseClass} ${disabledClass}`} aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
