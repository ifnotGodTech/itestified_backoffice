"use client";

import { useState } from "react";
import type { AdminReaction, ReactionIconOption } from "@/features/admin/domain/entities/reactions";
import {
  AppReactionRow,
  Dialog,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "@/features/admin/presentation/components/reactions/reactions-shared";

const LABEL_MAX = 24;

/** New reaction, or rename / change icon of an existing one. */
export function ReactionFormDialog({
  icons,
  editing,
  busy,
  error,
  onSubmit,
  onClose,
}: {
  icons: ReactionIconOption[];
  editing: AdminReaction | null;
  busy: boolean;
  error: string | null;
  onSubmit: (label: string, icon: string) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(editing?.label ?? "");
  const [icon, setIcon] = useState(editing?.icon ?? icons[0]?.key ?? "");
  const trimmed = label.trim();
  const emoji = icons.find((option) => option.key === icon)?.emoji ?? "";
  const unchanged = editing !== null && trimmed === editing.label && icon === editing.icon;

  return (
    <Dialog
      title={editing ? `Edit “${editing.label}”` : "New reaction"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={SECONDARY_BUTTON} onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="reaction-form"
            className={PRIMARY_BUTTON}
            disabled={busy || trimmed.length === 0 || unchanged}
          >
            {busy ? "Saving…" : editing ? "Save changes" : "Create reaction"}
          </button>
        </>
      }
    >
      <form
        id="reaction-form"
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed) onSubmit(trimmed, icon);
        }}
      >
        <label className="flex flex-col gap-2">
          <span className="text-[13.5px] font-semibold text-[var(--color-text-primary)]">What the button says</span>
          <span className="flex h-[44px] items-center rounded-[8px] bg-[var(--color-surface-muted)] pr-3 focus-within:shadow-[0_0_0_2px_var(--color-primary)]">
            <input
              autoFocus
              value={label}
              maxLength={LABEL_MAX}
              onChange={(event) => setLabel(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-[15px] text-[var(--color-text-primary)] outline-none"
              aria-describedby="reaction-label-hint"
            />
            <span className="text-[12px] text-[var(--color-text-muted)]">
              {label.length} / {LABEL_MAX}
            </span>
          </span>
          <span id="reaction-label-hint" className="text-[12px] text-[var(--color-text-muted)]">
            Short and warm. People tap it to stand with the person who shared.
          </span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[13.5px] font-semibold text-[var(--color-text-primary)]">Icon</legend>
          <div role="radiogroup" aria-label="Icon" className="grid grid-cols-6 gap-2">
            {icons.map((option) => {
              const selected = option.key === icon;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.key.replace(/_/g, " ")}
                  onClick={() => setIcon(option.key)}
                  className={`flex h-11 items-center justify-center rounded-[10px] text-[20px] ${
                    selected
                      ? "bg-[var(--color-surface-strong)] shadow-[0_0_0_2px_var(--color-primary)]"
                      : "bg-[var(--color-surface-muted)] hover:shadow-[0_0_0_1px_var(--color-border-soft)]"
                  }`}
                >
                  {option.emoji}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2 rounded-[12px] bg-[var(--color-surface-muted)] p-3">
          <span className="text-[12.5px] text-[var(--color-text-secondary)]">How it looks in the app</span>
          <div className="max-w-[300px]">
            <AppReactionRow emoji={emoji} label={trimmed || "Your reaction"} count="12" />
          </div>
        </div>

        {editing ? (
          <p className="text-[12.5px] leading-5 text-[var(--color-text-muted)]">
            {editing.responseCount === 0
              ? "No one has responded with it yet."
              : `Its ${editing.responseCount.toLocaleString()} past ${editing.responseCount === 1 ? "response keeps" : "responses keep"} counting under the new name.`}
          </p>
        ) : (
          <p className="text-[12.5px] leading-5 text-[var(--color-text-muted)]">
            A new reaction isn&apos;t shown anywhere until you add it to a category&apos;s set.
          </p>
        )}
        {error ? (
          <p role="alert" className="text-[13px] text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
}

export function RetireReactionDialog({
  reaction,
  busy,
  error,
  onConfirm,
  onClose,
}: {
  reaction: AdminReaction;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const places = [...(reaction.inDefaultSet ? ["the default set"] : []), ...reaction.categories];
  return (
    <Dialog
      title={`Retire “${reaction.label}”?`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={SECONDARY_BUTTON} onClick={onClose}>
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-danger)] px-4 text-[13.5px] font-semibold text-[#ffffff] disabled:opacity-50"
          >
            {busy ? "Retiring…" : "Retire reaction"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3 text-[14px] leading-6 text-[var(--color-text-secondary)]">
        <p>People won&apos;t be able to choose it anymore.</p>
        {places.length > 0 ? (
          <p>
            It comes off <b className="text-[var(--color-text-primary)]">{places.join(", ")}</b>. A category left with no
            reactions uses the default set.
          </p>
        ) : null}
        <p>
          {reaction.responseCount > 0
            ? `Its ${reaction.responseCount.toLocaleString()} past ${reaction.responseCount === 1 ? "response stays" : "responses stay"} counted on their testimonies. `
            : ""}
          You can bring it back later.
        </p>
        {error ? (
          <p role="alert" className="text-[13px] text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}
