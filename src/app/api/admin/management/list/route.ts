import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/core/auth/session";
import { getAdminManagementViewModel } from "@/features/admin/data/services/get-admin-management-view-model";

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  const params = req.nextUrl.searchParams;
  const viewModel = getAdminManagementViewModel({
    tab: params.get("tab") ?? undefined,
    q: params.get("q") ?? undefined,
    fullName: session?.fullName ?? session?.email,
  });

  return NextResponse.json(viewModel);
}
