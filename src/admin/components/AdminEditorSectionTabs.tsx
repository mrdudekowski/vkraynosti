import type { KeyboardEvent } from 'react';
import { ADMIN_UI } from '../constants/ui';
import type { AdminEditorSectionId } from '../tourEditorTabs';

type AdminEditorSectionTabsProps = {
  label: string;
  value: AdminEditorSectionId;
  options: ReadonlyArray<{ id: AdminEditorSectionId; label: string }>;
  blockerIds: readonly AdminEditorSectionId[];
  onChange: (id: AdminEditorSectionId) => void;
};

const AdminEditorSectionTabs = ({
  label,
  value,
  options,
  blockerIds,
  onChange,
}: AdminEditorSectionTabsProps) => {
  const blockerSet = new Set(blockerIds);

  const moveTo = (id: AdminEditorSectionId) => {
    onChange(id);
    window.requestAnimationFrame(() => {
      const tab = window.document.getElementById(`admin-tab-${id}`);
      tab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
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
      className="flex gap-1 overflow-x-auto overscroll-x-contain pb-1"
      onKeyDown={onKeyDown}
    >
      {options.map((option) => {
        const selected = option.id === value;
        const hasBlocker = blockerSet.has(option.id);
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            id={`admin-tab-${option.id}`}
            aria-selected={selected}
            aria-controls={`admin-panel-${option.id}`}
            aria-label={hasBlocker ? `${option.label}, ${ADMIN_UI.tabHasBlocker}` : option.label}
            tabIndex={selected ? 0 : -1}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-admin-control px-3 py-2 text-sm ${
              selected ? 'admin-nav-active' : 'admin-nav-item'
            }`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
            {hasBlocker ? <span className="admin-tab-blocker-dot" /> : null}
          </button>
        );
      })}
    </div>
  );
};

export default AdminEditorSectionTabs;
