import Link from "next/link";
import type { TestimoniesViewModel } from "@/features/admin/domain/entities/testimonies";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { TestimoniesOverlays } from "@/features/admin/presentation/components/testimonies/testimonies-overlays";
import { TestimoniesTable } from "@/features/admin/presentation/components/testimonies/testimonies-table";
import { buildTestimoniesHref } from "@/features/admin/presentation/state/testimonies-route-state";

const pageCardClass =
  "rounded-[20px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]";
const fieldClass =
  "rounded-[10px] bg-[var(--color-surface-panel)] px-4 py-4 text-[15px] text-[var(--color-text-secondary)]";
const subtleButtonClass =
  "inline-flex min-h-[52px] items-center justify-center rounded-[12px] border border-[var(--color-primary)] px-5 text-[14px] text-[var(--color-primary)]";
const filledButtonClass =
  "inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[var(--color-primary)] px-5 text-[14px] font-medium text-[var(--color-text-primary)]";
const sectionLabelClass = "mb-3 text-[16px] font-medium text-[var(--color-text-primary)]";
const pageTitleClass = "text-[28px] font-semibold leading-[1.2] text-[var(--color-text-primary)] md:text-[32px]";

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M10.5 3 5.5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadCloudIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 15.5V8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.75 11.75 12 8.5l3.25 3.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadVideoScreen() {
  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className={pageTitleClass}>Upload Video Testimonies</h2>
        </div>
        <button type="button" className="inline-flex h-[44px] w-fit min-w-[96px] items-center justify-center rounded-[10px] bg-white/55 px-6 text-[14px] text-[var(--color-text-primary)] md:self-start">
          Upload
        </button>
      </div>

      <div className="mt-10 md:mt-12">
        <p className={sectionLabelClass}>Upload Mode</p>
        <div className="inline-flex h-[40px] min-w-[170px] items-center justify-between rounded-[10px] bg-[var(--color-surface-panel)] px-4 text-[14px] text-[var(--color-text-primary)]">
          <span>Single Video Upload</span>
          <span className="text-[var(--color-text-secondary)]">▾</span>
        </div>
      </div>

      <div className={`${pageCardClass} mt-8 px-6 py-7 md:mt-10 md:px-7 md:py-8`}>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_496px] xl:gap-10">
          <div>
            <h3 className="text-[20px] font-semibold text-[var(--color-text-primary)]">Video 1</h3>
            <div className="mt-7 space-y-6">
              <div>
                <p className={sectionLabelClass}>Title</p>
                <div className={fieldClass}>Enter Video Title</div>
              </div>
              <div>
                <p className={sectionLabelClass}>Source</p>
                <div className={fieldClass}>Enter Video Source</div>
              </div>
              <div>
                <p className={sectionLabelClass}>Category</p>
                <div className="flex items-center justify-between rounded-[10px] bg-[var(--color-surface-panel)] px-4 py-4 text-[15px] text-[var(--color-text-secondary)]">
                  <span>Select Category</span>
                  <span className="text-[var(--color-text-secondary)]">▾</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex h-[250px] items-center justify-center rounded-[18px] border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] text-center">
              <div className="flex max-w-[260px] flex-col items-center">
                <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                  <UploadCloudIcon />
                </div>
                <p className="mt-5 text-[18px] leading-[1.45] text-[var(--color-text-secondary)]">
                  Drag & drop or <span className="text-[var(--color-primary)]">choose file</span> here to upload
                </p>
                <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">MP4, Max size(200mb)</p>
              </div>
            </div>

            <div className="mt-8">
              <p className={sectionLabelClass}>Thumbnail</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-4 text-[15px] text-[var(--color-text-secondary)]">
                <label className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-full border border-[var(--color-primary)]" />Custom Upload</label>
                <label className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-full border border-[var(--color-primary)]" />Auto Generate</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${pageCardClass} mt-8 px-6 py-6 md:px-7 md:py-7`}>
        <p className={sectionLabelClass}>Upload Status</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-4 text-[15px] text-[var(--color-text-secondary)]">
          <label className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-full border border-[var(--color-primary)]" />Upload Now</label>
          <label className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-full border border-[var(--color-primary)]" />Schedule for later</label>
          <label className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-full border border-[var(--color-primary)]" />Drafts</label>
        </div>
      </div>
    </div>
  );
}

