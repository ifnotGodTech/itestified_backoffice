import Image from "next/image";
import type { ReactNode } from "react";
import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";
import { AdminMobileNav } from "@/features/admin/presentation/components/admin-mobile-nav";
import { AdminSidebarNav } from "@/features/admin/presentation/components/admin-sidebar-nav";
import { AdminThemeToggle } from "@/features/admin/presentation/components/admin-theme-toggle";
import { HeaderNotificationBell } from "@/features/admin/presentation/components/header-notification-bell";

export function AdminDashboardShell({
  viewModel,
  pageTitle,
  children,
  chrome = false,
}: {
  viewModel?: AdminShellViewModel;
  pageTitle?: string;
  children: ReactNode;
  chrome?: boolean;
}) {
  if (!chrome) {
    return (
      <>
        {pageTitle ? <h1 className="mb-5 text-[28px] font-semibold leading-[1.2] text-[var(--color-text-primary)]">{pageTitle}</h1> : null}
        {children}
      </>
    );
  }

  if (!viewModel) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-strong)] text-[var(--color-text-primary)]">
      <div className="grid min-h-screen md:grid-cols-[235px_1fr]">
        <aside className="hidden border-r border-[var(--color-border-subtle)]/30 bg-[var(--color-surface-elevated)] md:block">
          <div className="flex items-center gap-3 px-3 pb-4 pt-3">
            <Image src="/admin-logo.svg" alt="iTestified" width={145} height={49} className="h-[49px] w-[145px]" priority />
          </div>
          <AdminSidebarNav sidebarItems={viewModel.sidebarItems} settingsItems={viewModel.settingsItems} />
        </aside>

        <main className="min-w-0">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)]/30 bg-[var(--color-surface-elevated)] px-3 py-[13px] md:px-4">
            <div className="flex min-w-0 items-center gap-3">
              <AdminMobileNav sidebarItems={viewModel.sidebarItems} settingsItems={viewModel.settingsItems} />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold leading-none text-[var(--color-text-primary)] md:text-[17px]">Hello Admin</p>
                <p className="mt-1 hidden truncate text-[12px] text-[var(--color-text-muted)] sm:block">How are you doing today?</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 md:gap-4">
              <div className="hidden items-center gap-[7px] sm:flex">
                <AdminThemeToggle />
                <HeaderNotificationBell />
              </div>
              <div className="sm:hidden">
                <HeaderNotificationBell />
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <div className="text-right">
                  <p className="text-[14px] font-semibold leading-none text-[var(--color-text-primary)]">{viewModel.fullName}</p>
                  <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">Admin</p>
                </div>
              </div>
            </div>
          </header>

          <section className="px-3 py-5 md:px-4">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
