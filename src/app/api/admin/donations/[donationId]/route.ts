import { NextResponse, type NextRequest } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders } from "@/core/auth/backend";
import { mapDonationDetail } from "@/features/admin/data/services/get-donations-view-model";

export async function GET(req: NextRequest, context: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await context.params;

  const backendResponse = await fetch(`${backendBaseUrl}/donations/admin/donations/${donationId}/`, {
    method: "GET",
    headers: buildBackendSessionHeaders(req),
    cache: "no-store",
  });

  if (!backendResponse.ok) {
    return NextResponse.json({ message: "Unable to load donation detail." }, { status: backendResponse.status });
  }

  const payload = (await backendResponse.json().catch(() => ({}))) as Record<string, unknown>;
  return NextResponse.json(mapDonationDetail(payload));
}
