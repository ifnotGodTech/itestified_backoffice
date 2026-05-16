import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/core/auth/backend";

type BackendNotification = {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const response = await fetch(`${backendBaseUrl}/notifications/admin/history/?status=unread&page_size=20`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json({ item: null }, { status: 200 });
    }
    const payload = (await response.json().catch(() => ({}))) as {
      results?: BackendNotification[];
    };
    const latest = (payload.results ?? []).find((row) => row.notification_type === "testimony_submitted") ?? null;
    return NextResponse.json({ item: latest }, { status: 200 });
  } catch {
    return NextResponse.json({ item: null }, { status: 200 });
  }
}
