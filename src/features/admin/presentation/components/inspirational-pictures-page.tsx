import Image from "next/image";
import Link from "next/link";
import type { InspirationalPictureRow, InspirationalPicturesViewModel } from "@/features/admin/domain/entities/inspirational-pictures";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import {
  AdminActionMenuBackdrop,
  AdminActionMenuPanel,
  AdminRowMenuIcon,
  AdminSearchIcon,
  AdminStatusBadge,
} from "@/features/admin/presentation/components/shared/admin-table-primitives";
import { buildInspirationalPicturesHref } from "@/features/admin/presentation/state/inspirational-pictures-route-state";

function StatusPill({ status }: { status: InspirationalPictureRow["status"] }) {
  const cls =
    status === "Uploaded"
      ? "border-[#0cbc32]/25 bg-[#0d3215] text-[#0cbc32]"
      : status === "Scheduled"
        ? "border-[#f0c400]/25 bg-[#2f2906] text-[#f0c400]"
        : "border-white/20 bg-[#252525] text-white/70";

  return <AdminStatusBadge label={status} toneClassName={cls} />;
}

function closeHref(viewModel: InspirationalPicturesViewModel) {
  return buildInspirationalPicturesHref({
    status: viewModel.activeStatus,
    screen: viewModel.activeScreen,
    q: viewModel.searchQuery,
  });
}

function ActionMenu({ row, viewModel }: { row: InspirationalPictureRow; viewModel: InspirationalPicturesViewModel }) {
  return (
    <AdminActionMenuPanel className="min-w-[99px] rounded-[10px] border-[#787878] bg-[#292929] shadow-[0_2px_10px_4px_rgba(0,0,0,0.1)]">
      <Link href={buildInspirationalPicturesHref({ status: viewModel.activeStatus, q: viewModel.searchQuery, view: row.id })} className="block border-b border-[#787878] px-2 py-[6px] text-[10px] leading-[1.36] text-white hover:bg-white/[0.04]">
        View
      </Link>
      <Link href={buildInspirationalPicturesHref({ status: viewModel.activeStatus, q: viewModel.searchQuery, edit: row.id })} className="block border-b border-[#787878] px-2 py-[6px] text-[10px] leading-[1.36] text-white hover:bg-white/[0.04]">
        Edit
      </Link>
      <Link href={buildInspirationalPicturesHref({ status: viewModel.activeStatus, q: viewModel.searchQuery, remove: row.id })} className="block px-2 py-[6px] text-[10px] leading-[1.36] text-[#ef4335] hover:bg-white/[0.04]">
        Delete
      </Link>
    </AdminActionMenuPanel>
  );
}

function isBottomActionRow(viewModel: InspirationalPicturesViewModel, row: InspirationalPictureRow | null) {
  if (!row) return false;
  const index = viewModel.rows.findIndex((candidate) => candidate.id === row.id);
  if (index === -1) return false;
  return viewModel.rows.length - index <= 2;
}

