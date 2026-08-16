"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  HomePromoCtaDestination,
  HomePromoRow,
  HomePromoStatusFilter,
  HomePromosViewModel,
} from "@/features/admin/domain/entities/home-promos";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminErrorState, AdminPaginationFooter, AdminSearchIcon } from "@/features/admin/presentation/components/shared/admin-table-primitives";
import { buildHomePromosHref } from "@/features/admin/presentation/state/home-promos-route-state";

type DirectUploadSignature = {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  folder: string;
  signature: string;
};

function extractApiErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "Something went wrong. Please try again.";
  const record = data as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) return record.message;
  for (const value of Object.values(record)) {
    if (typeof value === "string" && value.trim()) return value;
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === "string" && item.trim());
      if (typeof first === "string") return first;
    }
  }
  return "Something went wrong. Please try again.";
}

async function requestPromoUploadSignature(): Promise<DirectUploadSignature> {
  const response = await fetch("/api/admin/content/home-promos/upload-signature", { method: "POST" });
  const data = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) throw new Error(extractApiErrorMessage(data));
  return data as DirectUploadSignature;
}

async function uploadPromoImageToCloudinary(file: File): Promise<string> {
  const signature = await requestPromoUploadSignature();
  const uploadFormData = new FormData();
  uploadFormData.set("file", file);
  uploadFormData.set("api_key", signature.api_key);
  uploadFormData.set("timestamp", String(signature.timestamp));
  uploadFormData.set("folder", signature.folder);
  uploadFormData.set("signature", signature.signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`, {
    method: "POST",
    body: uploadFormData,
  });
  const data = (await response.json().catch(() => null)) as { secure_url?: string; error?: { message?: string } } | null;
  if (!response.ok) {
    throw new Error(data?.error?.message || `Cloudinary upload failed (${response.status}).`);
  }
  if (!data?.secure_url) throw new Error("Cloudinary did not return an uploaded file URL.");
  return data.secure_url;
}

function toDatetimeLocalValue(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function StatusPill({ status }: { status: HomePromoRow["status"] }) {
  const cls =
    status === "active"
      ? "border-[#0cbc32]/25 bg-[#0d3215] text-[#0cbc32]"
      : status === "scheduled"
        ? "border-[#f0c400]/25 bg-[#2f2906] text-[#f0c400]"
        : "border-white/20 bg-[var(--color-surface-muted)] text-white/70";
  const label = status === "active" ? "Active" : status === "scheduled" ? "Scheduled" : status === "ended" ? "Ended" : "Inactive";
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${cls}`}>{label}</span>;
}

