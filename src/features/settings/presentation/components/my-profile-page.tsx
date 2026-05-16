import Link from "next/link";
import type { ReactNode } from "react";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import type { MyProfileViewModel } from "@/features/settings/domain/entities/settings";
import { buildMyProfileHref } from "@/features/settings/presentation/state/settings-route-state";

function SettingsCard({
  title,
  subtitle,
  actions,
  children,
  highlighted = false,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  highlighted?: boolean;
}) {
  return (
    <section
      className={`rounded-[14px] bg-[#1b1b1b] px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] md:px-5 ${
        highlighted ? "border border-white/20" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-[12px] leading-[1.45] text-white/45">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProfilePicture({ viewModel }: { viewModel: MyProfileViewModel }) {
  return (
    <div className="relative mb-5">
      <div className="flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-full bg-[#d8d8d8]">
        {viewModel.hasProfileImage ? (
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_35%,#684b44_0,#58413b_26%,#d9d9d9_27%,#d9d9d9_40%,#0000_41%),linear-gradient(180deg,#6b655f_0,#9a7a63_45%,#222_100%)]" />
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-12 w-12 text-[#262626]" fill="none">
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M5 19c0-3.3 3.13-5 7-5s7 1.7 7 5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          </svg>
        )}
      </div>
      {viewModel.hasProfileImage ? (
        <Link
          href={buildMyProfileHref({ screen: viewModel.screen, menu: true })}
          aria-label="Open profile picture actions"
          className="absolute left-[66px] top-[36px] flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none">
            <path d="m5.5 13.5 6.75-6.75 2 2L7.5 15.5H5.5v-2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
            <path d="m11.5 4.75 2 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
          </svg>
        </Link>
      ) : null}
      {viewModel.showPictureMenu ? (
        <div className="absolute left-0 top-[92px] z-10 w-[100px] overflow-hidden rounded-[6px] border border-white/8 bg-[#2b2b2b] text-[9px] shadow-[0_14px_24px_rgba(0,0,0,0.4)]">
          <Link href={buildMyProfileHref({ screen: viewModel.screen })} className="block w-full px-3 py-2 text-left text-white/72">Change Picture</Link>
          <Link href={buildMyProfileHref({ screen: viewModel.screen })} className="block w-full px-3 py-2 text-left text-white/72">View Picture</Link>
          <Link href={buildMyProfileHref({ screen: viewModel.screen })} className="block w-full px-3 py-2 text-left text-[#E53935]">Remove Picture</Link>
        </div>
      ) : null}
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/10 py-4 first:border-t-0 first:pt-0">
      <p className="text-[14px] text-white">{label}</p>
      <p className="mt-2 text-[14px] text-white/68">{value}</p>
    </div>
  );
}

function PasswordModal({ screen }: { screen: MyProfileViewModel["screen"] }) {
  return (
    <div className="fixed inset-0 z-30 bg-black/55 px-4 py-10">
      <div className="mx-auto max-w-[384px] overflow-hidden rounded-[14px] bg-[#1b1b1b] shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <h2 className="text-[18px] font-semibold text-white">Change Password</h2>
          <Link href={buildMyProfileHref({ screen })} className="text-[24px] leading-none text-white/80">×</Link>
        </div>
        <div className="space-y-4 px-4 py-4">
          <label className="block">
            <span className="mb-2 block text-[12px] text-white">Current Password</span>
            <input value="" readOnly aria-label="Current Password" placeholder="Enter Current Password" className="h-10 w-full rounded-[6px] border border-white/6 bg-[#2a2a2a] px-3 text-[12px] text-white/70 outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-[12px] text-white">New Password</span>
            <input value="" readOnly aria-label="New Password" placeholder="Enter New Password" className="h-10 w-full rounded-[6px] border border-white/6 bg-[#2a2a2a] px-3 text-[12px] text-white/70 outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-[12px] text-white">Confirm Password</span>
            <input value="" readOnly aria-label="Confirm Password" placeholder="Confirm New Password" className="h-10 w-full rounded-[6px] border border-white/6 bg-[#2a2a2a] px-3 text-[12px] text-white/70 outline-none" />
          </label>
          <div className="border-t border-white/10 pt-3 text-[12px] text-white/62">
            <p className="mb-2 font-semibold text-white">Password Must:</p>
            <p>Be At least 8 characters long</p>
            <p className="mt-2">Contains at least one uppercase letter (A-Z)</p>
            <p className="mt-2">Contains at least one lowercase letter (a-z)</p>
            <p className="mt-2">Contains at least one number (0-9)</p>
            <p className="mt-2">Contains at least one special character (!@#$%^&*)</p>
            <p className="mt-2">Match the confirmation password</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-white/10 px-4 py-4">
          <Link href={buildMyProfileHref({ screen })} className="inline-flex h-9 items-center rounded-[8px] border border-[#9B68D5] px-6 text-[12px] text-[#c590ff]">Cancel</Link>
          <Link href={buildMyProfileHref({ state: "success" })} className="inline-flex h-9 items-center rounded-[8px] bg-white/45 px-6 text-[12px] text-white">Update Password</Link>
        </div>
      </div>
    </div>
  );
}

export function MyProfilePage({ viewModel }: { viewModel: MyProfileViewModel }) {
  const isEditing = viewModel.screen === "personal" || viewModel.screen === "contact" || viewModel.screen === "otp";
  const isPersonalEdit = viewModel.screen === "personal";
  const isContactEdit = viewModel.screen === "contact";
  const isOtp = viewModel.screen === "otp";
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[1248px] pt-4">
        <div className="border-b border-white/10 bg-[#0c0c0c] px-4 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[18px] font-semibold text-white">{viewModel.pageTitle}</h1>
              <p className="mt-2 text-[12px] text-white/55">{viewModel.pageDescription}</p>
            </div>
            <Link href={buildMyProfileHref({ password: true, screen: viewModel.screen })} className="inline-flex h-[42px] items-center rounded-[8px] bg-[#9B68D5] px-5 text-[14px] font-semibold text-white">
              Change My Password
            </Link>
          </div>
        </div>

        <div className="bg-[#090909] px-4 py-6">
          <ProfilePicture viewModel={viewModel} />

          {viewModel.phaseState === "loading" ? <div className="rounded-[14px] bg-[#1b1b1b] px-6 py-16 text-center text-white/60">Loading profile...</div> : null}
          {viewModel.phaseState === "error" ? <div className="rounded-[14px] bg-[#1b1b1b] px-6 py-16 text-center text-white/60">{viewModel.errorMessage}</div> : null}
          {viewModel.phaseState === "success" ? <div className="mb-4 rounded-[12px] border border-[#0CBC32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]">{viewModel.successMessage}</div> : null}
          {viewModel.phaseState === "validation" ? <div className="mb-4 rounded-[12px] border border-[#FF8D28]/25 bg-[#2a1a0d] px-4 py-3 text-[13px] text-[#ffbf7a]">{viewModel.validationMessage}</div> : null}

          <div className="space-y-4">
            <SettingsCard
              title="Personal Information"
              highlighted={isEditing}
              actions={
                viewModel.screen === "profile" ? (
                  <Link href={buildMyProfileHref({ screen: "personal" })} className="inline-flex items-center gap-1.5 text-[12px] text-[#b888ff]">
                    <span>✎</span>
                    <span>Edit</span>
                  </Link>
                ) : (
                  <div className="flex gap-3">
                    <Link href="/my-profile" className="inline-flex h-[30px] items-center rounded-[8px] border border-[#9B68D5] px-4 text-[12px] text-[#c590ff]">Cancel</Link>
                    <Link href={buildMyProfileHref({ state: "success" })} className="inline-flex h-[30px] items-center rounded-[8px] bg-[#9B68D5]/45 px-4 text-[12px] text-white">
                      Save Changes
                    </Link>
                  </div>
                )
              }
            >
              {!isPersonalEdit ? (
                <>
                  <FieldRow label="Role" value={viewModel.roleLabel} />
                  <FieldRow label="Full Name" value={viewModel.fullName} />
                  <FieldRow label="Mobile Number" value={viewModel.mobileNumber} />
                </>
              ) : (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-[14px] text-white">Full Name</span>
                    <input value={viewModel.fullName} readOnly aria-label="Full Name" className="h-11 w-full rounded-[6px] border border-white/6 bg-[#2a2a2a] px-3 text-[14px] text-white/70 outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[14px] text-white">Mobile Number</span>
                    <input value={viewModel.mobileNumber} readOnly aria-label="Mobile Number" className="h-11 w-full rounded-[6px] border border-white/6 bg-[#2a2a2a] px-3 text-[14px] text-white/70 outline-none" />
                  </label>
                </div>
              )}
            </SettingsCard>

            <SettingsCard
              title="Contact Information"
              highlighted={isEditing}
              subtitle={
                viewModel.screen === "profile"
                  ? "To proceed, please click the button below to send a verification code to your current email address."
                  : isContactEdit
                    ? "Enter Your New Email Address"
                    : "Please enter the OTP Sent to oreore@yopmail.com to continue"
              }
              actions={
                viewModel.screen === "profile" ? (
                  <Link href={buildMyProfileHref({ screen: "contact" })} className="inline-flex items-center gap-1.5 text-[12px] text-[#b888ff]">
                    <span>✎</span>
                    <span>Edit</span>
                  </Link>
                ) : (
                  <Link href="/my-profile" className="inline-flex h-[30px] items-center rounded-[8px] border border-[#9B68D5] px-4 text-[12px] text-[#c590ff]">Cancel</Link>
                )
              }
            >
              {viewModel.screen === "profile" ? (
                <div>
                  <p className="text-[14px] text-white">Email Address</p>
                  <p className="mt-3 text-[14px] text-white/68">{viewModel.emailAddress}</p>
                  <Link href={buildMyProfileHref({ screen: "otp" })} className="mt-6 inline-flex h-8 items-center rounded-[8px] bg-[#9B68D5] px-4 text-[12px] font-semibold text-white">Send OTP</Link>
                </div>
              ) : null}

              {isContactEdit ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[14px] text-white">Old Email Address</p>
                    <p className="mt-3 text-[14px] text-white/68">{viewModel.emailAddress}</p>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-[14px] text-white">New Email Address</span>
                    <input value="" readOnly aria-label="New Email Address" placeholder="Enter new Email Address" className="h-11 w-full rounded-[6px] border border-white/6 bg-[#2a2a2a] px-3 text-[12px] text-white/65 outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[14px] text-white">Confirm Email Address</span>
                    <input value="" readOnly aria-label="Confirm Email Address" placeholder="Confirm Email Address" className="h-11 w-full rounded-[6px] border border-white/6 bg-[#2a2a2a] px-3 text-[12px] text-white/65 outline-none" />
                  </label>
                  <Link href={buildMyProfileHref({ screen: "otp" })} className="inline-flex h-8 items-center rounded-[8px] bg-white/45 px-4 text-[11px] text-white">
                    Save
                  </Link>
                </div>
              ) : null}

              {isOtp ? (
                <div>
                  <p className="text-[14px] text-white">Email Address</p>
                  <p className="mt-3 text-[14px] text-white/68">{viewModel.emailAddress}</p>
                  <label className="mt-6 block">
                    <span className="mb-2 block text-[14px] text-white">OTP</span>
                    <div className="flex items-center gap-3">
                      <input value="1234" readOnly aria-label="OTP" className="h-11 flex-1 rounded-[6px] border border-white/6 bg-[#2a2a2a] px-3 text-[12px] text-white/75 outline-none" />
                      <Link href={buildMyProfileHref({ screen: "otp", state: "success" })} className="inline-flex h-8 items-center rounded-[8px] bg-[#9B68D5] px-4 text-[11px] text-white/90">
                        Verify
                      </Link>
                    </div>
                  </label>
                  <div className="mt-4 flex items-center gap-2 text-[12px] text-white/52">
                    <span>Didn&apos;t receive an Email?</span>
                    <Link href={buildMyProfileHref({ screen: "otp", state: "validation" })} className="text-[#9B68D5]">
                      Resend OTP
                    </Link>
                  </div>
                </div>
              ) : null}
            </SettingsCard>
          </div>
        </div>

        {viewModel.showPasswordModal ? <PasswordModal screen={viewModel.screen} /> : null}
      </div>
    </AdminDashboardShell>
  );
}
