import Link from "next/link";
import {
  AdminActionMenuBackdrop,
  AdminActionMenuPanel,
  AdminRowMenuIcon,
  AdminSearchIcon,
} from "@/features/admin/presentation/components/shared/admin-table-primitives";
import type { AdminManagementRow, AdminManagementViewModel } from "@/features/admin/domain/entities/admin-management";
import { buildAdminManagementHref } from "@/features/admin/presentation/state/admin-management-route-state";

function statusClasses(status: AdminManagementRow["status"]) {
  if (status === "Active") return "border-[#0CBC32]/30 bg-[#0f2615] text-[#8de7a0]";
  if (status === "Invited") return "border-[#FF8D28]/30 bg-[#2a1a0d] text-[#ffbf7a]";
  return "border-[#ef4335]/30 bg-[#291212] text-[#ff8f8f]";
}

function closeHref(viewModel: AdminManagementViewModel) {
  return buildAdminManagementHref({
    tab: viewModel.activeTab,
    q: viewModel.searchQuery || null,
  });
}

function AdminStatusPill({ status }: { status: AdminManagementRow["status"] }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] ${statusClasses(status)}`}>{status}</span>;
}

function AdminMenu({ row, viewModel }: { row: AdminManagementRow; viewModel: AdminManagementViewModel }) {
  const openUp = viewModel.rows.length - viewModel.rows.indexOf(row) <= 1;
  return (
    <>
      <AdminActionMenuBackdrop href={closeHref(viewModel)} label="Close admin actions menu" />
      <AdminActionMenuPanel className={`absolute right-0 z-50 min-w-[150px] rounded-[8px] border-[#626262] bg-[#2a2a2a] ${openUp ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"}`}>
        {row.canAssignRole ? (
          <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, assignRole: row.id })} className="block border-b border-white/10 px-3 py-[10px] text-[10px] text-white/85">
            Select Role
          </Link>
        ) : null}
        {row.canManageRole ? (
          <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, manageRole: row.id })} className="block border-b border-white/10 px-3 py-[10px] text-[10px] text-white/85">
            Change Member Roles
          </Link>
        ) : null}
        {row.canViewPermissions ? (
          <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, permission: row.id })} className="block border-b border-white/10 px-3 py-[10px] text-[10px] text-white/85">
            View Permission Details
          </Link>
        ) : null}
        {row.canRenameRole ? (
          <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, renameRole: row.id })} className="block border-b border-white/10 px-3 py-[10px] text-[10px] text-white/85">
            Rename Role
          </Link>
        ) : null}
        {row.canDelete ? (
          <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, remove: row.id })} className="block px-3 py-[10px] text-[10px] text-[#ef4335]">
            Delete Admin User
          </Link>
        ) : null}
      </AdminActionMenuPanel>
    </>
  );
}

export function AdminManagementTable({ viewModel }: { viewModel: AdminManagementViewModel }) {
  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div className="rounded-[20px] bg-[#1b1b1b] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex items-end justify-between px-[14px] py-[12px]">
          <div>
            <p className="text-[16px] font-normal text-white">{viewModel.sectionTitle}</p>
            <p className="mt-1 text-[10px] text-white/45">Manage admin users, assigned roles, and permission access.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-[240px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
                <AdminSearchIcon />
              </span>
              <input
                readOnly
                defaultValue={viewModel.searchQuery}
                placeholder={viewModel.searchPlaceholder}
                className="h-[28px] w-full rounded-[8px] bg-[#262626] pl-9 pr-3 text-[10px] text-white/70 placeholder:text-white/28 outline-none"
              />
            </div>
            <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, invite: true })} className="inline-flex h-[32px] items-center rounded-[8px] border border-[#9B68D5] px-4 text-[12px] font-medium text-[#d9b5ff]">
              Invite New User
            </Link>
            <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, createRole: true })} className="inline-flex h-[32px] items-center rounded-[8px] bg-[#9B68D5] px-4 text-[12px] font-medium text-white">
              Create Role
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 px-[14px] pb-3">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "deactivated", label: "Deactivated" },
          ].map((tab) => {
            const isActive = viewModel.activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={buildAdminManagementHref({ tab: tab.key as never, q: viewModel.searchQuery || null })}
                className={`inline-flex h-[30px] items-center rounded-full px-4 text-[12px] ${
                  isActive ? "bg-[#9B68D5] text-white" : "bg-[#262626] text-white/58"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-[1.15fr_1.25fr_0.9fr_120px_170px_132px_40px] items-center bg-[#262626] px-[10px] py-[8px] text-[10px] text-white/90">
          <span>Admin Name ↕</span>
          <span>Email Address ↕</span>
          <span>Admin Role ↕</span>
          <span>Status ↕</span>
          <span>Last Active ↕</span>
          <span>Permissions</span>
          <span>Action</span>
        </div>

        {viewModel.phaseState === "loading" ? <div className="px-8 py-16 text-center text-white/70">Loading admins...</div> : null}
        {viewModel.phaseState === "error" ? <div className="px-8 py-16 text-center text-white/70">{viewModel.errorMessage}</div> : null}
        {viewModel.phaseState === "empty" ? <div className="px-8 py-16 text-center text-[18px] font-medium text-white/90">No Admins Yet</div> : null}

        {viewModel.phaseState === "populated"
          ? viewModel.rows.map((row) => (
              <div key={row.id} className="grid grid-cols-[1.15fr_1.25fr_0.9fr_120px_170px_132px_40px] items-center gap-[10px] border-t border-white/10 px-[10px] py-[12px]">
                <span className="truncate text-[12px] text-white/85">{row.fullName}</span>
                <span className="truncate text-[12px] text-white/72">{row.email}</span>
                <span className="truncate text-[12px] text-white/72">{row.role}</span>
                <AdminStatusPill status={row.status} />
                <span className="text-[12px] text-white/72">{row.lastActive}</span>
                {row.canViewPermissions ? (
                  <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, permission: row.id })} className="truncate text-[11px] text-[#b27bff]">
                    View Permission Details
                  </Link>
                ) : (
                  <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, assignRole: row.id })} className="truncate text-[11px] text-[#b27bff]">
                    Select Role
                  </Link>
                )}
                <div className="relative flex justify-end">
                  <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, menu: row.id })} aria-label={`Open admin actions ${row.id}`} className="text-white/60">
                    <AdminRowMenuIcon />
                  </Link>
                  {viewModel.showMenuForId === row.id ? <AdminMenu row={row} viewModel={viewModel} /> : null}
                </div>
              </div>
            ))
          : null}

        <div className="flex items-center justify-between px-[10px] py-7 text-[10px] text-white/62">
          <span>{viewModel.showingLabel}</span>
          <div className="flex gap-3">
            <button type="button" className="rounded-[8px] border border-white/15 px-4 py-[6px] text-[12px] text-white/45">Previous</button>
            <button type="button" className="rounded-[8px] border border-[#9B68D5] px-4 py-[6px] text-[12px] text-[#b27bff]">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
