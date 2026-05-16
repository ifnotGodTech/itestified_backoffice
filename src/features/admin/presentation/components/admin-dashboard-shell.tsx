import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";
import { AdminSidebarNav } from "@/features/admin/presentation/components/admin-sidebar-nav";

function HeaderIcon({
  kind,
  active = false,
  badge = false,
  href,
  label,
}: {
  kind: "theme" | "moon" | "bell" | "panel";
  active?: boolean;
  badge?: boolean;
  href?: string;
  label?: string;
}) {
  const stroke = active ? "#FFFFFF" : "#BFBFBF";
  const content = (
    <>
      {badge ? <span className="absolute right-[9px] top-[8px] h-[6px] w-[6px] rounded-full bg-[#ef4335]" /> : null}
      {kind === "theme" ? (
        <svg viewBox="0 0 20 20" className="h-[17px] w-[17px]" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="3.1" stroke={stroke} strokeWidth="1.5" />
          <path d="M10 2.5v2.1M10 15.4v2.1M17.5 10h-2.1M4.6 10H2.5M15.3 4.7l-1.5 1.5M6.2 13.8l-1.5 1.5M15.3 15.3l-1.5-1.5M6.2 6.2 4.7 4.7" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ) : null}
      {kind === "moon" ? (
        <svg viewBox="0 0 20 20" className="h-[16px] w-[16px]" fill="none" aria-hidden="true">
          <path d="M12.8 3.4A6.5 6.5 0 1 0 16.6 13 5.7 5.7 0 0 1 12.8 3.4z" fill={stroke} />
        </svg>
      ) : null}
      {kind === "bell" ? (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <path
            d="M10 4.1c1.94 0 3.5 1.56 3.5 3.5v2.02c0 .78.27 1.54.75 2.16l.84 1.02H4.91l.84-1.02c.48-.62.75-1.38.75-2.16V7.6c0-1.94 1.56-3.5 3.5-3.5Z"
            stroke={stroke}
            strokeWidth="1.55"
            strokeLinejoin="round"
          />
          <path d="M8.35 14.6a1.9 1.9 0 0 0 3.3 0" stroke={stroke} strokeWidth="1.55" strokeLinecap="round" />
        </svg>
      ) : null}
      {kind === "panel" ? (
        <svg viewBox="0 0 20 20" className="h-[16px] w-[16px]" fill="none" aria-hidden="true">
          <rect x="4.2" y="4.2" width="11.6" height="11.6" rx="1.6" stroke={stroke} strokeWidth="1.5" />
          <path d="M8 10h4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ) : null}
    </>
  );

  const className = `relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
        active ? "border-[#b98aeb] bg-[#9B68D5]" : "border-white/10 bg-[#252525]"
      }`;

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
}

export function AdminDashboardShell({
  viewModel,
  pageTitle,
  children,
}: {
  viewModel: AdminShellViewModel;
  pageTitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="grid min-h-screen grid-cols-[235px_1fr]">
        <aside className="border-r border-white/5 bg-[#181818]">
          <div className="flex items-center gap-3 px-3 pb-4 pt-3">
            <Image src="/admin-logo.svg" alt="iTestified" width={145} height={49} className="h-[49px] w-[145px]" priority />
          </div>
          <AdminSidebarNav sidebarItems={viewModel.sidebarItems} settingsItems={viewModel.settingsItems} />
        </aside>

        <main>
          <header className="flex items-center justify-between border-b border-white/5 bg-[#1c1c1c] px-4 py-[13px]">
            <div>
              <p className="text-[17px] font-semibold leading-none text-[#f2f2f2]">Hello Admin</p>
              <p className="mt-1 text-[12px] text-[#7f7f7f]">How are you doing today?</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-[7px]">
                <HeaderIcon kind="theme" />
                <HeaderIcon kind="moon" active />
                <HeaderIcon kind="bell" badge href="/notifications-history?panel=1" label="Open notifications" />
                <HeaderIcon kind="panel" />
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[14px] font-semibold leading-none text-[#f5f5f5]">{viewModel.fullName}</p>
                  <p className="mt-1 text-[12px] text-[#b0b0b0]">Admin</p>
                </div>
              </div>
            </div>
          </header>

          <section className="px-4 py-5">
            {pageTitle ? <h1 className="mb-5 text-[28px] font-semibold leading-[1.2] text-[#f2f2f2]">{pageTitle}</h1> : null}
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
