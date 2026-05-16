export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse bg-[var(--color-surface-base)] p-6 text-[var(--color-text-secondary)]">
      <div className="mx-auto max-w-7xl space-y-3">
        <div className="h-6 w-40 rounded bg-[var(--color-surface-panel)]" />
        <div className="h-24 rounded bg-[var(--color-surface-panel)]" />
        <div className="h-40 rounded bg-[var(--color-surface-panel)]" />
      </div>
    </div>
  );
}
