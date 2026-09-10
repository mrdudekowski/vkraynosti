import { useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, ListChecks, Plus, Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUmbrellaBeach } from '@fortawesome/free-solid-svg-icons/faUmbrellaBeach';
import {
  INCLUDED_ICON_CATALOG,
  UNSET_INCLUDED_ICON_KEY,
  isIncludedIconKey,
} from '../../cms/includedIconCatalog';
import { ADMIN_UI } from '../constants/ui';
import { moveItem } from '../moveItem';
import { EDITOR_FOCUS_IDS } from '../tourEditorTabs';
import { useAdminToast } from '../toast/adminToastContext';
import { pushAdminUndo } from '../toast/pushAdminUndo';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';
import AdminEditorSurface from './AdminEditorSurface';
import AdminEmptyState from './AdminEmptyState';
import { AdminTextInput } from './AdminFields';
import AdminIconButton from './AdminIconButton';

export type IncludedDraftItem = {
  text: string;
  iconKey: string;
};

type IncludedSectionProps = {
  items: IncludedDraftItem[];
  onChange: (items: IncludedDraftItem[]) => void;
};

type IconPickerProps = {
  selectedKey: string;
  onSelect: (iconKey: string) => void;
  onClose: () => void;
};

const ITEM_DRAG = 'application/x-vkr-included-item';

const IconPicker = ({ selectedKey, onSelect, onClose }: IconPickerProps) => (
  <AdminDialog
    title={ADMIN_UI.includedIconPickerTitle}
    titleId="admin-icon-picker-title"
    closeLabel={ADMIN_UI.closePicker}
    onClose={onClose}
  >
    <div className="flex flex-wrap gap-2">
      {INCLUDED_ICON_CATALOG.map((entry) => {
        const selected = entry.key === selectedKey;
        const label = ADMIN_UI.iconLabels[entry.key] ?? entry.key;
        return (
          <button
            key={entry.key}
            type="button"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-admin-control border ${
              selected
                ? 'border-brand-primary text-brand-primary'
                : 'border-divider text-text-primary'
            }`}
            aria-label={label}
            aria-pressed={selected}
            title={label}
            onClick={() => onSelect(entry.key)}
          >
            <FontAwesomeIcon icon={entry.icon} />
          </button>
        );
      })}
    </div>
    <AdminButton type="button" variant="ghost" className="mt-4" onClick={onClose}>
      {ADMIN_UI.closePicker}
    </AdminButton>
  </AdminDialog>
);

const IncludedSection = ({ items, onChange }: IncludedSectionProps) => {
  const { push } = useAdminToast();
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const replaceWithUndo = (next: IncludedDraftItem[], message: string) => {
    if (next === items) {
      return;
    }
    const previous = items;
    onChange(next);
    pushAdminUndo(push, message, () => onChange(previous));
  };

  const addItem = () => {
    const nextIndex = items.length;
    onChange([...items, { text: '', iconKey: UNSET_INCLUDED_ICON_KEY }]);
    window.requestAnimationFrame(() => {
      window.document.getElementById(`included-text-${nextIndex}`)?.focus();
    });
  };

  return (
    <AdminEditorSurface icon={ListChecks} title={ADMIN_UI.includedHeading}>
      {items.length === 0 ? (
        <AdminEmptyState
          title={ADMIN_UI.includedEmpty}
          description={ADMIN_UI.includedEmptyHint}
          action={
            <AdminButton variant="secondary" onClick={addItem}>
              <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
              {ADMIN_UI.addIncluded}
            </AdminButton>
          }
        />
      ) : (
      <ul className="admin-editor-list flex flex-col gap-0.5">
        {items.map((item, index) => {
          const entry = INCLUDED_ICON_CATALOG.find((icon) => icon.key === item.iconKey);
          const chosen = isIncludedIconKey(item.iconKey) && entry != null;
          const missingIcon = item.text.trim().length > 0 && !chosen;
          return (
            <li
              key={`included-${index}`}
              className={`admin-editor-row items-center ${missingIcon ? 'admin-row-warning p-1' : ''}`.trim()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const fromIndex = Number.parseInt(event.dataTransfer.getData(ITEM_DRAG), 10);
                if (!Number.isInteger(fromIndex) || fromIndex === index) {
                  return;
                }
                const direction = fromIndex < index ? 1 : -1;
                let next = items;
                let current = fromIndex;
                while (current !== index) {
                  next = moveItem(next, current, direction);
                  current += direction;
                }
                replaceWithUndo(next, ADMIN_UI.listReordered);
              }}
            >
              <button
                type="button"
                draggable
                className="admin-icon-btn cursor-grab"
                aria-label={ADMIN_UI.dragItem}
                onDragStart={(event) => {
                  event.dataTransfer.setData(ITEM_DRAG, String(index));
                  event.dataTransfer.effectAllowed = 'move';
                }}
              >
                <GripVertical aria-hidden size={16} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                id={EDITOR_FOCUS_IDS.includedIcon(index)}
                className={`admin-icon-btn ${
                  chosen
                    ? 'border border-brand-primary text-brand-primary'
                    : 'border border-dashed border-divider'
                }`}
                aria-label={
                  chosen
                    ? (ADMIN_UI.iconLabels[item.iconKey] ?? item.iconKey)
                    : ADMIN_UI.includedIconUnset
                }
                onClick={() => setPickerIndex(index)}
              >
                <FontAwesomeIcon icon={chosen ? entry.icon : faUmbrellaBeach} />
              </button>
              <AdminTextInput
                id={`included-text-${index}`}
                aria-label={ADMIN_UI.includedTextLabel}
                value={item.text}
                onChange={(event) => {
                  const next = [...items];
                  const current = next[index];
                  if (current == null) return;
                  next[index] = { ...current, text: event.target.value };
                  onChange(next);
                }}
              />
              <AdminIconButton
                icon={ChevronUp}
                label={ADMIN_UI.moveUp}
                disabled={index === 0}
                onClick={() => replaceWithUndo(moveItem(items, index, -1), ADMIN_UI.listReordered)}
              />
              <AdminIconButton
                icon={ChevronDown}
                label={ADMIN_UI.moveDown}
                disabled={index === items.length - 1}
                onClick={() => replaceWithUndo(moveItem(items, index, 1), ADMIN_UI.listReordered)}
              />
              <AdminIconButton
                icon={Trash2}
                label={ADMIN_UI.removeItem}
                danger
                onClick={() =>
                  replaceWithUndo(
                    items.filter((_, itemIndex) => itemIndex !== index),
                    ADMIN_UI.listItemRemoved,
                  )
                }
              />
            </li>
          );
        })}
      </ul>
      )}
      {items.length > 0 ? (
      <AdminButton
        variant="secondary"
        className="self-start"
        onClick={addItem}
      >
        <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
        {ADMIN_UI.addIncluded}
      </AdminButton>
      ) : null}
      {pickerIndex != null ? (
        <IconPicker
          selectedKey={items[pickerIndex]?.iconKey ?? UNSET_INCLUDED_ICON_KEY}
          onSelect={(iconKey) => {
            const next = [...items];
            const current = next[pickerIndex];
            if (current != null) {
              next[pickerIndex] = { ...current, iconKey };
              onChange(next);
            }
            setPickerIndex(null);
          }}
          onClose={() => setPickerIndex(null)}
        />
      ) : null}
    </AdminEditorSurface>
  );
};

export default IncludedSection;
