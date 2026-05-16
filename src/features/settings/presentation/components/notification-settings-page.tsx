import Link from "next/link";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import type { NotificationSettingsViewModel } from "@/features/settings/domain/entities/settings";

export function NotificationSettingsPage({ viewModel }: { viewModel: NotificationSettingsViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[1248px] pt-4">
        <div className="border-b border-white/10 bg-[#0c0c0c] px-4 py-5">
          <h1 className="text-[18px] font-semibold text-white">{viewModel.pageTitle}</h1>
          <p className="mt-2 text-[12px] text-white/55">{viewModel.pageDescription}</p>
        </div>

        <div className="bg-[#090909] px-4 py-6">
          {viewModel.phaseState === "loading" ? <div className="rounded-[14px] bg-[#1b1b1b] px-6 py-16 text-center text-white/60">Loading notification settings...</div> : null}
          {viewModel.phaseState === "error" ? <div className="rounded-[14px] bg-[#1b1b1b] px-6 py-16 text-center text-white/60">{viewModel.errorMessage}</div> : null}
          {viewModel.phaseState === "success" ? <div className="mb-4 rounded-[12px] border border-[#0CBC32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]">{viewModel.successMessage}</div> : null}
          {viewModel.phaseState === "validation" ? <div className="mb-4 rounded-[12px] border border-[#FF8D28]/25 bg-[#2a1a0d] px-4 py-3 text-[13px] text-[#ffbf7a]">{viewModel.validationMessage}</div> : null}

          {viewModel.phaseState !== "loading" && viewModel.phaseState !== "error" ? (
            <form action="/api/admin/notifications/preferences" method="POST" className="rounded-[14px] bg-[#1b1b1b] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
              <div className="space-y-6">
                {viewModel.preferences.map((preference, index) => (
                  <div key={preference.title} className="flex items-start justify-between gap-6 rounded-[12px] border border-white/6 bg-[#181818] px-4 py-4">
                    <div>
                      <h2 className="text-[16px] font-semibold text-white">{preference.title}</h2>
                      <p className="mt-2 max-w-[620px] text-[13px] leading-[1.45] text-white/52">{preference.description}</p>
                    </div>
                    <label className="relative inline-flex h-6 w-12 cursor-pointer items-center">
                      <input
                        type="checkbox"
                        name={index === 0 ? "allow_email_notifications" : index === 1 ? "notify_new_donation_received" : "send_donation_thank_you_email"}
                        defaultChecked={preference.enabled}
                        className="peer sr-only"
                        role="switch"
                        aria-label={preference.title}
                      />
                      <span className="absolute inset-0 rounded-full bg-[#3a3a3a] transition-colors peer-checked:bg-[#9B68D5]" />
                      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-6" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Link href="/overview" className="inline-flex h-10 items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#c590ff]">Cancel</Link>
                <button type="submit" className="inline-flex h-10 items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] font-semibold text-white">Save Changes</button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </AdminDashboardShell>
  );
}
