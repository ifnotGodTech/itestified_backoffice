"use client";

import type { AdminReaction, ReactionSetTarget, ReactionsData } from "@/features/admin/domain/entities/reactions";
import {
  AppReactionRow,
  CARD,
  IconTile,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "@/features/admin/presentation/components/reactions/reactions-shared";

// Sample counts for the preview, so it reads like a real testimony.
const SAMPLE_COUNTS = [128, 64, 19, 7];

function targetName(data: ReactionsData, target: ReactionSetTarget): string {
  if (target === "default") return "Default set";
  return data.categories.find((category) => category.id === target)?.name ?? "Category";
}

export function savedSetFor(data: ReactionsData, target: ReactionSetTarget): number[] {
  if (target === "default") return data.defaultSet;
  return data.categories.find((category) => category.id === target)?.reactionIds ?? [];
}

function CategoryList({
  data,
  target,
  onSelect,
}: {
  data: ReactionsData;
  target: ReactionSetTarget;
  onSelect: (target: ReactionSetTarget) => void;
}) {
  const item = (key: string, value: ReactionSetTarget, name: string, summary: string, own: boolean, inactive = false) => {
    const selected = value === target;
    return (
      <li key={key}>
        <button
          type="button"
          onClick={() => onSelect(value)}
          aria-current={selected ? "true" : undefined}
          className={`flex w-full items-center justify-between gap-2 rounded-[10px] px-3 py-2.5 text-left text-[14px] ${
            selected ? "bg-[var(--color-surface-muted)]" : "hover:bg-[var(--color-surface-muted)]/60"
          }`}
        >
          <span className={`${selected ? "font-bold" : "font-medium"} text-[var(--color-text-primary)]`}>
            {name}
            {inactive ? <span className="ml-1.5 text-[11.5px] font-normal text-[var(--color-text-muted)]">hidden</span> : null}
          </span>
          <span className={`text-[12.5px] ${own ? "text-[var(--color-primary-strong)]" : "text-[var(--color-text-muted)]"}`}>
            {summary}
          </span>
        </button>
      </li>
    );
  };
  return (
    <section aria-label="Sets" className={`p-3.5 ${CARD}`}>
      <ul className="flex flex-col gap-0.5">
        {item("default", "default", "Default set", `${data.defaultSet.length} · fallback`, true)}
      </ul>
      <p className="mx-1 mb-1.5 mt-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
        Categories
      </p>
      <ul className="flex flex-col gap-0.5">
        {data.categories.map((category) =>
          item(
            String(category.id),
            category.id,
            category.name,
            category.reactionIds.length > 0 ? `${category.reactionIds.length} · own set` : "Default set",
            category.reactionIds.length > 0,
            !category.isActive,
          ),
        )}
      </ul>
    </section>
  );
}

function SetItem({
  reaction,
  index,
  last,
  onMove,
  onRemove,
}: {
  reaction: AdminReaction;
  index: number;
  last: boolean;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const control =
    "flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-30";
  return (
    <li className="flex items-center gap-3 rounded-[10px] bg-[var(--color-surface-muted)] px-3 py-2">
      <span className="w-4 text-[13px] text-[var(--color-text-muted)]">{index + 1}</span>
      <IconTile emoji={reaction.emoji} size="sm" />
      <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-[var(--color-text-primary)]">{reaction.label}</span>
      <button type="button" className={control} disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${reaction.label} up`}>
        ↑
      </button>
      <button type="button" className={control} disabled={last} onClick={() => onMove(1)} aria-label={`Move ${reaction.label} down`}>
        ↓
      </button>
      <button
        type="button"
        className={`${control} text-[var(--color-danger)]`}
        onClick={onRemove}
        aria-label={`Remove ${reaction.label} from this set`}
      >
        ✕
      </button>
    </li>
  );
}

export function ReactionSetEditor({
  data,
  target,
  draft,
  busy,
  error,
  onSelectTarget,
  onChangeDraft,
  onSave,
  onDiscard,
}: {
  data: ReactionsData;
  target: ReactionSetTarget;
  draft: number[];
  busy: boolean;
  error: string | null;
  onSelectTarget: (target: ReactionSetTarget) => void;
  onChangeDraft: (ids: number[]) => void;
  onSave: (ids: number[]) => void;
  onDiscard: () => void;
}) {
  const byId = new Map(data.reactions.map((reaction) => [reaction.id, reaction]));
  const name = targetName(data, target);
  const isDefault = target === "default";
  const saved = savedSetFor(data, target);
  const dirty = draft.join(",") !== saved.join(",");
  const items = draft.map((id) => byId.get(id)).filter((reaction): reaction is AdminReaction => Boolean(reaction));
  const addable = data.reactions.filter((reaction) => reaction.isActive && !draft.includes(reaction.id));
  const full = draft.length >= data.maxPerSet;
  const usesDefault = !isDefault && draft.length === 0;
  const preview = usesDefault
    ? data.defaultSet.map((id) => byId.get(id)).filter((reaction): reaction is AdminReaction => Boolean(reaction))
    : items;

  const move = (index: number, direction: -1 | 1) => {
    const next = [...draft];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChangeDraft(next);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_300px]">
      <CategoryList data={data} target={target} onSelect={onSelectTarget} />

      <section aria-label={`${name} reactions`} className={`flex flex-col gap-4 px-5 py-5 ${CARD}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">
            {name}
            {dirty ? <span className="ml-2 text-[12.5px] font-semibold text-[var(--color-warning)]">Unsaved changes</span> : null}
          </h2>
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            {draft.length} of {data.maxPerSet} · shown in this order
          </span>
        </div>

        {usesDefault ? (
          <p className="rounded-[10px] bg-[var(--color-surface-muted)] px-4 py-3.5 text-[14px] leading-6 text-[var(--color-text-secondary)]">
            {name} uses the default set. Add a reaction below to give it its own.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {items.map((reaction, index) => (
              <SetItem
                key={reaction.id}
                reaction={reaction}
                index={index}
                last={index === items.length - 1}
                onMove={(direction) => move(index, direction)}
                onRemove={() => onChangeDraft(draft.filter((id) => id !== reaction.id))}
              />
            ))}
          </ol>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="sr-only">Add a reaction from the catalogue</span>
          <select
            value=""
            disabled={full || addable.length === 0}
            onChange={(event) => {
              const id = Number(event.target.value);
              if (id) onChangeDraft([...draft, id]);
            }}
            className="h-[44px] rounded-[10px] bg-transparent px-3 text-[14px] text-[var(--color-text-secondary)] shadow-[0_0_0_1.5px_var(--color-border-soft)] outline-none focus:shadow-[0_0_0_2px_var(--color-primary)] disabled:opacity-50"
          >
            <option value="">
              {full
                ? `This set is full (${data.maxPerSet}). Remove one to add another.`
                : addable.length === 0
                  ? "Every reaction is already in this set"
                  : "+ Add a reaction from the catalogue"}
            </option>
            {addable.map((reaction) => (
              <option key={reaction.id} value={reaction.id}>
                {reaction.emoji} {reaction.label}
              </option>
            ))}
          </select>
        </label>

        <p className="text-[12.5px] leading-5 text-[var(--color-text-muted)]">
          {isDefault
            ? "Every category without its own set offers these. The default set always needs at least one reaction."
            : `${name} testimonies keep the responses they already have. A reaction taken off this set stops being offered here, but its count stays on each testimony.`}
        </p>

        {error ? (
          <p role="alert" className="text-[13px] text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          {!isDefault && saved.length > 0 ? (
            <button
              type="button"
              onClick={() => onChangeDraft([])}
              className="text-[13.5px] font-semibold text-[var(--color-primary-strong)] hover:underline"
            >
              Go back to the default set
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2.5">
            <button type="button" className={SECONDARY_BUTTON} disabled={!dirty || busy} onClick={onDiscard}>
              Discard
            </button>
            <button
              type="button"
              className={PRIMARY_BUTTON}
              disabled={!dirty || busy || (isDefault && draft.length === 0)}
              onClick={() => onSave(draft)}
            >
              {busy ? "Saving…" : isDefault ? "Save default set" : `Save ${name}’s set`}
            </button>
          </div>
        </div>
      </section>

      <section aria-label="Preview" className={`flex flex-col gap-3 p-4 lg:col-span-2 xl:col-span-1 ${CARD}`}>
        <p className="text-[13px] font-bold text-[var(--color-text-secondary)]">
          {isDefault ? "How a testimony on the default set shows it" : `How a ${name} testimony shows it`}
        </p>
        <div className="flex min-h-[300px] flex-1 flex-col justify-end rounded-[26px] bg-[var(--color-surface-muted)] p-2.5">
          <div className="rounded-[18px_18px_12px_12px] bg-[#ffffff] px-3 pb-3.5 pt-2.5">
            <div className="mx-auto mb-2.5 h-1 w-9 rounded-full bg-[#D6CDE2]" />
            <p className="mb-2 text-[14px] font-bold text-[#1F1A27]">Respond to Grace Chapel</p>
            <div className="flex flex-col gap-1.5">
              {preview.length === 0 ? (
                <p className="py-3 text-center text-[12.5px] text-[#6B6476]">No reactions in this set yet.</p>
              ) : (
                preview.map((reaction, index) => (
                  <AppReactionRow
                    key={reaction.id}
                    emoji={reaction.emoji}
                    label={reaction.label}
                    mine={index === 0}
                    count={index === 0 ? `You + ${SAMPLE_COUNTS[0]}` : String(SAMPLE_COUNTS[index] ?? 3)}
                  />
                ))
              )}
            </div>
            <p className="mt-2.5 text-[12px] text-[#6B6476]">Comments · 23</p>
          </div>
        </div>
        <p className="text-[12px] text-[var(--color-text-muted)]">
          Sample counts.{usesDefault ? " Showing the default set, which this category uses." : ""}
        </p>
      </section>
    </div>
  );
}
