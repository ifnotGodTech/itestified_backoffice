const mainItems = [
  "Overview",
  "Home page Management",
  "Scripture of the day",
  "Users",
  "Testimonies",
  "Inspirational Pictures",
  "Donations",
  "Notifications history",
  "Reviews",
  "Analytics",
];

const settingsItems = ["My profile", "Notification settings", "Admin Management"];

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[8px] bg-white/[0.08] ${className}`} />;
}

export function AdminRouteLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-strong)] text-white" role="status" aria-label="Dashboard content loading">
      <span className="sr-only">Dashboard content loading</span>
      <div className="grid min-h-screen grid-cols-[235px_1fr]">
        <aside className="border-r border-white/5 bg-[var(--color-surface-elevated)]">
          <div className="px-3 pb-4 pt-3">
            <div className="flex h-[49px] w-[145px] items-center rounded-[10px] bg-white/[0.06] px-3">
              <span className="text-[18px] font-semibold text-white/85">iTestified</span>
            </div>
          </div>

          <div className="px-3 text-[11px] font-semibold uppercase text-[var(--color-text-secondary)]">Main Menu</div>
          <nav className="mt-3 space-y-1">
            {mainItems.map((item) => (
              <div key={item} className="flex h-[44px] items-center gap-3 px-4 text-[14px] text-[var(--color-text-secondary)]">
                <SkeletonBlock className="h-[18px] w-[18px] rounded-[5px]" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </nav>

          <div className="mt-10 px-3 text-[11px] font-semibold uppercase text-[var(--color-text-secondary)]">Settings</div>
          <div className="mt-3 space-y-1">
            {settingsItems.map((item) => (
              <div key={item} className="flex h-[44px] items-center gap-3 px-4 text-[14px] text-[var(--color-text-secondary)]">
                <SkeletonBlock className="h-[18px] w-[18px] rounded-[5px]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </aside>

        <main>
          <header className="flex items-center justify-between border-b border-white/5 bg-[var(--color-surface-elevated)] px-4 py-[13px]">
            <div>
              <p className="text-[17px] font-semibold leading-none text-[var(--color-text-primary)]">Hello Admin</p>
              <SkeletonBlock className="mt-2 h-3 w-36" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-[7px]">
                {[1, 2, 3, 4].map((item) => (
                  <SkeletonBlock key={item} className="h-10 w-10 rounded-full" />
                ))}
              </div>
              <div className="text-right">
                <SkeletonBlock className="ml-auto h-4 w-28" />
                <SkeletonBlock className="ml-auto mt-2 h-3 w-12" />
              </div>
            </div>
          </header>

          <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-5">
            <div
              className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/15 border-t-white/70"
              aria-hidden="true"
            />
          </section>
        </main>
      </div>
    </div>
  );
}
