import Image from "next/image";
import Link from "next/link";
import type { HomeManagementRow, HomeManagementViewModel } from "@/features/admin/domain/entities/home-management";
import { buildHomeManagementHref } from "@/features/admin/presentation/state/home-management-route-state";

const TEST_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function HomeManagementVideoModal({ row, viewModel }: { row: HomeManagementRow; viewModel: HomeManagementViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount })} className="absolute inset-0" aria-label="Close details modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-[460px] flex-col overflow-hidden rounded-[28px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:max-h-[calc(100vh-4rem)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#1e1e1e] px-6 py-5">
          <h2 className="text-[24px] font-semibold text-white">Video Details</h2>
          <Link href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount })} className="text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>

        <div className="overflow-y-auto px-6 pb-8 pt-5">
          <div className="overflow-hidden rounded-[18px] bg-[#131313]">
            <div className="relative bg-[#0e1722]">
              <video className="block aspect-video w-full bg-black object-cover" controls preload="metadata" poster={row.thumbnailSrc}>
                <source src={TEST_VIDEO_URL} type="video/mp4" />
                Your browser does not support HTML video.
              </video>
            </div>
          </div>
          <dl className="mt-8 grid grid-cols-[1fr_auto] gap-x-8 gap-y-4 text-[16px] text-white/90">
            <dt className="text-white/75">Title</dt>
            <dd className="font-semibold text-right">God Healed Me</dd>
            <dt className="text-white/75">Category</dt>
            <dd className="font-semibold text-right">{row.category}</dd>
            <dt className="text-white/75">Source</dt>
            <dd className="font-semibold text-right">Youtube</dd>
            <dt className="text-white/75">Upload Date</dt>
            <dd className="font-semibold text-right">08/08/24</dd>
            <dt className="text-white/75">Uploaded By</dt>
            <dd className="font-semibold text-right">{row.uploadedBy}</dd>
            <dt className="text-white/75">Number of Views</dt>
            <dd className="font-semibold text-right">0</dd>
            <dt className="text-white/75">Number of Likes</dt>
            <dd className="font-semibold text-right">0</dd>
            <dt className="text-white/75">Number of Comment</dt>
            <dd className="font-semibold text-right">0</dd>
            <dt className="text-white/75">Number of Shares</dt>
            <dd className="font-semibold text-right">0</dd>
            <dt className="text-white/75">Status</dt>
            <dd className="text-right">
              <span className="rounded-full border border-[#0cbc32]/20 bg-[#0d3215] px-3 py-1 text-xs font-medium text-[#0cbc32]">Uploaded</span>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function HomeManagementTextModal({ row, viewModel }: { row: HomeManagementRow; viewModel: HomeManagementViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount })} className="absolute inset-0" aria-label="Close text details modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:max-h-[calc(100vh-4rem)]">
        <div className="sticky top-0 z-10 flex min-h-[78px] items-start justify-end bg-[#262626] px-6 py-4">
          <Link href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount })} className="text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <div className="overflow-y-auto px-6 pb-8">
          <div className="relative -mt-14 flex justify-center">
            <div className="relative h-[98px] w-[98px] overflow-hidden rounded-full border-[6px] border-[#1e1e1e] bg-white p-3">
              {row.thumbnailSrc ? <Image src={row.thumbnailSrc} alt={row.submitterName ?? row.uploadedBy} fill className="object-contain p-3" /> : null}
            </div>
          </div>
          <div className="mx-auto mt-7 w-full max-w-[516px] rounded-[18px] border border-white/10 bg-[#1b1b1b] px-3 py-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <dl className="grid grid-cols-[1fr_1.45fr_0.82fr] divide-x divide-white/15 text-center">
              <div className="flex min-h-[58px] flex-col items-center justify-center gap-[3px] px-4">
                <dt className="text-[12px] leading-none text-white/45">Name</dt>
                <dd className="text-[16px] leading-[1.2] font-medium text-white">{row.submitterName ?? row.uploadedBy}</dd>
              </div>
              <div className="flex min-h-[58px] flex-col items-center justify-center gap-[3px] px-4">
                <dt className="text-[12px] leading-none text-white/45">Email</dt>
                <dd className="text-[16px] leading-[1.2] font-medium text-white">{row.submitterEmail ?? "admin@testified.com"}</dd>
              </div>
              <div className="flex min-h-[58px] flex-col items-center justify-center gap-[5px] px-4">
                <dt className="text-[12px] leading-none text-white/45">Status</dt>
                <dd>
                  <span className="inline-flex rounded-full border border-[#0cbc32]/25 bg-[#0d3215] px-[12px] py-[4px] text-[11px] leading-none font-medium text-[#0cbc32]">
                    Success
                  </span>
                </dd>
              </div>
            </dl>
          </div>
          <div className="mt-8">
            <h2 className="text-[18px] font-semibold text-white">{row.title}</h2>
            <p className="mt-4 text-[17px] leading-[1.55] text-white/82">{row.body}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PictureDetailArt() {
  return (
    <div className="flex aspect-[1.74] w-full items-center justify-center rounded-[18px] bg-[#e4d0b8] text-center">
      <div className="space-y-1 text-[#9a6747]">
        <div className="text-[64px] font-black leading-none tracking-[-0.04em]">Deeply</div>
        <div className="text-[46px] font-black leading-none text-white">Loved</div>
        <div className="pl-36 text-[30px] font-black leading-none">by Jesus</div>
      </div>
    </div>
  );
}

