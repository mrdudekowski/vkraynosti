import type { KeyboardEvent } from 'react';

type SiteSectionTabsProps<Id extends string> = {
  label: string;
  value: Id;
  options: ReadonlyArray<{ id: Id; label: string }>;
  onChange: (id: Id) => void;
};

const SiteSectionTabs = <Id extends string>({
  label,
  value,
  options,
  onChange,
}: SiteSectionTabsProps<Id>) => {
  const moveTo = (id: Id) => {
    onChange(id);
    window.requestAnimationFrame(() => {
      const tab = window.document.getElementById(`admin-tab-${id}`);
      if (typeof tab?.scrollIntoView === 'function') {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        tab.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
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
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            id={`admin-tab-${option.id}`}
            aria-selected={selected}
            aria-controls={`admin-panel-${option.id}`}
            tabIndex={selected ? 0 : -1}
            className={`inline-flex min-h-11 min-w-0 w-full items-center justify-center rounded-admin-control px-2 py-2 text-sm admin-desktop:w-auto ${
              selected ? 'admin-nav-active' : 'admin-nav-item'
            }`}
            onClick={() => onChange(option.id)}
          >
            <span className="min-w-0 truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SiteSectionTabs;