function ActivityLogScreen() {
  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <Link href={buildTestimoniesHref({ tab: "video" })} className="text-[var(--color-text-primary)]">
            <ChevronLeftIcon />
          </Link>
          <h2 className="text-[22px] font-semibold leading-[1.25] text-[var(--color-text-primary)] md:text-[28px]">Activity Log for Text Testimonies</h2>
        </div>
        <Link href={buildTestimoniesHref({ tab: "video", screen: "activity" })} className={`${subtleButtonClass} w-fit`}>
          Export as CSV File
        </Link>
      </div>

      <div className={`${pageCardClass} mt-8 overflow-hidden md:mt-10`}>
        <div className="px-5 py-6 text-[18px] font-medium text-[var(--color-text-primary)]">Activity Log</div>
        <div className="flex flex-col gap-3 px-5 pb-5 md:flex-row md:items-center md:justify-end">
          <div className="h-[36px] w-full rounded-[8px] bg-[var(--color-surface-panel)] px-4 py-2 text-[12px] text-[var(--color-text-muted)] md:w-[290px]">Search by name</div>
          <div className="inline-flex h-[36px] min-w-[78px] items-center justify-center rounded-[8px] border border-[var(--color-primary)] px-4 text-[14px] text-[var(--color-primary)]">Filter</div>
        </div>
        <div className="grid grid-cols-[70px_1.2fr_1.15fr_1fr_0.9fr] bg-[var(--color-surface-muted)] px-4 py-[11px] text-[10px] font-medium text-[var(--color-text-secondary)]">
          <span>S/N</span>
          <span>Admin Name</span>
          <span>Timestamp</span>
          <span>Testimony</span>
          <span>Action</span>
        </div>
        {[1, 2, 3, 4].map((id) => (
          <div key={id} className="grid grid-cols-[70px_1.2fr_1.15fr_1fr_0.9fr] border-t border-white/10 px-4 py-4 text-[14px] text-[var(--color-text-secondary)]">
            <span>{id}</span>
            <div>
              <p>Ore Ore</p>
              <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">{id === 2 ? "Content Manager" : "Super Admin"}</p>
            </div>
            <span>08/08/2024, 2:30:00 PM</span>
            <div>
              <p>God Is Good</p>
              <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">TEXT-001</p>
            </div>
            <span>{id === 2 ? "Rejected" : id === 3 ? "Deleted" : "Approved"}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-10 text-[12px] text-[var(--color-text-muted)]">
          <span>Showing 1-4 of 4</span>
          <div className="flex gap-3">
            <button type="button" className="rounded-[8px] border border-white/20 px-4 py-2 text-white/45">Previous</button>
            <button type="button" className="rounded-[8px] border border-[var(--color-primary)] px-5 py-2 text-[var(--color-primary)]">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimoniesPage({ viewModel }: { viewModel: TestimoniesViewModel }) {
  const showsDedicatedVideoHeading = viewModel.activeTab === "video" && viewModel.activeVideoScreen !== "list";

  return (
    <AdminDashboardShell viewModel={viewModel.shell} pageTitle={showsDedicatedVideoHeading ? undefined : "Testimonies"}>
      {viewModel.activeTab === "video" && viewModel.activeVideoScreen === "upload" ? <UploadVideoScreen /> : null}
      {viewModel.activeTab === "video" && viewModel.activeVideoScreen === "activity" ? <ActivityLogScreen /> : null}
      {!(viewModel.activeTab === "video" && viewModel.activeVideoScreen !== "list") ? <TestimoniesTable viewModel={viewModel} /> : null}
      <TestimoniesOverlays viewModel={viewModel} />
    </AdminDashboardShell>
  );
}
