import type { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#33214b_0%,#171717_34%,#0d0d0d_100%)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-10 px-6 py-10 lg:flex-row lg:items-center lg:px-10">
        <section className="max-w-xl space-y-6">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
            iTestified Dashboard
          </div>
          <div className="space-y-4">
            <h1 className="max-w-lg text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
            <p className="max-w-xl text-base leading-7 text-[var(--color-text-secondary)]">{description}</p>
          </div>
          <div className="grid gap-3 text-sm text-[var(--color-text-secondary)] sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">Strict dark-first visual system</div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">Mocked access now, backend later</div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">Shared shell for all authenticated routes</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/8 bg-black/25 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-primary)]">Visible modules</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-[var(--color-text-secondary)]">
                <span>Dashboard</span>
                <span>Donations</span>
                <span>Reviews</span>
                <span>Notifications</span>
                <span>My profile</span>
                <span>Submission</span>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(153,102,204,0.18),rgba(255,255,255,0.02))] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-primary)]">Design cues</p>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
                The exported dashboard surfaces lean on elevated dark panels, high-contrast headings, and modular cards
                for metrics, testimony actions, and notifications.
              </p>
            </div>
          </div>
        </section>
        <section className="w-full max-w-xl">{children}</section>
      </div>
    </div>
  );
}
