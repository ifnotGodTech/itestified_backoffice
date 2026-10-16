import { seeOther } from "@/core/lib/see-other";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

const FORMAT_CONTENT_TYPES: Record<string, string[]> = {
  aac: ["audio/aac"],
  m4a: ["audio/mp4", "audio/x-m4a"],
  mp3: ["audio/mpeg", "audio/mp3"],
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const maxFileSizeMb = Number.parseFloat(String(formData.get("max_file_size_mb") ?? ""));
  const maxDurationMinutes = Number.parseFloat(String(formData.get("max_duration_minutes") ?? ""));
  const dailyLimit = Number.parseInt(String(formData.get("daily_limit") ?? ""), 10);
  const selectedFormats = formData.getAll("audio_formats").map(String);
  const allowedContentTypes = selectedFormats.flatMap((key) => FORMAT_CONTENT_TYPES[key] ?? []);

  const allValid =
    Number.isFinite(maxFileSizeMb) &&
    maxFileSizeMb >= 1 &&
    maxFileSizeMb <= 500 &&
    Number.isFinite(maxDurationMinutes) &&
    maxDurationMinutes >= 1 &&
    maxDurationMinutes <= 120 &&
    Number.isFinite(dailyLimit) &&
    dailyLimit >= 1 &&
    dailyLimit <= 50 &&
    allowedContentTypes.length > 0;
  if (!allValid) {
    return seeOther("/testimonies/upload-policy?section=audio&state=validation");
  }

  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/audio-upload-policy/`, {
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
  const redirect = seeOther(`/testimonies/upload-policy?section=audio&state=${targetState}`);
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
