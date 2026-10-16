"use client";

import type { AdminReaction, ReactionsData } from "@/features/admin/domain/entities/reactions";
import { CARD, IconTile, PRIMARY_BUTTON } from "@/features/admin/presentation/components/reactions/reactions-shared";

// On a phone each reaction stacks as a card (icon, name and actions on top,
// where it's offered underneath); from md up it's a five-column table.
const GRID =
  "grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 md:grid-cols-[44px_minmax(140px,1.3fr)_minmax(160px,2fr)_96px_150px] md:gap-3";

function ShownOn({ reaction }: { reaction: AdminReaction }) {
  const chips = [...(reaction.inDefaultSet ? ["Default set"] : []), ...reaction.categories];
  if (chips.length === 0) {
    return <span className="text-[12.5px] text-[var(--color-text-muted)]">Not in any set yet</span>;
  }
  return (
    <span className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip}
          className={`rounded-full px-2.5 py-0.5 text-[12px] ${
            chip === "Default set"
              ? "bg-[var(--color-primary)]/15 font-semibold text-[var(--color-primary-strong)]"
              : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
          }`}
        >
          {chip}
        </span>
      ))}
    </span>
  );
}

function CatalogueRow({
  reaction,
  onEdit,
  onRetire,
  onRestore,
  busy,
}: {
  reaction: AdminReaction;
  onEdit: () => void;
  onRetire: () => void;
  onRestore: () => void;
  busy: boolean;
}) {
  return (
    <div role="row" className={`${GRID} border-t border-[var(--color-border-subtle)] px-4 py-3 md:px-5`}>
      <span role="cell" className={`row-span-2 md:row-span-1 ${reaction.isActive ? "" : "opacity-55"}`}>
        <IconTile emoji={reaction.emoji} />
      </span>
      <span role="cell" className={`min-w-0 ${reaction.isActive ? "" : "opacity-55"}`}>
        <span className="block text-[14.5px] font-semibold text-[var(--color-text-primary)]">{reaction.label}</span>
        <span className="block text-[12.5px] text-[var(--color-text-muted)] md:hidden">
          {reaction.responseCount.toLocaleString()} {reaction.responseCount === 1 ? "response" : "responses"}
        </span>
      </span>
      <span
        role="cell"
        className={`col-span-2 col-start-2 row-start-2 md:col-span-1 md:col-start-auto md:row-start-auto ${reaction.isActive ? "" : "opacity-55"}`}
      >
        {reaction.isActive ? <ShownOn reaction={reaction} /> : <span className="text-[12.5px] text-[var(--color-text-muted)]">Retired</span>}
      </span>
      <span role="cell" className="hidden text-[14px] tabular-nums text-[var(--color-text-secondary)] md:block">
        {reaction.responseCount.toLocaleString()}
      </span>
      <span role="cell" className="col-start-3 row-start-1 flex justify-end gap-1 md:col-start-auto md:row-start-auto">
        {reaction.isActive ? (
          <>
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${reaction.label}`}
              className="rounded-[8px] px-2.5 py-1.5 text-[13px] font-semibold text-[var(--color-primary-strong)] hover:bg-[var(--color-surface-muted)]"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onRetire}
              aria-label={`Retire ${reaction.label}`}
              className="rounded-[8px] px-2.5 py-1.5 text-[13px] font-semibold text-[var(--color-danger)] hover:bg-[var(--color-surface-muted)]"
            >
              Retire
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onRestore}
            disabled={busy}
            aria-label={`Bring back ${reaction.label}`}
            className="rounded-[8px] px-2.5 py-1.5 text-[13px] font-semibold text-[var(--color-primary-strong)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
          >
            Bring back
          </button>
        )}
      </span>
    </div>
  );
}

function TableHead() {
  return (
    <div role="row" className={`${GRID} hidden px-5 py-3 text-[12.5px] font-semibold text-[var(--color-text-secondary)] md:grid`}>
      <span role="columnheader">Icon</span>
      <span role="columnheader">Reaction</span>
      <span role="columnheader">Offered on</span>
      <span role="columnheader">Responses</span>
      <span role="columnheader" className="sr-only">
        Actions
      </span>
    </div>
  );
}

export function ReactionCatalogue({
  data,
  busy,
  onNew,
  onEdit,
  onRetire,
  onRestore,
}: {
  data: ReactionsData;
  busy: boolean;
  onNew: () => void;
  onEdit: (reaction: AdminReaction) => void;
  onRetire: (reaction: AdminReaction) => void;
  onRestore: (reaction: AdminReaction) => void;
}) {
  const active = data.reactions.filter((reaction) => reaction.isActive);
  const retired = data.reactions.filter((reaction) => !reaction.isActive);
  const byId = new Map(data.reactions.map((reaction) => [reaction.id, reaction]));
  const defaultLabels = data.defaultSet.map((id) => byId.get(id)?.label).filter(Boolean);
  const onDefault = data.categories.filter((category) => category.reactionIds.length === 0).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] leading-6 text-[var(--color-text-secondary)]">
          <b className="text-[var(--color-text-primary)]">Default set:</b> {defaultLabels.join(" · ")}. Used by every
          category without its own set ({onDefault} of {data.categories.length}).
        </p>
        <button type="button" className={PRIMARY_BUTTON} onClick={onNew}>
          + New reaction
        </button>
      </div>

      <section aria-label="Reactions in use" role="table" className={`overflow-hidden ${CARD}`}>
          <TableHead />
          {active.map((reaction) => (
            <CatalogueRow
              key={reaction.id}
              reaction={reaction}
              busy={busy}
              onEdit={() => onEdit(reaction)}
              onRetire={() => onRetire(reaction)}
              onRestore={() => onRestore(reaction)}
            />
          ))}
      </section>

      {retired.length > 0 ? (
          <section aria-label="Retired reactions" role="table" className={`overflow-hidden ${CARD}`}>
            <p className="px-5 pb-2.5 pt-3.5 text-[13px] font-bold text-[var(--color-text-secondary)]">
              Retired · {retired.length}{" "}
              <span className="font-normal text-[var(--color-text-muted)]">
                · no longer offered; past responses stay counted on their testimonies
              </span>
            </p>
            {retired.map((reaction) => (
              <CatalogueRow
                key={reaction.id}
                reaction={reaction}
                busy={busy}
                onEdit={() => onEdit(reaction)}
                onRetire={() => onRetire(reaction)}
                onRestore={() => onRestore(reaction)}
              />
            ))}
          </section>
      ) : null}
    </div>
  );
}
