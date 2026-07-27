import Link from "next/link";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminErrorState } from "@/features/admin/presentation/components/shared/admin-table-primitives";
import type { AppVersionPlatform, AppVersionViewModel } from "@/features/admin/domain/entities/app-versions";

const PLATFORM_LABELS: Record<AppVersionPlatform, string> = {
  android: "Android",
  ios: "iOS",
};

export function AppVersionPage({ viewModel }: { viewModel: AppVersionViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[720px] pt-4">
        <div className="border-b border-white/10 bg-[var(--color-surface-strong)] px-4 py-5">
          <h1 className="text-[18px] font-semibold text-white">{viewModel.pageTitle}</h1>
          <p className="mt-2 text-[12px] text-white/55">{viewModel.pageDescription}</p>
        </div>

        <div className="bg-[var(--color-surface-strong)] px-4 py-6">
          {viewModel.phaseState === "error" ? (
            <div className="mb-4 rounded-[14px] bg-[var(--color-surface-elevated)]">
              <AdminErrorState title="Unable to load version settings" message={viewModel.errorMessage} />
            </div>
          ) : null}
          {viewModel.phaseState === "success" ? (
            <div className="mb-4 rounded-[12px] border border-[#0CBC32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]">
              {viewModel.successMessage}
            </div>
          ) : null}
          {viewModel.phaseState === "validation" ? (
            <div className="mb-4 rounded-[12px] border border-[#FF8D28]/25 bg-[#2a1a0d] px-4 py-3 text-[13px] text-[#ffbf7a]">
              {viewModel.validationMessage}
            </div>
          ) : null}
          {viewModel.phaseState === "notified" ? (
            <div className="mb-4 rounded-[12px] border border-[#0CBC32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]">
              {viewModel.notifiedMessage}
            </div>
          ) : null}

          <form
            action="/api/admin/app-version"
            method="POST"
            className="rounded-[14px] bg-[var(--color-surface-elevated)] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            <div className="space-y-6">
              {viewModel.rows.map((row) => (
                <div
                  key={row.platform}
                  className="rounded-[12px] border border-white/6 bg-[var(--color-surface-elevated)] px-4 py-4"
                >
                  <h2 className="text-[16px] font-semibold text-white">{PLATFORM_LABELS[row.platform]}</h2>
                  <p className="mt-1 text-[12px] text-white/48">
                    {row.updatedAt ? `Last updated ${new Date(row.updatedAt).toLocaleString()}` : "Not set yet — no users are being blocked or reminded on this platform."}
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[11px] text-white/60">Minimum version (blocks below this)</span>
                      <input
                        type="text"
                        name={`minimum_version_${row.platform}`}
                        defaultValue={row.minimumVersion}
                        placeholder="e.g. 1.2.0 or 1.2.0+40"
                        className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-white/60">Latest version (reminds below this)</span>
                      <input
                        type="text"
                        name={`latest_version_${row.platform}`}
                        defaultValue={row.latestVersion}
                        placeholder="e.g. 1.5.0 or 1.5.0+40"
                        className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Link href="/overview" className="inline-flex h-10 items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#c590ff]">
                Cancel
              </Link>
              <button type="submit" className="inline-flex h-10 items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] font-semibold text-white">
                Save Changes
              </button>
            </div>
          </form>

          <div className="mt-6 rounded-[14px] bg-[var(--color-surface-elevated)] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
            <h2 className="text-[14px] font-semibold text-white">Notify users</h2>
            <p className="mt-1 text-[12px] text-white/55">
              Sends a push and in-app notification to every user with a device on that platform, telling them a new
              version is available. This never fires automatically when you save above — trigger it explicitly once
              you&rsquo;re ready to announce the release.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              {viewModel.rows.map((row) => (
                <form key={row.platform} action="/api/admin/app-version/notify" method="POST">
                  <input type="hidden" name="platform" value={row.platform} />
                  <button
                    type="submit"
                    disabled={!row.minimumVersion}
                    className="inline-flex h-10 items-center rounded-[8px] border border-[#9B68D5] px-4 text-[12px] font-semibold text-[#c590ff] disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30"
                  >
                    Notify {PLATFORM_LABELS[row.platform]} users
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardShell>
  );
}
