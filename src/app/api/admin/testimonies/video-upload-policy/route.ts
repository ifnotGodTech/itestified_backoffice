import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

const FORMAT_CONTENT_TYPES: Record<string, string[]> = {
  mp4: ["video/mp4"],
  mov: ["video/quicktime"],
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const maxFileSizeMb = Number.parseFloat(String(formData.get("max_file_size_mb") ?? ""));
  const maxDurationMinutes = Number.parseFloat(String(formData.get("max_duration_minutes") ?? ""));
  const dailyLimit = Number.parseInt(String(formData.get("daily_limit") ?? ""), 10);
  const selectedFormats = formData.getAll("video_formats").map(String);
  const allowedContentTypes = selectedFormats.flatMap((key) => FORMAT_CONTENT_TYPES[key] ?? []);

  const allValid =
    Number.isFinite(maxFileSizeMb) &&
    maxFileSizeMb >= 10 &&
    maxFileSizeMb <= 2048 &&
    Number.isFinite(maxDurationMinutes) &&
    maxDurationMinutes >= 0.5 &&
    maxDurationMinutes <= 60 &&
    Number.isFinite(dailyLimit) &&
    dailyLimit >= 1 &&
    dailyLimit <= 50 &&
    allowedContentTypes.length > 0;
  if (!allValid) {
    return NextResponse.redirect(new URL("/testimonies/upload-policy?section=video&state=validation", req.url), 303);
  }

  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/video-upload-policy/`, {
    method: "PATCH",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({
      max_file_size_bytes: Math.round(maxFileSizeMb * 1024 * 1024),
      max_duration_ms: Math.round(maxDurationMinutes * 60000),
      allowed_content_types: allowedContentTypes,
      daily_limit: dailyLimit,
    }),
    cache: "no-store",
  });

  const targetState = backendResponse.status === 400 ? "validation" : backendResponse.ok ? "success" : "error";
  const redirect = NextResponse.redirect(
    new URL(`/testimonies/upload-policy?section=video&state=${targetState}`, req.url),
    303,
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
