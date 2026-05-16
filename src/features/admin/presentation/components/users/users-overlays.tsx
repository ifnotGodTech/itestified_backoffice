"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { UserManagementRow, UserManagementViewModel } from "@/features/admin/domain/entities/users";
import { buildUsersHref } from "@/features/admin/presentation/state/users-route-state";

function UserProfileModal({ row, viewModel }: { row: UserManagementRow; viewModel: UserManagementViewModel }) {
  const statusClass =
    row.status === "Registered"
      ? "text-[#0cbc32]"
      : row.status === "Deleted"
        ? "text-[#ef4335]"
        : "text-[#ef4335]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="absolute inset-0" aria-label="Close user profile modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="relative min-h-[110px] bg-[#262626]">
          <Link href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="absolute right-6 top-4 text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <div className="relative px-8 pb-8 pt-2">
          <div className="-mt-16 flex justify-center">
            <div className="relative h-[102px] w-[102px] overflow-hidden rounded-full border-[6px] border-white bg-white">
              {row.avatarSrc ? <Image src={row.avatarSrc} alt={row.name} fill className="object-contain p-3" /> : null}
            </div>
          </div>
          <dl className="mt-10 grid grid-cols-[1fr_auto] gap-x-8 gap-y-4 text-[16px] text-white/90">
            <dt className="text-white/85">User ID</dt>
            <dd className="font-semibold text-right">{row.userId}</dd>
            <dt className="text-white/85">Name</dt>
            <dd className="font-semibold text-right">{row.name}</dd>
            <dt className="text-white/85">Email</dt>
            <dd className="font-semibold text-right">{row.email}</dd>
            <dt className="text-white/85">Status</dt>
            <dd className={`font-semibold text-right ${statusClass}`}>{row.status}</dd>
            <dt className="text-white/85">Registration Date</dt>
            <dd className="font-semibold text-right">{row.registrationDate}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function DeactivatedAccountDetailModal({ row, viewModel }: { row: UserManagementRow; viewModel: UserManagementViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="absolute inset-0" aria-label="Close deactivated account modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="relative min-h-[110px] bg-[#262626]">
          <Link href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="absolute right-6 top-4 text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <div className="relative overflow-y-auto px-6 pb-8 pt-2">
          <div className="-mt-16 flex justify-center">
            <div className="relative h-[102px] w-[102px] overflow-hidden rounded-full border-[6px] border-white bg-white">
              {row.avatarSrc ? <Image src={row.avatarSrc} alt={row.name} fill className="object-contain p-3" /> : null}
            </div>
          </div>
          <dl className="mt-10 grid grid-cols-[1fr_auto] gap-x-8 gap-y-4 text-[16px] text-white/90">
            <dt className="text-white/85">User ID</dt>
            <dd className="font-semibold text-right">{row.userId}</dd>
            <dt className="text-white/85">Name</dt>
            <dd className="font-semibold text-right">{row.name}</dd>
            <dt className="text-white/85">Email</dt>
            <dd className="font-semibold text-right">{row.email}</dd>
            <dt className="text-white/85">Status</dt>
            <dd className="font-semibold text-right text-[#ef4335]">Deactivated</dd>
            <dt className="text-white/85">Registration Date</dt>
            <dd className="font-semibold text-right">{row.registrationDate}</dd>
          </dl>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className="text-[16px] font-semibold text-white">Account Timeline</h3>
            <div className="mt-6 grid grid-cols-[1fr_auto] gap-x-8 gap-y-4 text-[16px] text-white/90">
              <span className="text-white/85">Deactivated On</span>
              <span className="font-semibold">{row.deactivatedOn}</span>
            </div>
            <div className="mt-5 rounded-[12px] bg-[#2a2a2a] px-6 py-5">
              <p className="text-[15px] font-medium text-white">Deactivation Reason</p>
              <p className="mt-4 text-[14px] leading-8 text-white/72">{row.deactivationReason}</p>
              <p className="mt-4 text-[14px] text-white/90">By {row.deactivatedBy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeactivateAccountModal({ row, viewModel }: { row: UserManagementRow; viewModel: UserManagementViewModel }) {
  const reasons = [
    "Suspicious account activity",
    "Multiple policy violations",
    "Fake or misleading profile information",
    "Multiple booking cancellations",
    "Fraudulent payment activity",
    "User reported by multiple hosts",
    "Terms of service violation",
  ];
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="absolute inset-0" aria-label="Close deactivate account modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-[28px] font-semibold text-white">Deactivate Account</h2>
          <Link href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <div className="overflow-y-auto px-6 py-6">
          <p className="mb-4 text-[16px] text-white/90">Deactivation Reason</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsReasonOpen((current) => !current)}
              className={`flex w-full items-center justify-between rounded-[12px] border px-4 py-4 text-left text-[15px] text-white transition ${
                isReasonOpen ? "border-white/25 bg-[#2f2f2f]" : "border-transparent bg-[#2a2a2a]"
              }`}
              aria-expanded={isReasonOpen}
            >
              <span className={selectedReason ? "text-white" : "text-white/72"}>{selectedReason ?? "Select"}</span>
              <span className={`text-[11px] text-white/85 transition-transform ${isReasonOpen ? "rotate-180" : ""}`}>▾</span>
            </button>

            {isReasonOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-[12px] border border-white/20 bg-[#2f2f2f] shadow-[0_14px_24px_rgba(0,0,0,0.35)]">
                {reasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => {
                      setSelectedReason(reason);
                      setIsReasonOpen(false);
                    }}
                    className="block w-full border-t border-white/15 px-5 py-4 text-left text-[15px] text-white first:border-t-0 hover:bg-white/[0.04]"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <p className="mt-5 text-[14px] leading-7 text-white/72">
            You are about to deactivate <span className="text-white">{row.name}</span>. The user will lose access until an admin reactivates their account.
          </p>
        </div>
        <div className="flex justify-end gap-4 px-6 pb-6 pt-2">
          <Link
            href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })}
            className="inline-flex min-w-[116px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-5 py-4 text-[16px] text-[#9B68D5]"
          >
            Cancel
          </Link>
          <Link
            href={buildUsersHref({ tab: "deactivated", success: "deactivate" })}
            className="inline-flex min-w-[190px] items-center justify-center rounded-[10px] bg-[#ef4335] px-5 py-4 text-[16px] text-white"
          >
            Confirm Deactivation
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReactivateAccountModal({ row, viewModel }: { row: UserManagementRow; viewModel: UserManagementViewModel }) {
  const reasons = ["Account Deactivated by Mistake", "System Error Correction", "Issue Resolved"];
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalReason, setAdditionalReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="absolute inset-0" aria-label="Close reactivate account modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[580px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-end px-6 pt-5">
          <Link href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <div className="overflow-y-auto px-6 pb-6 pt-1">
          <h2 className="text-center text-[28px] font-semibold text-white">Reactivate Account?</h2>
          <p className="mx-auto mt-6 max-w-[470px] text-center text-[17px] leading-[1.5] text-white/78">
            Are you sure you want to reactivate this account? Please select a reason for reactivation to help us keep accurate records.
          </p>

          <div className="mt-8">
            <p className="mb-4 text-[16px] text-white/90">Reactivation Reason</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsReasonOpen((current) => !current)}
                className={`flex w-full items-center justify-between rounded-[12px] border px-4 py-4 text-left text-[15px] text-white transition ${
                  isReasonOpen ? "border-white/25 bg-[#2f2f2f]" : "border-transparent bg-[#2a2a2a]"
                }`}
                aria-expanded={isReasonOpen}
              >
                <span className={selectedReason ? "text-white" : "text-white/72"}>{selectedReason ?? "Select"}</span>
                <span className={`text-[11px] text-white/85 transition-transform ${isReasonOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              {isReasonOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-[12px] border border-white/20 bg-[#2f2f2f] shadow-[0_14px_24px_rgba(0,0,0,0.35)]">
                  {reasons.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        setSelectedReason(reason);
                        setIsReasonOpen(false);
                      }}
                      className="block w-full border-t border-white/15 px-5 py-4 text-left text-[15px] text-white first:border-t-0 hover:bg-white/[0.04]"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5">
            <textarea
              value={additionalReason}
              onChange={(event) => setAdditionalReason(event.target.value.slice(0, 200))}
              placeholder="Additional Reason"
              className="min-h-[152px] w-full resize-none rounded-[14px] border border-white/10 bg-[#2b2b2b] px-5 py-4 text-[16px] leading-7 text-white outline-none placeholder:text-white/35"
            />
            <div className="mt-3 text-right text-[14px] text-white/72">{additionalReason.length}/200</div>
          </div>

          <div className="mt-4 flex items-start gap-4 rounded-[12px] bg-[#313131] px-4 py-4 text-white/90">
            <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/70 text-[14px] leading-none">i</span>
            <p className="max-w-[430px] text-[15px] leading-[1.45] text-white/88">
              The selected reason as well as the additional reason will be sent to the user&apos;s email to inform them of their account reactivation.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-4 px-6 pb-6 pt-2">
          <Link
            href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })}
            className="inline-flex min-w-[176px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] text-[#9B68D5]"
          >
            Cancel
          </Link>
          <Link
            href={buildUsersHref({ tab: "registered", success: "reactivate" })}
            className="inline-flex min-w-[176px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 py-4 text-[16px] text-white"
          >
            Reactivate
          </Link>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ viewModel }: { viewModel: UserManagementViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <Link href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="absolute inset-0" aria-label="Close success modal" />
      <div className="relative z-10 max-h-[calc(100vh-32px)] w-full max-w-[400px] overflow-y-auto rounded-[24px] bg-[#1f1f1f] px-8 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="mx-auto flex h-[102px] w-[102px] items-center justify-center rounded-full bg-[#9B68D5] text-[62px] text-white">✓</div>
        <p className="mt-10 text-[28px] font-semibold leading-[1.3] text-white">{viewModel.successMessage}</p>
      </div>
    </div>
  );
}

export function UsersOverlays({ viewModel }: { viewModel: UserManagementViewModel }) {
  return (
    <>
      {viewModel.showDetails && viewModel.selectedRow && viewModel.activeTab !== "deactivated" ? <UserProfileModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showDetails && viewModel.selectedRow && viewModel.activeTab === "deactivated" ? <DeactivatedAccountDetailModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showDeactivateConfirm && viewModel.selectedRow ? <DeactivateAccountModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showReactivateConfirm && viewModel.selectedRow ? <ReactivateAccountModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showSuccess && viewModel.successMessage ? <SuccessModal viewModel={viewModel} /> : null}
    </>
  );
}
