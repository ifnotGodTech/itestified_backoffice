import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request) {
  const incomingFormData = await req.formData();
  const title = String(incomingFormData.get("title") ?? "").trim();
  const categoryId = String(incomingFormData.get("category_id") ?? "").trim();
  const body = String(incomingFormData.get("body") ?? "").trim();
  const uploadStatus = String(incomingFormData.get("upload_status") ?? "upload_now").trim();
  const scheduledPublishAt = String(incomingFormData.get("scheduled_publish_at") ?? "").trim();
  const totalVideosInBatch = String(incomingFormData.get("total_videos_in_batch") ?? "1").trim();
  const videoFile = incomingFormData.get("video_file");
  const thumbnailFile = incomingFormData.get("thumbnail_file");

  if (!title || !categoryId || !(videoFile instanceof File)) {
    return NextResponse.json(
      { message: "title, category_id, and video_file are required." },
      { status: 400 },
    );
  }

  const backendFormData = new FormData();
  backendFormData.set("title", title);
  backendFormData.set("category_id", categoryId);
  backendFormData.set("body", body);
  backendFormData.set("upload_status", uploadStatus);
  backendFormData.set("total_videos_in_batch", totalVideosInBatch);
  if (scheduledPublishAt) {
    backendFormData.set("scheduled_publish_at", scheduledPublishAt);
  }
  backendFormData.set("video_file", videoFile);
  if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
    backendFormData.set("thumbnail_file", thumbnailFile);
  }

  const backendHeaders = buildBackendSessionHeaders(req);
  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/testimonies/upload-video/`, {
    method: "POST",
    headers: backendHeaders,
    body: backendFormData,
    cache: "no-store",
  });

  const backendContentType = (backendResponse.headers.get("content-type") || "").toLowerCase();
  let payload: unknown = {};
  if (backendContentType.includes("application/json")) {
    payload = (await backendResponse.json().catch(() => ({}))) as unknown;
  } else {
    const text = (await backendResponse.text().catch(() => "")).trim();
    payload = {
      message:
        text ||
        backendResponse.statusText ||
        `Backend upload request failed (${backendResponse.status}).`,
    };
  }
  if (
    (!payload || typeof payload !== "object" || Object.keys(payload as Record<string, unknown>).length === 0) &&
    !backendResponse.ok
  ) {
    payload = {
      message:
        backendResponse.statusText || `Backend upload request failed (${backendResponse.status}).`,
    };
  }
  const response = NextResponse.json(payload, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
