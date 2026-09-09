import type { KeyboardEvent } from 'react';
import { ADMIN_UI } from '../constants/ui';
import type { AdminEditorSectionId } from '../tourEditorTabs';

type AdminEditorSectionTabsProps = {
  label: string;
  value: AdminEditorSectionId;
  options: ReadonlyArray<{ id: AdminEditorSectionId; label: string }>;
  blockerIds: readonly AdminEditorSectionId[];
  completedIds?: readonly AdminEditorSectionId[];
  onChange: (id: AdminEditorSectionId) => void;
};

const AdminEditorSectionTabs = ({
  label,
  value,
  options,
  blockerIds,
  completedIds = [],
  onChange,
}: AdminEditorSectionTabsProps) => {
  const blockerSet = new Set(blockerIds);
  const completedSet = new Set(completedIds);

  const moveTo = (id: AdminEditorSectionId) => {
    onChange(id);
    window.requestAnimationFrame(() => {
      const tab = window.document.getElementById(`admin-tab-${id}`);
      if (typeof tab?.scrollIntoView === 'function') {
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
      tab?.focus();
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = options.findIndex((option) => option.id === value);
    if (index < 0) {
      return;
    }
    let nextIndex = index;
    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % options.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + options.length) % options.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = options.length - 1;
    } else {
      return;
    }
    const next = options[nextIndex];
    if (next == null) {
      return;
    }
    event.preventDefault();
    moveTo(next.id);
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="grid min-w-0 grid-cols-1 gap-2 pb-1 admin-desktop:flex"
      onKeyDown={onKeyDown}
    >
      {options.map((option) => {
        const selected = option.id === value;
        const hasBlocker = blockerSet.has(option.id);
        const statusLabel = hasBlocker
          ? ADMIN_UI.editorSectionProblem
          : completedSet.has(option.id)
            ? ADMIN_UI.editorSectionReady
            : ADMIN_UI.editorSectionIncomplete;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            id={`admin-tab-${option.id}`}
            aria-selected={selected}
            aria-expanded={selected}
            aria-controls={`admin-panel-${option.id}`}
            aria-describedby={`admin-section-status-${option.id}`}
            aria-label={hasBlocker ? `${option.label}, ${ADMIN_UI.tabHasBlocker}` : option.label}
            tabIndex={selected ? 0 : -1}
            className={`inline-flex min-h-11 min-w-0 w-full items-center justify-between gap-2 rounded-admin-control px-2 py-2 text-left text-sm admin-desktop:w-auto admin-desktop:justify-center admin-desktop:text-center ${
              selected ? 'admin-nav-active' : 'admin-nav-item'
            }`}
            onClick={() => onChange(option.id)}
          >
            <span className="min-w-0 truncate">{option.label}</span>
            <span
              id={`admin-section-status-${option.id}`}
              className="shrink-0 text-xs text-text-muted admin-desktop:sr-only"
            >
              {statusLabel}
            </span>
            {hasBlocker ? <span className="admin-tab-blocker-dot" /> : null}
          </button>
        );
      })}
    </div>
  );
};

export default AdminEditorSectionTabs;
