"use client";

import Link from "next/link";
import { AdminAuthFrame } from "@/features/auth/presentation/components/admin-auth-frame";

export default function CreatePasswordPage() {
  return (
    <AdminAuthFrame
      title="Invitation Setup Coming Next"
      description="Password creation now happens through invitation acceptance."
    >
      <div className="space-y-4" data-testid="create-password-form">
        <p className="text-sm text-[#d0d0d0]">
          This page is no longer used for entry-code setup. Ask a super admin to send your invite code.
        </p>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-[var(--color-primary)] px-4 py-3.5 text-base font-medium text-white transition duration-200 hover:bg-[var(--color-primary-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
        >
          Back to Log In
        </Link>
      </div>
    </AdminAuthFrame>
  );
}
