export function AdminRouteLoading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center bg-[var(--color-surface-strong)]"
      role="status"
      aria-label="Dashboard content loading"
    >
      <span className="sr-only">Dashboard content loading</span>
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/15 border-t-white/70"
        aria-hidden="true"
      />
    </div>
  );
}
