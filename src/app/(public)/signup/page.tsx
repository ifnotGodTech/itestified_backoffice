"use client";

import Link from "next/link";
import { AdminAuthFrame } from "@/features/auth/presentation/components/admin-auth-frame";

export default function SignupPage() {
  return (
    <AdminAuthFrame title="Admin Access Is Invite Only">
      <div className="space-y-5" data-testid="signup-form">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Self-service admin signup has been retired. Ask an active super admin to send you an invitation code.
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          If you are the first operator, run the secure bootstrap command to provision the initial super admin account.
        </p>
        <Link
          href="/login"
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-[var(--color-primary)] px-4 py-3.5 text-base font-medium text-white transition duration-200 hover:bg-[var(--color-primary-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
        >
          Back to Log In
        </Link>
      </div>

      <div className="mt-4 text-left">
        <Link href="/login" className="text-sm font-medium text-[var(--color-primary)]">
          I have an account
        </Link>
      </div>
    </AdminAuthFrame>
  );
}
