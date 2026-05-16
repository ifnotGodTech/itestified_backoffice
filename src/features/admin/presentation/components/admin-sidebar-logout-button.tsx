"use client";

import { useLogout } from "@/core/auth/use-logout";

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
      <path d="M8.2 4.4H5.5A1.5 1.5 0 0 0 4 5.9v8.2a1.5 1.5 0 0 0 1.5 1.5h2.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11.2 6.6 15 10l-3.8 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.4 10H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function AdminSidebarLogoutButton() {
  const { loading, logout } = useLogout();

  return (
    <button
      type="button"
      onClick={() => logout()}
      disabled={loading}
      className="flex w-full items-center gap-3 px-4 py-[13px] text-left text-[14px] text-[#d4d4d4] transition hover:bg-[#202020] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogoutIcon />
      <span>{loading ? "Logging out..." : "Log Out"}</span>
    </button>
  );
}
