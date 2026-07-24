import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { cache } from "react";
import { backendBaseUrl } from "@/core/auth/backend";
import type { SessionData } from "@/core/auth/types";

const e2eSession: SessionData = {
  userId: "e2e-admin@itestified.app",
  email: "e2e-admin@itestified.app",
  role: "admin",
  roleLabel: "Super Admin",
  mustChangePassword: false,
  fullName: "E2E Admin",
};

function mapBackendSession(payload: Record<string, unknown>): SessionData | null {
  const email = typeof payload.email === "string" ? payload.email : null;
  const role = payload.role === "admin" ? "admin" : null;
  const roleLabel = typeof payload.role_label === "string" ? payload.role_label : undefined;
  const mustChangePassword = payload.must_change_password === true;
  const fullName = typeof payload.full_name === "string" ? payload.full_name : undefined;

  if (!email || !role) return null;
  return { userId: email, email, role, roleLabel, mustChangePassword, fullName };
}

const fetchBackendSession = cache(async function fetchBackendSession(cookieHeader?: string | null): Promise<SessionData | null> {
  if (process.env.E2E_BYPASS_AUTH === "1") {
    return e2eSession;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${backendBaseUrl}/auth/admin/session/`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return mapBackendSession(payload);
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
});

export async function getServerSession() {
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
  return fetchBackendSession(cookieHeader);
}

export function getRequestSession(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  return fetchBackendSession(cookieHeader);
}