function DetailModal({ row, viewModel }: { row: InspirationalPictureRow; viewModel: InspirationalPicturesViewModel }) {
  const detailRows =
    row.status === "Scheduled"
      ? [
          { label: "Scheduled Date", value: row.dateLabel, emphasis: true },
          { label: "Scheduled Time", value: row.scheduledTime ?? "03:00PM", emphasis: true },
          { label: "Source", value: row.source, emphasis: true },
          { label: "Number of downloads", value: String(row.downloadCount), emphasis: true },
          { label: "Number of shares", value: String(row.shareCount), emphasis: true },
        ]
      : [
          { label: "Uploaded By", value: row.uploadedBy, emphasis: true },
          { label: "Upload Date", value: row.dateLabel, emphasis: true },
          { label: "Number of downloads", value: String(row.downloadCount), emphasis: true },
          { label: "Number of shares", value: String(row.shareCount), emphasis: true },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close picture details modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[561px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_2px_10px_4px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <h2 className="text-[28px] font-semibold leading-[1.18] text-white">Picture Details</h2>
          <Link href={closeHref(viewModel)} className="text-[34px] leading-none text-white/90">×</Link>
        </div>
        <div className="overflow-y-auto px-6 pb-7 pt-6">
          <div className="relative h-[297px] overflow-hidden rounded-[16px] bg-[radial-gradient(circle_at_top,#5d3d76_0%,#31213f_38%,#1f1f1f_100%)]">
            <Image src={row.imageSrc} alt={row.title} fill className="object-contain p-10 opacity-90" />
          </div>
          <dl className="mt-8 space-y-0 text-[16px] text-white/90">
            <div className="grid grid-cols-[1fr_auto] items-center gap-x-8 px-6 py-2">
              <dt className="leading-[1.36] text-white/90">Title</dt>
              <dd className="text-right font-semibold leading-[1.36] text-white">{row.title}</dd>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-x-8 px-6 py-2">
              <dt className="leading-[1.36] text-white/90">Category</dt>
              <dd className="text-right font-semibold leading-[1.36] text-white">{row.category}</dd>
            </div>
            {detailRows.map((item) => (
              <div key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-x-8 px-6 py-2">
                <dt className="leading-[1.36] text-white/90">{item.label}</dt>
                <dd className={`text-right leading-[1.36] ${item.emphasis ? "font-semibold text-white" : "text-white/90"}`}>{item.value}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_auto] items-center gap-x-8 px-6 py-2">
              <dt className="leading-[1.36] text-white/90">Status</dt>
              <dd className="text-right"><StatusPill status={row.status} /></dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function EditModal({ row, viewModel }: { row: InspirationalPictureRow; viewModel: InspirationalPicturesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close edit picture modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[561px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_2px_10px_4px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <h2 className="text-[28px] font-semibold leading-[1.18] text-white">Edit Picture</h2>
          <Link href={closeHref(viewModel)} className="text-[34px] leading-none text-white/90">×</Link>
        </div>
        <div className="overflow-y-auto px-6 pb-6 pt-7">
          <div>
            <p className="mb-3 text-[16px] leading-[1.5] text-white/90">Title</p>
            <div className="rounded-[10px] border border-white/10 bg-[#2a2a2a] px-4 py-4 text-[15px] leading-[1.5] text-white">{row.title}</div>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-[16px] leading-[1.5] text-white/90">Category</p>
            <div className="rounded-[10px] border border-white/10 bg-[#2a2a2a] px-4 py-4 text-[15px] leading-[1.5] text-white">{row.category}</div>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-[16px] leading-[1.5] text-white/90">{row.status === "Scheduled" ? "Scheduled Date" : "Upload Date"}</p>
            <div className="rounded-[10px] border border-white/10 bg-[#2a2a2a] px-4 py-4 text-[15px] leading-[1.5] text-white">{row.dateLabel}</div>
          </div>
        </div>
        <div className="flex justify-end gap-4 px-6 pb-6 pt-2">
          <Link href={closeHref(viewModel)} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] font-medium text-[#9B68D5]">Cancel</Link>
          <Link href={buildInspirationalPicturesHref({ status: viewModel.activeStatus, q: viewModel.searchQuery, success: "upload" })} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 py-4 text-[16px] font-medium text-white">Save Changes</Link>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ viewModel }: { viewModel: InspirationalPicturesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close delete picture modal" />
      <div className="relative z-10 w-full max-w-[398px] rounded-[24px] bg-[#1f1f1f] px-8 py-10 text-center shadow-[0_2px_10px_4px_rgba(0,0,0,0.1)]">
        <h2 className="text-[28px] font-semibold leading-[1.18] text-white">Delete This Picture?</h2>
        <p className="mt-5 text-[16px] leading-8 text-white/72">Are you sure you want to delete this picture? This action cannot be undone.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href={closeHref(viewModel)} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] font-medium text-[#9B68D5]">Cancel</Link>
          <Link href={buildInspirationalPicturesHref({ status: viewModel.activeStatus, q: viewModel.searchQuery, success: "upload" })} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 py-4 text-[16px] font-medium text-white">Delete</Link>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ viewModel }: { viewModel: InspirationalPicturesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close upload success modal" />
      <div className="relative z-10 w-full max-w-[398px] rounded-[24px] bg-[#1f1f1f] px-8 py-12 text-center shadow-[0_2px_10px_4px_rgba(0,0,0,0.1)]">
        <div className="mx-auto flex h-[102px] w-[102px] items-center justify-center rounded-full bg-[#9B68D5] text-[62px] text-white">✓</div>
        <p className="mt-10 text-[28px] font-semibold leading-[1.3] text-white">{viewModel.successMessage}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[20px] bg-[#171717] px-8 py-16 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <p className="text-[18px] font-medium text-white/90">No Pictures here Yet</p>
    </div>
  );
}

function UploadScreen() {
  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div className="rounded-[24px] bg-[#171717] px-6 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:px-10 md:py-10">
        <div className="flex items-start justify-between gap-6">
          <h2 className="text-[32px] font-semibold leading-[1.36] text-white">Upload Picture</h2>
          <Link href={buildInspirationalPicturesHref({})} aria-label="Close upload picture screen" className="inline-flex h-6 w-6 items-center justify-center text-[20px] leading-none text-white/90">
            ×
          </Link>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_398px]">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-[14px] leading-[1.36] text-white/90">Picture Source</p>
              <div className="rounded-[10px] border border-white/10 bg-[#242424] px-4 py-4 text-[14px] leading-[1.36] text-white/35">Type here...</div>
            </div>
            <div>
              <p className="mb-3 text-[14px] leading-[1.36] text-white/90">Category</p>
              <div className="rounded-[10px] border border-white/10 bg-[#242424] px-4 py-4 text-[14px] leading-[1.36] text-white/35">Select Category</div>
            </div>
            <div>
              <p className="mb-3 text-[14px] leading-[1.36] text-white/90">Upload Status</p>
              <div className="flex flex-wrap gap-x-7 gap-y-4 text-[14px] leading-[1.36] text-white/90">
                <label className="inline-flex items-center gap-2">
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#9966CC]">
                    <span className="h-[8px] w-[8px] rounded-full bg-[#9966CC]" />
                  </span>
                  Upload now
                </label>
                <label className="inline-flex items-center gap-2">
                  <span className="h-[18px] w-[18px] rounded-full border border-[#9966CC]" />
                  Schedule for later
                </label>
                <label className="inline-flex items-center gap-2">
                  <span className="h-[18px] w-[18px] rounded-full border border-[#9966CC]" />
                  Drafts
                </label>
              </div>
            </div>
          </div>
          <div className="rounded-[16px] border border-dashed border-white/10 bg-[#1f1f1f] p-5">
            <div className="flex h-[250px] items-center justify-center rounded-[12px] border border-dashed border-white/10 bg-[#242424] text-center">
              <div className="max-w-[255px]">
                <p className="text-[14px] leading-[1.5] text-white/90">Drag & drop or choose file here to upload</p>
                <p className="mt-2 text-[12px] leading-[1.4] text-white/40">JPG, PNG, Max size (20mb)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link href={buildInspirationalPicturesHref({ success: "upload" })} className="inline-flex h-[40px] min-w-[106px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 text-[14px] font-medium text-white">
            Upload
          </Link>
        </div>
      </div>
    </div>
  );
}

function PicturesGrid({ viewModel }: { viewModel: InspirationalPicturesViewModel }) {
  const headers =
    viewModel.activeStatus === "Scheduled"
      ? ["S/N", "Thumbnail", "Category", "Scheduled Date", "Scheduled Time", "Source", "Status", "Actions"]
      : ["S/N", "Thumbnail", "Category", "Date Uploaded", "Uploaded By", "Status", "Actions"];

  const tableColumns =
    viewModel.activeStatus === "Scheduled"
      ? "grid-cols-[76px_99px_135px_135px_135px_135px_115px_64px]"
      : "grid-cols-[76px_99px_135px_135px_135px_115px_64px]";

  return (
    <div className="rounded-[20px] bg-[#171717] px-5 pb-10 pt-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-6 border-b border-white/10 px-1 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-5">
          <h2 className="text-[16px] font-normal leading-[1.36] text-white">Inspirational Pictures</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[14px]">
          {viewModel.statusTabs.map((tab) => (
            <Link
              key={tab.key}
              href={buildInspirationalPicturesHref({ status: tab.key, q: viewModel.searchQuery })}
              className={`border-b pb-1 text-[14px] font-normal leading-[1.36] ${tab.key === viewModel.activeStatus ? "border-[#9B68D5] text-white" : "border-transparent text-white/55"}`}
            >
              {tab.label}
            </Link>
          ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[289px]">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45"><AdminSearchIcon /></span>
            <input readOnly value={viewModel.searchQuery} placeholder="Search by Source" className="h-[36px] w-full rounded-[8px] border border-white/10 bg-white/[0.05] pl-9 pr-4 text-[10px] text-white/80 outline-none placeholder:text-white/45" />
          </div>
          <Link href={buildInspirationalPicturesHref({ screen: "upload" })} className="inline-flex h-[40px] min-w-[144px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-5 text-[14px] font-medium text-white">
            Upload Pictures
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className={`${viewModel.activeStatus === "Scheduled" ? "min-w-[940px]" : "min-w-[820px]"}`}>
          <div className={`grid ${tableColumns} items-center rounded-[10px] bg-white/[0.03] px-4 py-[10px] text-[10px] font-semibold leading-[1.36] text-white`}>
            {headers.map((header) => (
              <div key={header} className="flex items-center gap-[2px]">
                <span>{header}</span>
                {header !== "Actions" ? <span className="text-white/70">↕</span> : null}
              </div>
            ))}
          </div>

          <div className="divide-y divide-white/10">
            {viewModel.rows.map((row, index) => (
              <div key={row.id} className={`grid ${tableColumns} items-center px-4 py-3 text-[10px] text-white/90`}>
                <div className="text-[10px] leading-[1.36] text-white/70">{index + 1}</div>
                <div className="flex items-center">
                  <div className="relative h-[50px] w-[67px] overflow-hidden rounded-[8px] bg-[radial-gradient(circle_at_top,#5d3d76_0%,#31213f_38%,#1f1f1f_100%)]">
                    <Image src={row.imageSrc} alt={row.title} fill className="object-contain p-2 opacity-90" />
                  </div>
                </div>
                <div className="truncate text-[10px] leading-[1.36] text-white/80">{row.category}</div>
                {viewModel.activeStatus === "Scheduled" ? (
                  <>
                    <div className="text-[10px] leading-[1.36] text-white/80">{row.dateLabel}</div>
                    <div className="text-[10px] leading-[1.36] text-white/80">{row.scheduledTime ?? "03:00PM"}</div>
                    <div className="truncate text-[10px] leading-[1.36] text-white/80">{row.source}</div>
                    <div><StatusPill status={row.status} /></div>
                  </>
                ) : (
                  <>
                    <div className="text-[10px] leading-[1.36] text-white/80">{row.dateLabel}</div>
                    <div className="truncate text-[10px] leading-[1.36] text-white/80">{row.uploadedBy}</div>
                    <div><StatusPill status={row.status} /></div>
                  </>
                )}
                <div className="relative justify-self-start text-white/82">
                  <Link href={buildInspirationalPicturesHref({ status: viewModel.activeStatus, q: viewModel.searchQuery, menu: row.id })} aria-label={`Open actions for picture ${row.id}`} className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/[0.04]">
                    <span className="scale-90"><AdminRowMenuIcon /></span>
                  </Link>
                  {viewModel.showActionMenu && viewModel.selectedRow?.id === row.id && !isBottomActionRow(viewModel, row) ? (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-50">
                      <ActionMenu row={row} viewModel={viewModel} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between text-[12px] text-white/45">
        <span>{viewModel.showingLabel}</span>
        <div className="flex gap-3">
          <button type="button" className="h-[35px] min-w-[75px] rounded-[8px] border border-white/20 px-3 py-2 text-[14px] text-white/45">Previous</button>
          <button type="button" className="h-[35px] min-w-[59px] rounded-[8px] border border-[#9B68D5] px-3 py-2 text-[14px] text-[#9B68D5]">Next</button>
        </div>
      </div>
    </div>
  );
}

export function InspirationalPicturesPage({ viewModel }: { viewModel: InspirationalPicturesViewModel }) {
  const selectedRow = viewModel.selectedRow;
  const showDetachedActionMenu = viewModel.showActionMenu && isBottomActionRow(viewModel, selectedRow);

  return (
    <AdminDashboardShell viewModel={viewModel.shell} pageTitle={viewModel.activeScreen === "upload" ? undefined : "Inspirational Pictures"}>
      {viewModel.activeScreen === "upload" ? <UploadScreen /> : null}
      {viewModel.activeScreen === "list" && viewModel.phaseState === "empty" ? <EmptyState /> : null}
      {viewModel.activeScreen === "list" && viewModel.phaseState === "loading" ? <div className="rounded-[20px] bg-[#171717] px-8 py-16 text-center text-white/70">Loading pictures...</div> : null}
      {viewModel.activeScreen === "list" && viewModel.phaseState === "error" ? <div className="rounded-[20px] bg-[#171717] px-8 py-16 text-center text-white/70">{viewModel.errorMessage}</div> : null}
      {viewModel.activeScreen === "list" && viewModel.phaseState === "populated" ? (
        <div className="relative">
          <PicturesGrid viewModel={viewModel} />
          {showDetachedActionMenu && selectedRow ? (
            <div className="fixed bottom-24 right-8 z-50 sm:right-10">
              <ActionMenu row={selectedRow} viewModel={viewModel} />
            </div>
          ) : null}
        </div>
      ) : null}

      {viewModel.showDetails && selectedRow ? <DetailModal row={selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showEditModal && selectedRow ? <EditModal row={selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showDeleteModal ? <DeleteModal viewModel={viewModel} /> : null}
      {viewModel.showSuccess && viewModel.successMessage ? <SuccessModal viewModel={viewModel} /> : null}
      {viewModel.showActionMenu ? (
        <AdminActionMenuBackdrop
          href={buildInspirationalPicturesHref({ status: viewModel.activeStatus, screen: viewModel.activeScreen, q: viewModel.searchQuery })}
          label="Close inspirational pictures action menu"
        />
      ) : null}
    </AdminDashboardShell>
  );
}
