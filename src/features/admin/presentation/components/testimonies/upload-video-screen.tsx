"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildTestimoniesHref } from "@/features/admin/presentation/state/testimonies-route-state";
import type { TestimonyCategoryOption } from "@/features/admin/domain/entities/testimonies";

type Props = {
  categories: TestimonyCategoryOption[];
};

type UploadMode = "single" | "multiple";
type UploadStatus = "upload_now" | "schedule_for_later" | "draft";

type VideoDraft = {
  id: string;
  title: string;
  source: string;
  body: string;
  categoryId: string;
  videoFile: File | null;
  thumbnailFile: File | null;
};

const MAX_VIDEOS_PER_BATCH = 10;
const MAX_VIDEO_FILE_SIZE_BYTES = 200 * 1024 * 1024;
const ALLOWED_VIDEO_CONTENT_TYPES = new Set(["video/mp4"]);

function extractApiErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Upload failed. Please review your details and try again.";
  }
  const record = data as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) return record.message;
  for (const value of Object.values(record)) {
    if (typeof value === "string" && value.trim()) return value;
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === "string" && item.trim());
      if (typeof first === "string") return first;
      const nested = value.find((item) => item && typeof item === "object");
      if (nested) {
        const nestedMessage = extractApiErrorMessage(nested);
        if (nestedMessage !== "Upload failed. Please review your details and try again.") return nestedMessage;
      }
    }
    if (value && typeof value === "object") {
      const nestedMessage = extractApiErrorMessage(value);
      if (nestedMessage !== "Upload failed. Please review your details and try again.") return nestedMessage;
    }
  }
  return "Upload failed. Please review your details and try again.";
}

function validateVideoFile(file: File | null): string | null {
  if (!file) return "Video file is required.";
  if (!ALLOWED_VIDEO_CONTENT_TYPES.has((file.type || "").toLowerCase())) {
    return "Only MP4 video uploads are allowed.";
  }
  if (file.size <= 0) {
    return "Video file is empty.";
  }
  if (file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
    return "Video file exceeds the 200MB limit.";
  }
  return null;
}

const pageCardClass =
  "rounded-[20px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]";
const fieldClass =
  "w-full rounded-[10px] bg-[var(--color-surface-panel)] px-4 py-4 text-[15px] text-[var(--color-text-primary)] outline-none";
const sectionLabelClass = "mb-3 text-[16px] font-medium text-[var(--color-text-primary)]";
const pageTitleClass = "text-[28px] font-semibold leading-[1.2] text-[var(--color-text-primary)] md:text-[32px]";

function UploadCloudIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 15.5V8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.75 11.75 12 8.5l3.25 3.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M5 5 15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function newDraft(seed: number): VideoDraft {
  return {
    id: `video-${seed}`,
    title: "",
    source: "",
    body: "",
    categoryId: "",
    videoFile: null,
    thumbnailFile: null,
  };
}

