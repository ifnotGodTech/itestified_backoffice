import Image from "next/image";
import Link from "next/link";
import type { HomeManagementRow, HomeManagementViewModel } from "@/features/admin/domain/entities/home-management";
import { buildHomeManagementHref } from "@/features/admin/presentation/state/home-management-route-state";

function ThumbnailCell({ row }: { row: HomeManagementRow }) {
  if (row.kind === "picture") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-14 flex-col items-center justify-center overflow-hidden rounded-[8px] bg-[#e4d0b8] px-1 text-center leading-none shadow-[inset_0_0_0_1px_rgba(154,103,71,0.15)]">
          <span className="text-[10px] font-black tracking-[-0.04em] text-[#9a6747]">Deeply</span>
          <span className="mt-[1px] text-[8px] font-black text-white">Loved</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="relative h-8 w-8 overflow-hidden rounded bg-[#2b2b2b]">
        {row.thumbnailSrc ? <Image src={row.thumbnailSrc} alt={row.thumbnailLabel} fill className="object-cover opacity-80" /> : null}
      </span>
    </div>
  );
}

function tableTitleForTab(activeTab: HomeManagementViewModel["activeTab"]) {
  return activeTab === "pictures" ? "Available Pictures" : "Available Testimonies";
}

function HomeManagementTableLoading({ pictureMode }: { pictureMode: boolean }) {
  const gridClass = pictureMode
    ? "grid grid-cols-[64px_72px_1.3fr_1fr_1fr_1.2fr_0.9fr_0.8fr_54px]"
    : "grid grid-cols-[64px_72px_1.1fr_0.85fr_0.8fr_0.95fr_1fr_0.6fr_0.6fr_0.9fr_0.7fr_54px]";
  const cellCount = pictureMode ? 9 : 12;

  return (
    <div className="space-y-3 px-3 py-4">
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <div key={rowIndex} className={`${gridClass} items-center gap-0`}>
          {Array.from({ length: cellCount }).map((__, cellIndex) => (
            <span key={`${rowIndex}-${cellIndex}`} className="mx-2 h-6 animate-pulse rounded bg-white/8" />
          ))}
        </div>
      ))}
    </div>
  );
}

function HomeManagementTableEmpty({ activeTab }: { activeTab: HomeManagementViewModel["activeTab"] }) {
  const label = activeTab === "pictures" ? "pictures" : "testimonies";

  return (
    <div className="px-8 py-16 text-center">
      <div className="mx-auto max-w-[420px] space-y-3">
        <h3 className="text-[22px] font-semibold text-white">No featured {label} yet</h3>
        <p className="text-[16px] leading-7 text-white/65">
          There is no homepage content to show for this section yet. Once content is approved or promoted, it will appear here.
        </p>
      </div>
    </div>
  );
}

function HomeManagementTableError({ message }: { message?: string }) {
  return (
    <div className="px-8 py-14">
      <div className="rounded-[18px] border border-[#ef4335]/30 bg-[#2a1615] px-6 py-6">
        <h3 className="text-[20px] font-semibold text-white">Unable to load home page content</h3>
        <p className="mt-3 max-w-[520px] text-[15px] leading-7 text-white/70">
          {message ?? "An unexpected error occurred while loading this section."}
        </p>
      </div>
    </div>
  );
}

function HomeManagementPictureTable({ viewModel }: { viewModel: HomeManagementViewModel }) {
  return (
    <>
      <div className="grid grid-cols-[64px_72px_1.3fr_1fr_1fr_1.2fr_0.9fr_0.8fr_54px] bg-[#2a2a2a] px-3 py-[9px] text-[10px] font-medium text-white/70">
        <span>S/N</span>
        <span>Thumbnail</span>
        <span>Title</span>
        <span>Source</span>
        <span>Date Uploaded</span>
        <span>Uploaded By</span>
        <span>Downloads</span>
        <span>Shares</span>
        <span>Action</span>
      </div>
      {viewModel.rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[64px_72px_1.3fr_1fr_1fr_1.2fr_0.9fr_0.8fr_54px] items-center border-t border-white/10 px-3 py-[9px] text-[12px] text-white/85"
        >
          <span>{row.id}</span>
          <ThumbnailCell row={row} />
          <span>{row.title}</span>
          <span>{row.source}</span>
          <span>{row.dateUploaded}</span>
          <span>{row.uploadedBy}</span>
          <span>{row.downloads ?? 0}</span>
          <span>{row.shares}</span>
          <div className="text-right text-[18px]">
            <Link href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount, menuId: row.id })}>⋯</Link>
          </div>
        </div>
      ))}
    </>
  );
}

function HomeManagementTestimonyTable({ viewModel }: { viewModel: HomeManagementViewModel }) {
  return (
    <>
      <div className="grid grid-cols-[64px_72px_1.1fr_0.85fr_0.8fr_0.95fr_1fr_0.6fr_0.6fr_0.9fr_0.7fr_54px] bg-[#2a2a2a] px-3 py-[9px] text-[10px] font-medium text-white/70">
        <span>S/N</span>
        <span>Thumbnail</span>
        <span>Title</span>
        <span>Category</span>
        <span>Source</span>
        <span>Date Uploaded</span>
        <span>Uploaded By</span>
        <span>Views</span>
        <span>Likes</span>
        <span>Comments</span>
        <span>Shares</span>
        <span>Action</span>
      </div>
      {viewModel.rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[64px_72px_1.1fr_0.85fr_0.8fr_0.95fr_1fr_0.6fr_0.6fr_0.9fr_0.7fr_54px] items-center border-t border-white/10 px-3 py-[9px] text-[12px] text-white/85"
        >
          <span>{row.id}</span>
          <ThumbnailCell row={row} />
          <span>{row.title}</span>
          <span>{row.category}</span>
          <span>{row.source}</span>
          <span>{row.dateUploaded}</span>
          <span>{row.uploadedBy}</span>
          <span>{row.views}</span>
          <span>{row.likes}</span>
          <span>{row.comments}</span>
          <span>{row.shares}</span>
          <div className="text-right text-[18px]">
            <Link href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount, menuId: row.id })}>⋯</Link>
          </div>
        </div>
      ))}
    </>
  );
}

export function HomeManagementContentTable({ viewModel }: { viewModel: HomeManagementViewModel }) {
  const pictureMode = viewModel.activeTab === "pictures";
  const showTableData = viewModel.phaseState === "populated";

  return (
    <div className="overflow-hidden rounded-[18px] bg-[#171717]">
      <div className="px-4 pb-3 pt-4 text-[16px] font-medium text-white/90">{tableTitleForTab(viewModel.activeTab)}</div>
      <div className="border-t border-white/5">
        {viewModel.phaseState === "loading" ? <HomeManagementTableLoading pictureMode={pictureMode} /> : null}
        {viewModel.phaseState === "empty" ? <HomeManagementTableEmpty activeTab={viewModel.activeTab} /> : null}
        {viewModel.phaseState === "error" ? <HomeManagementTableError message={viewModel.errorMessage} /> : null}
        {showTableData && pictureMode ? <HomeManagementPictureTable viewModel={viewModel} /> : null}
        {showTableData && !pictureMode ? <HomeManagementTestimonyTable viewModel={viewModel} /> : null}
      </div>
    </div>
  );
}
