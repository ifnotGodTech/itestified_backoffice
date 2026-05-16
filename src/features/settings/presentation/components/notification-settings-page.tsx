import Link from "next/link";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import type { NotificationSettingsViewModel } from "@/features/settings/domain/entities/settings";
import { buildNotificationSettingsHref } from "@/features/settings/presentation/state/settings-route-state";

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      className={`relative inline-flex h-6 w-12 rounded-full transition-colors ${enabled ? "bg-[#9B68D5]" : "bg-[#3a3a3a]"}`}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-7" : "translate-x-1"}`} />
    </button>
  );
}

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
            <section className="rounded-[14px] bg-[#1b1b1b] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
              <div className="space-y-6">
                {viewModel.preferences.map((preference) => (
                  <div key={preference.title} className="flex items-start justify-between gap-6 rounded-[12px] border border-white/6 bg-[#181818] px-4 py-4">
                    <div>
                      <h2 className="text-[16px] font-semibold text-white">{preference.title}</h2>
                      <p className="mt-2 max-w-[620px] text-[13px] leading-[1.45] text-white/52">{preference.description}</p>
                    </div>
                    <Toggle enabled={preference.enabled} />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Link href="/overview" className="inline-flex h-10 items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#c590ff]">Cancel</Link>
                <Link href={buildNotificationSettingsHref({ success: true })} className="inline-flex h-10 items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] font-semibold text-white">Save Changes</Link>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </AdminDashboardShell>
  );
}