function PromoForm({
  editingRow,
  onSaved,
  onCancelEdit,
}: {
  editingRow: HomePromoRow | null;
  onSaved: (kind: "create" | "update") => void;
  onCancelEdit: () => void;
}) {
  const [title, setTitle] = useState(editingRow?.title ?? "");
  const [body, setBody] = useState(editingRow?.body ?? "");
  const [ctaLabel, setCtaLabel] = useState(editingRow?.ctaLabel ?? "");
  const [ctaDestination, setCtaDestination] = useState<HomePromoCtaDestination>(editingRow?.ctaDestination ?? "");
  const [ctaUrl, setCtaUrl] = useState(editingRow?.ctaUrl ?? "");
  const [startsAt, setStartsAt] = useState(toDatetimeLocalValue(editingRow?.startsAt ?? ""));
  const [endsAt, setEndsAt] = useState(toDatetimeLocalValue(editingRow?.endsAt ?? ""));
  const [isActive, setIsActive] = useState(editingRow?.isActive ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState(editingRow?.imageUrl ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("error");

  useEffect(() => {
    setTitle(editingRow?.title ?? "");
    setBody(editingRow?.body ?? "");
    setCtaLabel(editingRow?.ctaLabel ?? "");
    setCtaDestination(editingRow?.ctaDestination ?? "");
    setCtaUrl(editingRow?.ctaUrl ?? "");
    setStartsAt(toDatetimeLocalValue(editingRow?.startsAt ?? ""));
    setEndsAt(toDatetimeLocalValue(editingRow?.endsAt ?? ""));
    setIsActive(editingRow?.isActive ?? true);
    setImageFile(null);
    setExistingImageUrl(editingRow?.imageUrl ?? "");
    setMessage(null);
  }, [editingRow]);

  const previewImageUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : existingImageUrl), [imageFile, existingImageUrl]);

  async function submit() {
    if (!title.trim() || !body.trim()) {
      setMessageTone("error");
      setMessage("Title and body are required.");
      return;
    }
    if ((ctaLabel && !ctaDestination) || (!ctaLabel && ctaDestination)) {
      setMessageTone("error");
      setMessage("A CTA needs both a label and a destination, or neither.");
      return;
    }
    if (ctaDestination === "external_url" && !ctaUrl.trim()) {
      setMessageTone("error");
      setMessage("CTA URL is required when the destination is an external URL.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const imageUrl = imageFile ? await uploadPromoImageToCloudinary(imageFile) : existingImageUrl;
      const payload = {
        title: title.trim(),
        body: body.trim(),
        image_url: imageUrl,
        cta_label: ctaLabel.trim(),
        cta_destination: ctaDestination,
        cta_url: ctaDestination === "external_url" ? ctaUrl.trim() : "",
        starts_at: startsAt ? new Date(startsAt).toISOString() : undefined,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        is_active: isActive,
      };
      const response = await fetch(
        editingRow ? `/api/admin/content/home-promos/${editingRow.id}` : "/api/admin/content/home-promos",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as unknown;
        throw new Error(extractApiErrorMessage(data));
      }
      onSaved(editingRow ? "update" : "create");
    } catch (error) {
      setSubmitting(false);
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <div className="mt-6 rounded-[20px] bg-[var(--color-surface-elevated)] px-6 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[18px] font-semibold text-white">{editingRow ? "Edit Promo Card" : "New Promo Card"}</h2>
        {editingRow ? (
          <button type="button" onClick={onCancelEdit} className="text-[13px] text-[#c590ff] underline-offset-2 hover:underline">
            Cancel edit
          </button>
        ) : null}
      </div>

      {message ? <p className={`mt-4 text-[13px] ${messageTone === "error" ? "text-[#ef4335]" : "text-[#6BFFB4]"}`}>{message}</p> : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-[13px] text-white/80">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Someone's breakthrough is waiting on yours"
              className="w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-[#9B68D5]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-white/80">Body</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={3}
              placeholder="Every gift keeps testimonies like these free to read, share, and film."
              className="w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-[#9B68D5]"
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[13px] text-white/80">CTA label (optional)</span>
              <input
                value={ctaLabel}
                onChange={(event) => setCtaLabel(event.target.value)}
                placeholder="Give Today"
                className="w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-[#9B68D5]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] text-white/80">CTA destination</span>
              <select
                value={ctaDestination}
                onChange={(event) => setCtaDestination(event.target.value as HomePromoCtaDestination)}
                className="w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
              >
                <option value="">No CTA</option>
                <option value="giving">Giving screen</option>
                <option value="submit_testimony">Submit a testimony</option>
                <option value="external_url">External URL</option>
              </select>
            </label>
          </div>
          {ctaDestination === "external_url" ? (
            <label className="block">
              <span className="mb-2 block text-[13px] text-white/80">CTA URL</span>
              <input
                value={ctaUrl}
                onChange={(event) => setCtaUrl(event.target.value)}
                placeholder="https://itestified.app/events/convention"
                className="w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-[#9B68D5]"
              />
            </label>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[13px] text-white/80">Starts</span>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                className="w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-3 text-[13px] text-white/85 outline-none focus:border-[#9B68D5]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] text-white/80">Ends (optional)</span>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
                className="w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-3 text-[13px] text-white/85 outline-none focus:border-[#9B68D5]"
              />
            </label>
          </div>
          <div className="flex items-center justify-between rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-3">
            <div>
              <p className="text-[13px] text-white">Active</p>
              <p className="text-[11px] text-white/50">On, and inside its date window — eligible to appear in the feed</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((value) => !value)}
              className={`h-[22px] w-[38px] rounded-full transition-colors ${isActive ? "bg-[#9B68D5]" : "bg-white/15"}`}
            >
              <span className={`block h-[18px] w-[18px] rounded-full bg-white transition-transform ${isActive ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
            </button>
          </div>
          <label className="block">
            <span className="mb-2 block text-[13px] text-white/80">Image (optional)</span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              className="block w-full text-[12px] text-white/85"
            />
          </label>
        </div>

        <div className="rounded-[16px] border border-dashed border-white/10 bg-[var(--color-surface-muted)] p-4">
          <p className="mb-3 text-center text-[11px] text-white/50">Live preview</p>
          <div className="relative h-[176px] overflow-hidden rounded-[14px]">
            <div
              className="absolute inset-0"
              style={{
                background: previewImageUrl
                  ? `linear-gradient(to bottom, transparent, rgba(0,0,0,0.85)), url(${previewImageUrl}) center/cover`
                  : "radial-gradient(120% 100% at 20% -10%, rgba(255,159,74,0.32), transparent 50%), linear-gradient(155deg, #3a2a1c 0%, #241a26 45%, #14101f 100%)",
              }}
            />
            <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#ff9f4a]/60 bg-black/40 px-2 py-1">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-[#ff9f4a]" />
              <span className="text-[8px] font-bold tracking-wide text-[#ffe0c2]">FROM ITESTIFIED</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-[13px] italic text-white" style={{ fontFamily: "Georgia, serif" }}>
                {title.trim() || "Your title here"}
              </p>
              {ctaLabel ? (
                <span className="mt-2 inline-flex items-center rounded-[7px] bg-[#ff9f4a] px-2.5 py-1 text-[10px] font-bold text-[#1a0e02]">
                  {ctaLabel} →
                </span>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-center text-[10px] text-white/40">Exactly how it renders in the feed — no image required.</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="inline-flex h-[40px] min-w-[140px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Saving..." : editingRow ? "Save Changes" : "Create Promo Card"}
        </button>
      </div>
    </div>
  );
}

function loadingViewModel(viewModel: HomePromosViewModel, status: HomePromoStatusFilter): HomePromosViewModel {
  return { ...viewModel, activeStatus: status, phaseState: "loading", rows: [] };
}

export function HomePromosPage({ viewModel }: { viewModel: HomePromosViewModel }) {
  const router = useRouter();
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [statusCache, setStatusCache] = useState<Partial<Record<HomePromoStatusFilter, HomePromosViewModel>>>({
    [viewModel.activeStatus]: viewModel,
  });
  const [menuRowId, setMenuRowId] = useState<number | null>(null);
  const [busyRowId, setBusyRowId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentViewModel(viewModel);
    setStatusCache({ [viewModel.activeStatus]: viewModel });
    setMenuRowId(null);
  }, [viewModel]);

  async function refresh() {
    const response = await fetch(
      `/api/admin/home-promos/list?status=${currentViewModel.activeStatus}&q=${encodeURIComponent(currentViewModel.searchQuery)}`,
    );
    if (!response.ok) return;
    const nextViewModel = (await response.json()) as HomePromosViewModel;
    setStatusCache((current) => ({ ...current, [nextViewModel.activeStatus]: nextViewModel }));
    setCurrentViewModel(nextViewModel);
  }

  async function switchStatus(status: HomePromoStatusFilter) {
    if (status === currentViewModel.activeStatus) return;
    window.history.pushState(null, "", buildHomePromosHref({ status, q: currentViewModel.searchQuery }));
    const cached = statusCache[status];
    if (cached) {
      setCurrentViewModel(cached);
      return;
    }
    setCurrentViewModel((current) => loadingViewModel(current, status));
    try {
      const response = await fetch(`/api/admin/home-promos/list?status=${status}&q=${encodeURIComponent(currentViewModel.searchQuery)}`);
      if (!response.ok) throw new Error("Unable to load promo cards.");
      const nextViewModel = (await response.json()) as HomePromosViewModel;
      setStatusCache((current) => ({ ...current, [status]: nextViewModel }));
      setCurrentViewModel(nextViewModel);
    } catch {
      setCurrentViewModel((current) => ({ ...loadingViewModel(current, status), phaseState: "error" }));
    }
  }

  async function toggleActivation(row: HomePromoRow) {
    setMenuRowId(null);
    setBusyRowId(row.id);
    await fetch(`/api/admin/content/home-promos/${row.id}/activation`, {
      method: row.isActive ? "DELETE" : "POST",
    });
    setBusyRowId(null);
    await refresh();
  }

  function startEdit(row: HomePromoRow) {
    setMenuRowId(null);
    setCurrentViewModel((current) => ({ ...current, editingRow: row }));
    router.push(buildHomePromosHref({ status: currentViewModel.activeStatus, q: currentViewModel.searchQuery, edit: row.id }));
  }

  function cancelEdit() {
    setCurrentViewModel((current) => ({ ...current, editingRow: null }));
    router.push(buildHomePromosHref({ status: currentViewModel.activeStatus, q: currentViewModel.searchQuery }));
  }

  function onSaved(kind: "create" | "update") {
    setCurrentViewModel((current) => ({ ...current, editingRow: null }));
    router.push(buildHomePromosHref({ status: currentViewModel.activeStatus, success: kind }));
    router.refresh();
  }

  return (
    <AdminDashboardShell viewModel={currentViewModel.shell}>
      <div className="max-w-[1160px] pt-6 md:pt-8">
        <div>
          <h1 className="text-[28px] font-semibold leading-[1.2] text-[var(--color-text-primary)]">{currentViewModel.pageTitle}</h1>
          <p className="mt-2 max-w-[640px] text-[14px] text-white/55">{currentViewModel.pageDescription}</p>
        </div>

        {currentViewModel.showSuccess && currentViewModel.successMessage ? (
          <div className="mt-5 rounded-[12px] border border-[#0CBC32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]">
            {currentViewModel.successMessage}
          </div>
        ) : null}

        <div className="mt-8 rounded-[20px] bg-[var(--color-surface-elevated)] px-5 pb-8 pt-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-[14px]">
              {currentViewModel.statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => switchStatus(tab.key)}
                  aria-pressed={tab.key === currentViewModel.activeStatus}
                  className={`border-b pb-1 font-normal ${tab.key === currentViewModel.activeStatus ? "border-[#9B68D5] text-white" : "border-transparent text-white/55"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-[260px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
                <AdminSearchIcon />
              </span>
              <input
                readOnly
                value={currentViewModel.searchQuery}
                placeholder="Search by title"
                className="h-[36px] w-full rounded-[8px] border border-white/10 bg-white/[0.05] pl-9 pr-4 text-[12px] text-white/80 outline-none placeholder:text-white/45"
              />
            </div>
          </div>

          {currentViewModel.phaseState === "loading" ? <div className="py-16 text-center text-white/70">Loading promo cards...</div> : null}
          {currentViewModel.phaseState === "error" ? (
            <AdminErrorState title="Unable to load promo cards" message={currentViewModel.errorMessage} />
          ) : null}
          {currentViewModel.phaseState === "empty" ? (
            <div className="py-16 text-center text-[16px] font-medium text-white/90">No promo cards here yet.</div>
          ) : null}
          {currentViewModel.phaseState === "populated" ? (
            <>
              <div className="mt-5 overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[64px_1fr_180px_110px_48px] items-center rounded-[10px] bg-white/[0.03] px-4 py-[10px] text-[10px] font-semibold text-white">
                    <span>Preview</span>
                    <span>Title</span>
                    <span>Window</span>
                    <span>Status</span>
                    <span />
                  </div>
                  <div className="divide-y divide-white/10">
                    {currentViewModel.rows.map((row) => (
                      <div key={row.id} className="grid grid-cols-[64px_1fr_180px_110px_48px] items-center px-4 py-3 text-[12px] text-white/85">
                        <div
                          className="h-[34px] w-[46px] rounded-[6px] border border-[#ff9f4a]/40"
                          style={{
                            background: row.imageUrl
                              ? `url(${row.imageUrl}) center/cover`
                              : "linear-gradient(160deg, #2b2038, #1a1424)",
                          }}
                        />
                        <span className="truncate pr-4 font-medium text-white">{row.title}</span>
                        <span className="text-white/70">{row.windowLabel}</span>
                        <StatusPill status={row.status} />
                        <div className="relative justify-self-end">
                          <button
                            type="button"
                            onClick={() => setMenuRowId((current) => (current === row.id ? null : row.id))}
                            aria-label={`Open actions for promo ${row.id}`}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white/70 hover:bg-white/[0.06]"
                          >
                            ⋮
                          </button>
                          {menuRowId === row.id ? (
                            <div className="absolute right-0 top-[calc(100%+6px)] z-20 min-w-[130px] rounded-[10px] border border-white/10 bg-[var(--color-surface-panel)] py-1 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                              <button type="button" onClick={() => startEdit(row)} className="block w-full px-3 py-2 text-left text-[12px] text-white hover:bg-white/[0.05]">
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleActivation(row)}
                                disabled={busyRowId === row.id}
                                className="block w-full px-3 py-2 text-left text-[12px] text-white hover:bg-white/[0.05] disabled:opacity-50"
                              >
                                {busyRowId === row.id ? "Saving..." : row.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <AdminPaginationFooter
                  showingLabel={currentViewModel.showingLabel}
                  hasPreviousPage={currentViewModel.hasPreviousPage}
                  hasNextPage={currentViewModel.hasNextPage}
                  previousHref={buildHomePromosHref({ status: currentViewModel.activeStatus, q: currentViewModel.searchQuery, page: currentViewModel.page - 1 })}
                  nextHref={buildHomePromosHref({ status: currentViewModel.activeStatus, q: currentViewModel.searchQuery, page: currentViewModel.page + 1 })}
                />
              </div>
            </>
          ) : null}
        </div>

        <PromoForm editingRow={currentViewModel.editingRow} onSaved={onSaved} onCancelEdit={cancelEdit} />

        {menuRowId !== null ? (
          <button type="button" onClick={() => setMenuRowId(null)} className="fixed inset-0 z-10" aria-label="Close promo actions menu" />
        ) : null}
      </div>
    </AdminDashboardShell>
  );
}
