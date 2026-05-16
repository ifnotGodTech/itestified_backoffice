import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminManagementViewModel } from "@/features/admin/domain/entities/admin-management";
import { buildAdminManagementHref } from "@/features/admin/presentation/state/admin-management-route-state";

function closeHref(viewModel: AdminManagementViewModel) {
  return buildAdminManagementHref({
    tab: viewModel.activeTab,
    q: viewModel.searchQuery || null,
  });
}

function ModalShell({
  title,
  subtitle,
  children,
  maxWidth = "max-w-[420px]",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <div className={`relative z-10 w-full ${maxWidth} rounded-[20px] bg-[#1f1f1f] shadow-[0_20px_60px_rgba(0,0,0,0.35)]`}>
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-[18px] font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-[12px] leading-[1.45] text-white/55">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export function AdminManagementOverlays({ viewModel }: { viewModel: AdminManagementViewModel }) {
  return (
    <>
      {viewModel.showInviteUserModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close invite user modal" />
          <ModalShell title="Invite New User" subtitle="Invite a new Super Admin" maxWidth="max-w-[520px]">
            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="mb-2 block text-[12px] text-white">Email Address</span>
                <input
                  readOnly
                  value="newadmin@itestified.app"
                  aria-label="Email Address"
                  className="h-[40px] w-full rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[12px] text-white">Role</span>
                <div className="flex h-[40px] items-center justify-between rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80">
                  <span>Select Role</span>
                  <span>▾</span>
                </div>
              </label>
              <p className="rounded-[10px] bg-[#262626] px-4 py-3 text-[12px] leading-[1.5] text-white/60">
                You have been invited to join the iTestified Admin team, Please create a password to access your dashboard
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
              <Link href={closeHref(viewModel)} className="inline-flex h-[38px] items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#c590ff]">Cancel</Link>
              <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, success: true, successType: "admin-assigned" })} className="inline-flex h-[38px] items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] text-white">Invite New User</Link>
            </div>
          </ModalShell>
        </div>
      ) : null}

      {viewModel.showPermissionDetailsModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close permission details modal" />
          <ModalShell title="Permission Details" subtitle="Permission Page" maxWidth="max-w-[520px]">
            <div className="space-y-4 px-5 py-5">
              <div>
                <p className="text-[12px] text-white/55">Admin User</p>
                <p className="mt-2 text-[14px] text-white">{viewModel.selectedRow?.fullName}</p>
              </div>
              <div>
                <p className="text-[12px] text-white/55">Admin Role</p>
                <p className="mt-2 text-[14px] text-white">{viewModel.selectedRow?.role}</p>
              </div>
              <div>
                <p className="text-[12px] text-white/55">Current Access</p>
                <ul className="mt-2 space-y-2 text-[13px] text-white/75">
                  <li>Dashboard overview access</li>
                  <li>Content moderation tools</li>
                  <li>Donation review permissions</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
              <Link href={closeHref(viewModel)} className="inline-flex h-[38px] items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#c590ff]">Close</Link>
              <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, managePermissions: viewModel.selectedRow?.id ?? null })} className="inline-flex h-[38px] items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] text-white">Manage Permissions</Link>
            </div>
          </ModalShell>
        </div>
      ) : null}

      {viewModel.showManagePermissionsModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close manage permissions modal" />
          <ModalShell title="Manage Permissions" subtitle="Permission Page" maxWidth="max-w-[560px]">
            <div className="space-y-4 px-5 py-5">
              <div>
                <p className="text-[12px] text-white/55">Admin User</p>
                <p className="mt-2 text-[14px] text-white">{viewModel.selectedRow?.fullName}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {["Overview", "Users", "Donations", "Analytics"].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-[10px] bg-[#2a2a2a] px-4 py-3">
                    <span className="text-[13px] text-white/85">{item}</span>
                    <span className="text-[12px] text-[#8de7a0]">Allowed</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
              <Link href={closeHref(viewModel)} className="inline-flex h-[38px] items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#c590ff]">Cancel</Link>
              <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, success: true })} className="inline-flex h-[38px] items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] text-white">Save Permissions</Link>
            </div>
          </ModalShell>
        </div>
      ) : null}

      {viewModel.showAssignRoleModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close assign role modal" />
          <ModalShell title="Select Role" subtitle="Admin Users" maxWidth="max-w-[420px]">
            <div className="space-y-4 px-5 py-5">
              <div>
                <p className="text-[12px] text-white/55">Admin User</p>
                <p className="mt-2 text-[14px] text-white">{viewModel.selectedRow?.fullName}</p>
              </div>
              <label className="block">
                <span className="mb-2 block text-[12px] text-white">Role</span>
                <div className="flex h-[40px] items-center justify-between rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80">
                  <span>Select Role</span>
                  <span>▾</span>
                </div>
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
              <Link href={closeHref(viewModel)} className="inline-flex h-[38px] items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#c590ff]">Cancel</Link>
              <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, success: true, successType: "admin-assigned" })} className="inline-flex h-[38px] items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] text-white">Assign Role</Link>
            </div>
          </ModalShell>
        </div>
      ) : null}

      {viewModel.showCreateRoleModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close create role modal" />
          <ModalShell title="Create Role" subtitle="Assign a dashboard role to define this admin's access level.">
            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="mb-2 block text-[12px] text-white">Role</span>
                <div className="flex h-[40px] items-center justify-between rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80">
                  <span>Select Role</span>
                  <span>▾</span>
                </div>
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
              <Link href={closeHref(viewModel)} className="inline-flex h-[38px] items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#c590ff]">Cancel</Link>
              <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, success: true })} className="inline-flex h-[38px] items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] text-white">Create Role</Link>
            </div>
          </ModalShell>
        </div>
      ) : null}

      {viewModel.showManageRoleModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close manage role modal" />
          <ModalShell title="Manage Role" subtitle="Change Member Roles">
            <div className="space-y-4 px-5 py-5">
              <div>
                <p className="text-[12px] text-white/55">Admin Name</p>
                <p className="mt-2 text-[14px] text-white">{viewModel.selectedRow?.fullName}</p>
              </div>
              <label className="block">
                <span className="mb-2 block text-[12px] text-white">Role</span>
                <div className="flex h-[40px] items-center justify-between rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80">
                  <span>{viewModel.selectedRow?.role ?? "Select Role"}</span>
                  <span>▾</span>
                </div>
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
              <Link href={closeHref(viewModel)} className="inline-flex h-[38px] items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#c590ff]">Cancel</Link>
              <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, success: true })} className="inline-flex h-[38px] items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] text-white">Manage Role</Link>
            </div>
          </ModalShell>
        </div>
      ) : null}

      {viewModel.showRenameRoleModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close rename role modal" />
          <ModalShell title="Rename Role" subtitle="Update the visible role label for this admin permission set.">
            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="mb-2 block text-[12px] text-white">Admin Role</span>
                <input
                  readOnly
                  value={viewModel.selectedRow?.role ?? ""}
                  aria-label="Admin Role"
                  className="h-[40px] w-full rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80 outline-none"
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
              <Link href={closeHref(viewModel)} className="inline-flex h-[38px] items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#c590ff]">Cancel</Link>
              <Link href={buildAdminManagementHref({ tab: viewModel.activeTab, q: viewModel.searchQuery || null, success: true })} className="inline-flex h-[38px] items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] text-white">Rename Role</Link>
            </div>
          </ModalShell>
        </div>
      ) : null}

      {viewModel.showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close delete admin modal" />
          <div className="relative z-10 w-full max-w-[540px] rounded-[20px] bg-[#1f1f1f] px-10 pb-10 pt-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <h2 className="text-[24px] font-semibold text-white">Delete Admin User?</h2>
            <p className="mx-auto mt-8 max-w-[460px] text-[18px] leading-[1.4] text-white/78">
              Are you sure you want to delete this admin user? This action cannot be undone.
            </p>
            <div className="mt-12 flex justify-center gap-6">
              <Link href={closeHref(viewModel)} className="inline-flex h-[50px] min-w-[160px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[16px] text-[#9B68D5]">Cancel</Link>
              <Link href={closeHref(viewModel)} className="inline-flex h-[50px] min-w-[160px] items-center justify-center rounded-[10px] bg-[#ef3931] px-6 text-[16px] text-white">Yes, delete</Link>
            </div>
          </div>
        </div>
      ) : null}

      {viewModel.showSuccessModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close role created modal" />
          <div className="relative z-10 w-full max-w-[420px] rounded-[20px] bg-[#1f1f1f] px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#0f2615] text-[#0CBC32]">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="mt-5 text-[24px] font-semibold text-white">{viewModel.successTitle}</h2>
            <div className="mt-8">
              <Link href={closeHref(viewModel)} className="inline-flex h-[44px] items-center rounded-[10px] bg-[#9B68D5] px-6 text-[14px] font-medium text-white">Done</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