function HomeManagementPictureModal({ row, viewModel }: { row: HomeManagementRow; viewModel: HomeManagementViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount })} className="absolute inset-0" aria-label="Close picture details modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:max-h-[calc(100vh-4rem)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#1e1e1e] px-6 py-5">
          <h2 className="text-[24px] font-semibold text-white">Picture Details</h2>
          <Link href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount })} className="text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <div className="overflow-y-auto px-6 pb-8 pt-5">
          <PictureDetailArt />
          <dl className="mt-8 grid grid-cols-[1fr_auto] gap-x-8 gap-y-4 text-[16px] text-white/90">
            <dt className="text-white/75">Uploaded By</dt>
            <dd className="font-semibold text-right">{row.uploadedBy}</dd>
            <dt className="text-white/75">Upload Date</dt>
            <dd className="font-semibold text-right">08/08/24</dd>
            <dt className="text-white/75">Source</dt>
            <dd className="font-semibold text-right">{row.source}</dd>
            <dt className="text-white/75">Number of downloads</dt>
            <dd className="font-semibold text-right">{row.downloads ?? 0}</dd>
            <dt className="text-white/75">Number of shares</dt>
            <dd className="font-semibold text-right">{row.shares}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function HomeManagementRemoveModal({ viewModel }: { viewModel: HomeManagementViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <div className="relative w-full max-w-[600px] rounded-[22px] bg-[#1f1f1f] px-8 pb-8 pt-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <Link href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount })} className="absolute right-6 top-4 text-[34px] leading-none text-white/90">
          ×
        </Link>
        <h2 className="text-[24px] font-semibold text-white">Remove from Home Page?</h2>
        <p className="mx-auto mt-6 max-w-[470px] text-[18px] leading-9 text-white/75">
          This will remove the testimony from the homepage lineup. It will still be available in the testimonies section and users can view it.
          <br />
          Are you sure you want to proceed?
        </p>
        <div className="mt-10 flex justify-center gap-6">
          <Link
            href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount })}
            className="inline-flex min-w-[180px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[18px] text-[#9B68D5]"
          >
            Cancel
          </Link>
          <Link
            href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount, success: "remove" })}
            className="inline-flex min-w-[180px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 py-4 text-[18px] text-white"
          >
            Yes, remove
          </Link>
        </div>
      </div>
    </div>
  );
}

function HomeManagementSuccessModal({ viewModel }: { viewModel: HomeManagementViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <Link href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount })} className="absolute inset-0" aria-label="Close success modal" />
      <div className="relative z-10 w-full max-w-[420px] rounded-[24px] bg-[#1f1f1f] px-8 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="mx-auto flex h-[132px] w-[132px] items-center justify-center rounded-full bg-[#9B68D5] text-[78px] text-white">✓</div>
        <p className="mt-12 text-[30px] font-semibold leading-[1.3] text-white">Testimony Removed Successfully!</p>
      </div>
    </div>
  );
}

function HomeManagementActionMenu({ row, viewModel }: { row: HomeManagementRow; viewModel: HomeManagementViewModel }) {
  return (
    <div className="fixed inset-0 z-40">
      <Link href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount })} className="absolute inset-0" aria-label="Close action menu" />
      <div className="absolute bottom-8 right-8 z-50 min-w-[102px] overflow-hidden rounded-[12px] border border-[#5b5b5b] bg-[#242424] shadow-[0_14px_24px_rgba(0,0,0,0.35)]">
        <Link
          href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount, viewId: row.id })}
          className="block border-b border-white/10 px-5 py-2 text-[14px] text-white/90 hover:bg-white/[0.04]"
        >
          View
        </Link>
        <Link
          href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount, removeId: row.id })}
          className="block px-5 py-2 text-[14px] text-[#ef4335] hover:bg-white/[0.04]"
        >
          Remove
        </Link>
      </div>
    </div>
  );
}

export function HomeManagementOverlays({ viewModel }: { viewModel: HomeManagementViewModel }) {
  return (
    <>
      {viewModel.showActionMenu && viewModel.selectedRow ? <HomeManagementActionMenu row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showDetails && viewModel.selectedRow?.kind === "picture" ? <HomeManagementPictureModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showDetails && viewModel.selectedRow?.kind === "text" ? <HomeManagementTextModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showDetails && viewModel.selectedRow?.kind === "video" ? <HomeManagementVideoModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showRemoveConfirm && viewModel.selectedRow ? <HomeManagementRemoveModal viewModel={viewModel} /> : null}
      {viewModel.showSuccess ? <HomeManagementSuccessModal viewModel={viewModel} /> : null}
    </>
  );
}
