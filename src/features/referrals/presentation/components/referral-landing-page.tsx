import Image from "next/image";
import { androidStoreUrl, iosStoreUrl } from "@/features/share/domain/entities/store-links";

// Phase 24 Slice 6. Deliberately static and generic -- no backend lookup,
// no referrer name/avatar/email, nothing that could vary by code at all
// beyond echoing the code itself back. Phase 11 Slice 1 already hit this
// exact trap once (a public, crawler-indexed share page leaking
// author.email) and fixed it by making page content fixed/non-personalized;
// this reuses that lesson from the start rather than re-learning it.
export function ReferralLandingPage({ code }: { code: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-5 py-10">
      <Image src="/admin-logo.svg" alt="iTestified" width={140} height={32} className="h-8 w-auto" priority />

      <div className="overflow-hidden rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] shadow-[0_24px_80px_-56px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col gap-4 p-6">
          <span className="w-fit rounded-full bg-[var(--color-primary)]/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--color-primary)]">
            You&apos;ve been invited
          </span>

          <h1 className="text-balance text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">
            Join iTestified with a friend&apos;s referral code
          </h1>

          <p className="text-pretty text-sm leading-7 text-[var(--color-text-secondary)]">
            Someone shared iTestified with you. Get the app, create your account, and enter this code when you sign
            up.
          </p>

          <div className="rounded-[16px] border border-dashed border-[var(--color-border-soft)] bg-[var(--color-surface-panel)] px-5 py-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Your referral code
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tracking-[0.3em] text-[var(--color-text-primary)]">
              {code}
            </p>
          </div>

          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
            Shared via iTestified
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Get the app to sign up</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Download iTestified, tap &quot;Create an account,&quot; and enter the referral code above in the optional
          field on the sign-up screen.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={androidStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_18px_40px_-24px_rgba(153,102,204,0.9)] transition duration-200 hover:bg-[var(--color-primary-strong)]"
          >
            Get it on Google Play
          </a>
          <a
            href={iosStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition duration-200 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]"
          >
            Download on the App Store
          </a>
        </div>
      </div>
    </main>
  );
}
