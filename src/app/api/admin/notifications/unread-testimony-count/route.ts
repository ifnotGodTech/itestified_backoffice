import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/core/auth/backend";

type BackendNotification = {
  notification_type: string;
};

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const response = await fetch(`${backendBaseUrl}/notifications/admin/history/?status=unread&page_size=100`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    const payload = (await response.json().catch(() => ({}))) as {
      results?: BackendNotification[];
    };
    const count = (payload.results ?? []).filter((row) => row.notification_type === "testimony_submitted").length;
    return NextResponse.json({ count }, { status: 200 });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
