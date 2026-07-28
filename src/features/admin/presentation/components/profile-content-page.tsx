import Link from "next/link";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminErrorState } from "@/features/admin/presentation/components/shared/admin-table-primitives";
import type { ProfileContentKey, ProfileContentViewModel } from "@/features/admin/domain/entities/profile-content";

const KEY_LABELS: Record<ProfileContentKey, string> = {
  about_us: "About Us",
  terms_of_use: "Terms of Use",
  privacy_policy: "Privacy Policy",
};

export function ProfileContentPage({ viewModel }: { viewModel: ProfileContentViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[720px] pt-4">
        <div className="border-b border-white/10 bg-[var(--color-surface-strong)] px-4 py-5">
          <h1 className="text-[18px] font-semibold text-white">{viewModel.pageTitle}</h1>
          <p className="mt-2 text-[12px] text-white/55">{viewModel.pageDescription}</p>
        </div>

        <div className="bg-[var(--color-surface-strong)] px-4 py-6">
          {viewModel.state === "error" ? (
            <div className="mb-4 rounded-[14px] bg-[var(--color-surface-elevated)]">
              <AdminErrorState title="Unable to load content" message={viewModel.errorMessage} />
            </div>
          ) : null}
          {viewModel.state === "success" ? (
            <div className="mb-4 rounded-[12px] border border-[#0CBC32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]">
              {viewModel.successMessage}
            </div>
          ) : null}
          {viewModel.state === "validation" ? (
            <div className="mb-4 rounded-[12px] border border-[#FF8D28]/25 bg-[#2a1a0d] px-4 py-3 text-[13px] text-[#ffbf7a]">
              {viewModel.validationMessage}
            </div>
          ) : null}

          <form
            action="/api/admin/profile-content"
            method="POST"
            className="rounded-[14px] bg-[var(--color-surface-elevated)] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            <div className="space-y-6">
              {viewModel.rows.map((row) => (
                <div
                  key={row.key}
                  className="rounded-[12px] border border-white/6 bg-[var(--color-surface-elevated)] px-4 py-4"
                >
                  <h2 className="text-[15px] font-semibold text-white">{KEY_LABELS[row.key]}</h2>
                  <textarea
                    name={`body_${row.key}`}
                    defaultValue={row.body}
                    rows={8}
                    className="mt-3 w-full resize-y rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] text-white outline-none focus:border-[#9B68D5]"
                  />
                  {row.updatedAt ? (
                    <p className="mt-2 text-[11px] text-white/40">Last updated {new Date(row.updatedAt).toLocaleString()}</p>
                  ) : null}
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
        </div>
      </div>
    </AdminDashboardShell>
  );
}
