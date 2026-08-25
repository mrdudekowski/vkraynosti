import { Clock, Coins, Globe, Mountain, Tag } from 'lucide-react';
import { UI } from '../../constants/ui';
import type { CmsTourDocument } from '../../cms/cmsTourDocument';
import type { CmsTourTextPatch } from '../../cms/applyTourTextPatch';
import {
  isTourDurationDays,
  publicDurationFromDays,
  TOUR_DURATION_DAY_OPTIONS,
} from '../../cms/durationDays';
import { CATALOG_PRICE_ON_REQUEST } from '../../cms/tourCompleteness';
import { ADMIN_EDITOR_SHORT_TEXT_MAX } from '../../constants/adminUiTokens';
import { ADMIN_UI } from '../constants/ui';
import { EDITOR_FOCUS_IDS } from '../tourEditorTabs';
import AdminCharCount from './AdminCharCount';
import AdminDisclosure from './AdminDisclosure';
import AdminEditorSurface from './AdminEditorSurface';
import { AdminFieldLabel, AdminTextArea, AdminTextInput } from './AdminFields';
import AdminIcon from './AdminIcon';
import AdminSelect from './AdminSelect';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert'] as const;

function isTourDifficulty(value: string): value is CmsTourDocument['difficulty'] {
  return (DIFFICULTIES as readonly string[]).includes(value);
}

function isCatalogPrice(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === CATALOG_PRICE_ON_REQUEST) {
    return true;
  }
  const amountWithoutPrefix = trimmed.replace(/^от\s+/, '');
  const digitsOnlyAmount = amountWithoutPrefix.replace(/\s/g, '').replace(/₽$/, '');
  return /^\d+$/.test(digitsOnlyAmount);
}

type TourCatalogFieldsProps = {
  subtitle: string;
  durationDays: number | undefined;
  difficulty: CmsTourDocument['difficulty'];
  difficultyDisplayLabel: string;
  metaAudienceLabel: string;
  price: string;
  pricePrevious: string;
  priceFootnote: string;
  seoDescription: string;
  onChange: (patch: Partial<CmsTourTextPatch>) => void;
};

const TourCatalogFields = ({
  subtitle,
  durationDays,
  difficulty,
  difficultyDisplayLabel,
  metaAudienceLabel,
  price,
  pricePrevious,
  priceFootnote,
  seoDescription,
  onChange,
}: TourCatalogFieldsProps) => {
  const extrasDeepOpen =
    priceFootnote.trim().length > 0 || seoDescription.trim().length > 0;

  return (
    <>
      <AdminEditorSurface icon={Tag} title={ADMIN_UI.catalogHeading}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="flex items-baseline justify-between gap-2">
              <AdminFieldLabel htmlFor={EDITOR_FOCUS_IDS.subtitle} required>
                {ADMIN_UI.subtitleLabel}
              </AdminFieldLabel>
              <AdminCharCount value={subtitle} max={ADMIN_EDITOR_SHORT_TEXT_MAX} />
            </span>
            <AdminTextInput
              id={EDITOR_FOCUS_IDS.subtitle}
              value={subtitle}
              hasError={subtitle.trim().length === 0}
              onChange={(event) => onChange({ subtitle: event.target.value })}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <AdminFieldLabel htmlFor={EDITOR_FOCUS_IDS.duration} required>
                {ADMIN_UI.durationLabel}
              </AdminFieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-text-muted">
                  <AdminIcon icon={Clock} size={16} />
                </span>
                <AdminSelect
                  id={EDITOR_FOCUS_IDS.duration}
                  className="pl-8"
                  value={durationDays == null ? '' : String(durationDays)}
                  hasError={durationDays == null || !isTourDurationDays(durationDays)}
                  onChange={(event) => {
                    const days = Number(event.target.value);
                    if (isTourDurationDays(days)) {
                      onChange({ durationDays: days });
                    }
                  }}
                >
                  <option value="">{ADMIN_UI.durationUnset}</option>
                  {TOUR_DURATION_DAY_OPTIONS.map((days) => (
                    <option key={days} value={days}>
                      {publicDurationFromDays(days)}
                    </option>
                  ))}
                </AdminSelect>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <AdminFieldLabel htmlFor={EDITOR_FOCUS_IDS.difficulty} required>
                {ADMIN_UI.difficultyLabel}
              </AdminFieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-text-muted">
                  <AdminIcon icon={Mountain} size={16} />
                </span>
                <AdminSelect
                  id={EDITOR_FOCUS_IDS.difficulty}
                  className="pl-8"
                  value={difficulty}
                  onChange={(event) => {
                    if (isTourDifficulty(event.target.value)) {
                      onChange({ difficulty: event.target.value });
                    }
                  }}
                >
                  {DIFFICULTIES.map((item) => (
                    <option key={item} value={item}>
                      {UI.difficulty.labels[item]}
                    </option>
                  ))}
                </AdminSelect>
              </div>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <AdminFieldLabel htmlFor={EDITOR_FOCUS_IDS.price} required>
                {ADMIN_UI.priceLabel}
              </AdminFieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-text-muted">
                  <AdminIcon icon={Coins} size={16} />
                </span>
                <AdminTextInput
                  id={EDITOR_FOCUS_IDS.price}
                  className="pl-8"
                  value={price}
                  hasError={!isCatalogPrice(price)}
                  onChange={(event) => onChange({ price: event.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </AdminEditorSurface>
      <AdminEditorSurface icon={Globe} title={ADMIN_UI.catalogExtrasHeading}>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">{ADMIN_UI.pricePreviousLabel}</span>
            <AdminTextInput
              id="admin-price-previous"
              value={pricePrevious}
              onChange={(event) => onChange({ pricePrevious: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">{ADMIN_UI.difficultyDisplayLabel}</span>
            <AdminTextInput
              id="admin-difficulty-display"
              value={difficultyDisplayLabel}
              onChange={(event) => onChange({ difficultyDisplayLabel: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-sm font-medium text-text-primary">{ADMIN_UI.audienceLabel}</span>
            <AdminTextInput
              id="admin-audience"
              value={metaAudienceLabel}
              onChange={(event) => onChange({ metaAudienceLabel: event.target.value })}
            />
          </label>
        </div>
        <AdminDisclosure title={ADMIN_UI.seoDescriptionLabel} defaultOpen={extrasDeepOpen}>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">{ADMIN_UI.priceFootnoteLabel}</span>
            <AdminTextInput
              id="admin-price-footnote"
              value={priceFootnote}
              onChange={(event) => onChange({ priceFootnote: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">{ADMIN_UI.seoDescriptionLabel}</span>
            <AdminTextArea
              id="admin-seo-description"
              rows={2}
              value={seoDescription}
              onChange={(event) => onChange({ seoDescription: event.target.value })}
            />
          </label>
        </AdminDisclosure>
      </AdminEditorSurface>
    </>
  );
};

export default TourCatalogFields;