export function UploadVideoScreen({ categories }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<UploadMode>("single");
  const [drafts, setDrafts] = useState<VideoDraft[]>([newDraft(1)]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("upload_now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  const activeCategories = useMemo(() => categories.filter((item) => item.isActive), [categories]);

  function setDraftValue(index: number, patch: Partial<VideoDraft>) {
    setDrafts((previous) => previous.map((draft, i) => (i === index ? { ...draft, ...patch } : draft)));
  }

  function handleModeChange(nextMode: UploadMode) {
    setMode(nextMode);
    if (nextMode === "single" && drafts.length > 1) {
      setDrafts([drafts[0]]);
    }
  }

  function addNewVideo() {
    if (mode !== "multiple") return;
    if (drafts.length >= MAX_VIDEOS_PER_BATCH) {
      setMessageTone("error");
      setMessage(`A maximum of ${MAX_VIDEOS_PER_BATCH} videos is allowed per upload batch.`);
      return;
    }
    setDrafts((previous) => [...previous, newDraft(previous.length + 1)]);
  }

  function removeVideo(index: number) {
    if (mode !== "multiple") return;
    setDrafts((previous) => {
      if (previous.length <= 1) return previous;
      return previous.filter((_, i) => i !== index);
    });
  }

  async function submitUpload() {
    const workingDrafts = mode === "single" ? [drafts[0]] : drafts;
    if (workingDrafts.some((draft) => !draft.title.trim() || !draft.categoryId || !draft.videoFile)) {
      setMessageTone("error");
      setMessage("Each video requires title, category, and video file.");
      return;
    }
    for (const draft of workingDrafts) {
      const validationError = validateVideoFile(draft.videoFile);
      if (validationError) {
        setMessageTone("error");
        setMessage(validationError);
        return;
      }
    }
    if (uploadStatus === "schedule_for_later" && (!scheduledDate || !scheduledTime)) {
      setMessageTone("error");
      setMessage("Scheduled uploads require date and time.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      if (workingDrafts.length > MAX_VIDEOS_PER_BATCH) {
        throw new Error(`A maximum of ${MAX_VIDEOS_PER_BATCH} videos is allowed per upload batch.`);
      }
      for (const draft of workingDrafts) {
        const payload = new FormData();
        payload.set("title", draft.title.trim());
        const composedBody = [
          draft.body.trim(),
          draft.source.trim() ? `Source: ${draft.source.trim()}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        payload.set("body", composedBody);
        payload.set("upload_status", uploadStatus);
        payload.set("total_videos_in_batch", String(workingDrafts.length));
        if (uploadStatus === "schedule_for_later") {
          const scheduledPublishAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
          payload.set("scheduled_publish_at", scheduledPublishAt);
        }
        payload.set("category_id", draft.categoryId);
        payload.set("video_file", draft.videoFile as File);
        if (draft.thumbnailFile) payload.set("thumbnail_file", draft.thumbnailFile);

        const response = await fetch("/api/admin/testimonies/upload-video", {
          method: "POST",
          body: payload,
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as unknown;
          const message = extractApiErrorMessage(data);
          if (message !== "Upload failed. Please review your details and try again.") {
            throw new Error(message);
          }
          throw new Error(`Upload failed (${response.status}). Please review your details and try again.`);
        }
      }

      setSubmitting(false);
      setMessageTone("success");
      setMessage(
        mode === "multiple"
          ? `${workingDrafts.length} videos uploaded successfully. They are now pending moderation review.`
          : "Video uploaded successfully. It is now pending moderation review.",
      );
      setDrafts([newDraft(1)]);
      setUploadStatus("upload_now");
      setScheduledDate("");
      setScheduledTime("");
      router.push(buildTestimoniesHref({ tab: "video", success: "upload" }));
      router.refresh();
    } catch (error) {
      setSubmitting(false);
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className={pageTitleClass}>Upload Video Testimonies</h2>
        </div>
        <div className="flex gap-3">
          {mode === "multiple" ? (
            <button
              type="button"
              onClick={addNewVideo}
              disabled={drafts.length >= MAX_VIDEOS_PER_BATCH}
              className="inline-flex h-[44px] w-fit min-w-[132px] items-center justify-center rounded-[10px] border border-[var(--color-primary)] px-4 text-[14px] text-[var(--color-primary)]"
            >
              Add new video
            </button>
          ) : null}
          <button
            type="button"
            onClick={submitUpload}
            disabled={submitting}
            className="inline-flex h-[44px] w-fit min-w-[116px] items-center justify-center rounded-[10px] bg-[var(--color-primary)] px-6 text-[14px] text-[var(--color-text-primary)] disabled:opacity-60"
          >
            {submitting ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {message ? (
        <p className={`mt-4 text-[14px] ${messageTone === "error" ? "text-[#ef4335]" : "text-[#6BFFB4]"}`}>{message}</p>
      ) : null}
      {mode === "multiple" ? (
        <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">
          Batch limit: up to {MAX_VIDEOS_PER_BATCH} videos per upload.
        </p>
      ) : null}

      <div className="mt-10 md:mt-12">
        <p className={sectionLabelClass}>Upload Mode</p>
        <select
          value={mode}
          onChange={(event) => handleModeChange(event.target.value as UploadMode)}
          className="inline-flex h-[40px] min-w-[220px] rounded-[10px] bg-[var(--color-surface-panel)] px-4 text-[14px] text-[var(--color-text-primary)]"
        >
          <option value="single">Single Video Upload</option>
          <option value="multiple">Multiple Video Upload</option>
        </select>
      </div>

      {drafts.map((draft, index) => (
        <div key={draft.id} className={`${pageCardClass} mt-8 px-6 py-7 md:mt-10 md:px-7 md:py-8`}>
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_496px] xl:gap-10">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-semibold text-[var(--color-text-primary)]">Video {index + 1}</h3>
                {mode === "multiple" && drafts.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/20 text-white/80 hover:bg-white/10"
                    aria-label={`Remove video ${index + 1}`}
                    title={`Remove video ${index + 1}`}
                  >
                    <CloseIcon />
                  </button>
                ) : null}
              </div>
              <div className="mt-7 space-y-6">
                <div>
                  <p className={sectionLabelClass}>Title</p>
                  <input value={draft.title} onChange={(event) => setDraftValue(index, { title: event.target.value })} placeholder="Enter video title" className={fieldClass} />
                </div>
                <div>
                  <p className={sectionLabelClass}>Source</p>
                  <input value={draft.source} onChange={(event) => setDraftValue(index, { source: event.target.value })} placeholder="Enter video source" className={fieldClass} />
                </div>
                <div>
                  <p className={sectionLabelClass}>Category</p>
                  <select value={draft.categoryId} onChange={(event) => setDraftValue(index, { categoryId: event.target.value })} className={fieldClass}>
                    <option value="">Select category</option>
                    {activeCategories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className={sectionLabelClass}>Body (optional)</p>
                  <textarea value={draft.body} onChange={(event) => setDraftValue(index, { body: event.target.value })} placeholder="Optional summary/body" className={`${fieldClass} min-h-[120px]`} />
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-[18px] border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 text-center">
                <div className="mx-auto flex max-w-[320px] flex-col items-center">
                  <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                    <UploadCloudIcon />
                  </div>
                  <p className="mt-5 text-[16px] leading-[1.45] text-[var(--color-text-secondary)]">
                    Drag & drop or{" "}
                    <label
                      htmlFor={`video-file-input-${draft.id}`}
                      className="cursor-pointer text-[var(--color-primary)] underline-offset-2 hover:underline"
                    >
                      choose file
                    </label>{" "}
                    here to upload
                  </p>
                  <input
                    id={`video-file-input-${draft.id}`}
                    type="file"
                    accept="video/*"
                    onChange={(event) => setDraftValue(index, { videoFile: event.target.files?.[0] ?? null })}
                    className="mt-4 block w-full text-[14px] text-[var(--color-text-secondary)]"
                  />
                  <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">{draft.videoFile ? `Selected: ${draft.videoFile.name}` : "No video selected"}</p>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">MP4, Max size(200mb)</p>
                </div>
              </div>

              <div className="mt-8">
                <p className={sectionLabelClass}>Thumbnail</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setDraftValue(index, { thumbnailFile: event.target.files?.[0] ?? null })}
                  className="block w-full text-[14px] text-[var(--color-text-secondary)]"
                />
                <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">{draft.thumbnailFile ? `Selected: ${draft.thumbnailFile.name}` : "No thumbnail selected"}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className={`${pageCardClass} mt-8 px-6 py-6 md:px-7 md:py-7`}>
        <p className={sectionLabelClass}>Upload Status</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-4 text-[15px] text-[var(--color-text-secondary)]">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="upload_status"
              checked={uploadStatus === "upload_now"}
              onChange={() => setUploadStatus("upload_now")}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            Upload Now
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="upload_status"
              checked={uploadStatus === "schedule_for_later"}
              onChange={() => setUploadStatus("schedule_for_later")}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            Schedule for later
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="upload_status"
              checked={uploadStatus === "draft"}
              onChange={() => setUploadStatus("draft")}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            Drafts
          </label>
        </div>
        {uploadStatus === "schedule_for_later" ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              type="date"
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
              className={fieldClass}
            />
            <input
              type="time"
              value={scheduledTime}
              onChange={(event) => setScheduledTime(event.target.value)}
              className={fieldClass}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
