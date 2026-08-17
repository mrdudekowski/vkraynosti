import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { faUmbrellaBeach } from '@fortawesome/free-solid-svg-icons/faUmbrellaBeach';
import {
  INCLUDED_ICON_CATALOG,
  UNSET_INCLUDED_ICON_KEY,
  isIncludedIconKey,
} from '../../cms/includedIconCatalog';
import { ADMIN_UI } from '../constants/ui';
import { moveItem } from '../moveItem';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';
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
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  return (
    <section className="flex flex-col gap-2 rounded-card border border-divider bg-surface-light p-3">
      <h2 className="text-base font-semibold text-text-primary">{ADMIN_UI.includedHeading}</h2>
      <ul className="flex flex-col gap-1">
        {items.map((item, index) => {
          const entry = INCLUDED_ICON_CATALOG.find((icon) => icon.key === item.iconKey);
          const chosen = isIncludedIconKey(item.iconKey) && entry != null;
          return (
            <li key={`included-${index}`} className="flex items-center gap-1">
              <button
                type="button"
                className={`admin-icon-btn ${
                  chosen ? 'border border-brand-primary text-brand-primary' : 'border border-dashed border-divider'
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
                icon={faChevronUp}
                label={ADMIN_UI.moveUp}
                onClick={() => onChange(moveItem(items, index, -1))}
              />
              <AdminIconButton
                icon={faChevronDown}
                label={ADMIN_UI.moveDown}
                onClick={() => onChange(moveItem(items, index, 1))}
              />
              <AdminIconButton
                icon={faTrash}
                label={ADMIN_UI.removeItem}
                danger
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              />
            </li>
          );
        })}
      </ul>
      <AdminButton
        variant="secondary"
        className="self-start"
        onClick={() => onChange([...items, { text: '', iconKey: UNSET_INCLUDED_ICON_KEY }])}
      >
        <FontAwesomeIcon icon={faPlus} className="mr-2" aria-hidden />
        {ADMIN_UI.addIncluded}
      </AdminButton>
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
    </section>
  );
};

export default IncludedSection;
