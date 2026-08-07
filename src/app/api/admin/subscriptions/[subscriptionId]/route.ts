import { NextResponse, type NextRequest } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders } from "@/core/auth/backend";
import { mapSubscriptionDetail } from "@/features/admin/data/services/get-subscriptions-view-model";

export async function GET(req: NextRequest, context: { params: Promise<{ subscriptionId: string }> }) {
  const { subscriptionId } = await context.params;

  const backendResponse = await fetch(`${backendBaseUrl}/subscriptions/admin/subscriptions/${subscriptionId}/`, {
    method: "GET",
    headers: buildBackendSessionHeaders(req),
    cache: "no-store",
  });

  if (!backendResponse.ok) {
    return NextResponse.json({ message: "Unable to load subscription detail." }, { status: backendResponse.status });
  }

  const payload = (await backendResponse.json().catch(() => ({}))) as Record<string, unknown>;
  return NextResponse.json(mapSubscriptionDetail(payload));
}
