import { UI } from '../../constants/ui';
import type { CmsTourDocument } from '../../cms/cmsTourDocument';
import type { CmsTourTextPatch } from '../../cms/applyTourTextPatch';
import { ADMIN_UI } from '../constants/ui';
import { AdminTextArea, AdminTextInput } from './AdminFields';
import AdminSelect from './AdminSelect';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert'] as const;

function isTourDifficulty(value: string): value is CmsTourDocument['difficulty'] {
  return (DIFFICULTIES as readonly string[]).includes(value);
}

type TourCatalogFieldsProps = {
  subtitle: string;
  heroPhrase: string;
  duration: string;
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
  heroPhrase,
  duration,
  difficulty,
  difficultyDisplayLabel,
  metaAudienceLabel,
  price,
  pricePrevious,
  priceFootnote,
  seoDescription,
  onChange,
}: TourCatalogFieldsProps) => (
  <section className="flex max-w-3xl flex-col gap-3 rounded-card border border-divider bg-surface-light p-3">
    <h2 className="text-base font-semibold text-text-primary">{ADMIN_UI.catalogHeading}</h2>
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text-primary">{ADMIN_UI.subtitleLabel}</span>
      <AdminTextInput
        id="admin-subtitle"
        value={subtitle}
        onChange={(event) => onChange({ subtitle: event.target.value })}
      />
    </label>
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text-primary">{ADMIN_UI.heroPhraseLabel}</span>
      <AdminTextInput
        id="admin-hero-phrase"
        value={heroPhrase}
        onChange={(event) => onChange({ heroPhrase: event.target.value })}
      />
    </label>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.durationLabel}</span>
        <AdminTextInput
          id="admin-duration"
          value={duration}
          onChange={(event) => onChange({ duration: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.difficultyLabel}</span>
        <AdminSelect
          id="admin-difficulty"
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
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.priceLabel}</span>
        <AdminTextInput
          id="admin-price"
          value={price}
          onChange={(event) => onChange({ price: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.pricePreviousLabel}</span>
        <AdminTextInput
          id="admin-price-previous"
          value={pricePrevious}
          onChange={(event) => onChange({ pricePrevious: event.target.value })}
        />
      </label>
    </div>
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text-primary">{ADMIN_UI.difficultyDisplayLabel}</span>
      <AdminTextInput
        id="admin-difficulty-display"
        value={difficultyDisplayLabel}
        onChange={(event) => onChange({ difficultyDisplayLabel: event.target.value })}
      />
    </label>
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text-primary">{ADMIN_UI.audienceLabel}</span>
      <AdminTextInput
        id="admin-audience"
        value={metaAudienceLabel}
        onChange={(event) => onChange({ metaAudienceLabel: event.target.value })}
      />
    </label>
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
        rows={3}
        value={seoDescription}
        onChange={(event) => onChange({ seoDescription: event.target.value })}
      />
    </label>
  </section>
);

export default TourCatalogFields;
