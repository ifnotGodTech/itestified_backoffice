"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type {
  AdminReaction,
  ReactionSetTarget,
  ReactionsAction,
  ReactionsData,
  ReactionsView,
  ReactionsViewModel,
} from "@/features/admin/domain/entities/reactions";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminErrorState } from "@/features/admin/presentation/components/shared/admin-table-primitives";
import { ReactionCatalogue } from "@/features/admin/presentation/components/reactions/reaction-catalogue";
import { ReactionFormDialog, RetireReactionDialog } from "@/features/admin/presentation/components/reactions/reaction-dialogs";
import { ReactionSetEditor, savedSetFor } from "@/features/admin/presentation/components/reactions/reaction-set-editor";
import { Dialog, PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/features/admin/presentation/components/reactions/reactions-shared";

function ViewTabs({ view }: { view: ReactionsView }) {
  const tabs: { value: ReactionsView; label: string; href: string }[] = [
    { value: "catalogue", label: "Catalogue", href: "/testimonies/reactions" },
    { value: "sets", label: "Category sets", href: "/testimonies/reactions?view=sets" },
  ];
  return (
    <nav aria-label="View" className="flex gap-1 rounded-[10px] bg-[var(--color-surface-muted)] p-1">
      {tabs.map((tab) => {
        const selected = tab.value === view;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            aria-current={selected ? "page" : undefined}
            className={`rounded-[8px] px-3.5 py-2 text-[13.5px] ${
              selected ? "bg-[var(--color-primary)] font-bold" : "hover:bg-[var(--color-surface-elevated)]"
            }`}
          >
            {/* Links inherit their colour (globals.css), so it goes on the text. */}
            <span className={selected ? "text-[#ffffff]" : "text-[var(--color-text-secondary)]"}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

type Dialogs =
  | { kind: "none" }
  | { kind: "form"; editing: AdminReaction | null }
  | { kind: "retire"; reaction: AdminReaction }
  | { kind: "leave"; next: ReactionSetTarget };

/** Phase 35 Slice 6: the catalogue of reactions, and which ones each
 * category offers. */
export function ReactionsPage({ viewModel }: { viewModel: ReactionsViewModel }) {
  const router = useRouter();
  const [data, setData] = useState<ReactionsData | null>(viewModel.data);
  const [target, setTarget] = useState<ReactionSetTarget>(viewModel.target);
  const [draft, setDraft] = useState<number[]>(viewModel.data ? savedSetFor(viewModel.data, viewModel.target) : []);
  const [dialog, setDialog] = useState<Dialogs>({ kind: "none" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setData(viewModel.data);
    setTarget(viewModel.target);
    setDraft(viewModel.data ? savedSetFor(viewModel.data, viewModel.target) : []);
  }, [viewModel]);

  async function run(action: ReactionsAction, done: string): Promise<boolean> {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/reactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(action),
      });
      const body = (await response.json().catch(() => ({}))) as ReactionsData & { message?: string };
      if (!response.ok) {
        setError(body.message ?? "We could not save that change. Please try again.");
        return false;
      }
      setData(body);
      setStatus(done);
      return true;
    } catch {
      setError("We could not save that change. Please check your connection and try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function selectTarget(next: ReactionSetTarget) {
    if (!data || next === target) return;
    if (draft.join(",") !== savedSetFor(data, target).join(",")) {
      setDialog({ kind: "leave", next });
      return;
    }
    openTarget(next, data);
  }

  function openTarget(next: ReactionSetTarget, source: ReactionsData) {
    setTarget(next);
    setDraft(savedSetFor(source, next));
    setError(null);
    setStatus(null);
    router.replace(`/testimonies/reactions?view=sets&set=${next}`, { scroll: false });
  }

  function closeDialog() {
    setDialog({ kind: "none" });
    setError(null);
  }

  const targetName =
    target === "default" ? "Default set" : (data?.categories.find((category) => category.id === target)?.name ?? "Category");

  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="flex max-w-[1180px] flex-col gap-6 pt-4">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-[var(--color-text-primary)]">Reactions</h1>
            <p className="mt-1.5 text-[14px] text-[var(--color-text-secondary)]">
              The buttons people tap to respond to a testimony. Each category shows its own set.
            </p>
          </div>
          <ViewTabs view={viewModel.view} />
        </header>

        <p role="status" aria-live="polite" className={status ? "text-[13.5px] font-semibold text-[var(--color-success)]" : "sr-only"}>
          {status ?? ""}
        </p>

        {viewModel.phaseState === "error" || !data ? (
          <AdminErrorState title="Reactions aren't available" message={viewModel.errorMessage} />
        ) : viewModel.view === "catalogue" ? (
          <ReactionCatalogue
            data={data}
            busy={busy}
            onNew={() => setDialog({ kind: "form", editing: null })}
            onEdit={(reaction) => setDialog({ kind: "form", editing: reaction })}
            onRetire={(reaction) => setDialog({ kind: "retire", reaction })}
            onRestore={(reaction) =>
              run({ action: "restore", id: reaction.id }, `“${reaction.label}” is back. Add it to a set to offer it.`)
            }
          />
        ) : (
          <ReactionSetEditor
            data={data}
            target={target}
            draft={draft}
            busy={busy}
            error={dialog.kind === "none" ? error : null}
            onSelectTarget={selectTarget}
            onChangeDraft={(ids) => {
              setDraft(ids);
              setStatus(null);
            }}
            onSave={(ids) =>
              run(
                { action: "set", target, reactionIds: ids },
                target !== "default" && ids.length === 0
                  ? `${targetName} now uses the default set.`
                  : `${targetName}${target === "default" ? "" : "’s set"} saved.`,
              )
            }
            onDiscard={() => setDraft(savedSetFor(data, target))}
          />
        )}
      </div>

      {data && dialog.kind === "form" ? (
        <ReactionFormDialog
          icons={data.icons}
          editing={dialog.editing}
          busy={busy}
          error={error}
          onClose={closeDialog}
          onSubmit={async (label, icon) => {
            const editing = dialog.editing;
            const ok = editing
              ? await run({ action: "edit", id: editing.id, label, icon }, `“${label}” saved.`)
              : await run({ action: "create", label, icon }, `“${label}” created. Add it to a category’s set to offer it.`);
            if (ok) setDialog({ kind: "none" });
          }}
        />
      ) : null}

      {dialog.kind === "retire" ? (
        <RetireReactionDialog
          reaction={dialog.reaction}
          busy={busy}
          error={error}
          onClose={closeDialog}
          onConfirm={async () => {
            if (await run({ action: "retire", id: dialog.reaction.id }, `“${dialog.reaction.label}” retired.`)) {
              setDialog({ kind: "none" });
            }
          }}
        />
      ) : null}

      {data && dialog.kind === "leave" ? (
        <Dialog
          title={`Discard changes to ${targetName}?`}
          onClose={closeDialog}
          footer={
            <>
              <button type="button" className={SECONDARY_BUTTON} onClick={closeDialog}>
                Keep editing
              </button>
              <button
                type="button"
                className={PRIMARY_BUTTON}
                onClick={() => {
                  const next = dialog.next;
                  setDialog({ kind: "none" });
                  openTarget(next, data);
                }}
              >
                Discard changes
              </button>
            </>
          }
        >
          <p className="text-[14px] leading-6 text-[var(--color-text-secondary)]">
            You changed {targetName}&apos;s reactions but haven&apos;t saved them.
          </p>
        </Dialog>
      ) : null}
    </AdminDashboardShell>
  );
}
