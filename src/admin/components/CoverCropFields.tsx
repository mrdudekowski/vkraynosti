import { useState, type KeyboardEvent } from 'react';
import { Image, Monitor, Plus, Smartphone, Tablet, type LucideIcon } from 'lucide-react';
import type { CmsTourAsset } from '../../cms/cmsTourDocument';
import type { TourCoverCrop } from '../../utils/mediaObjectPosition';
import {
  formatMediaFocalPoint,
  parseMediaFocalPoint,
} from '../../utils/mediaObjectPosition';
import { ADMIN_UI } from '../constants/ui';
import AdminAssetPreview from './AdminAssetPreview';
import AdminCharCount from './AdminCharCount';
import AdminFocalPoint from './AdminFocalPoint';
import AdminHeroCoverCaption from './AdminHeroCoverCaption';
import AdminIcon from './AdminIcon';
import AdminMediaDropzone from './AdminMediaDropzone';
import { AdminFieldLabel, AdminTextInput } from './AdminFields';
import { EDITOR_FOCUS_IDS } from '../tourEditorTabs';
import { ADMIN_EDITOR_SHORT_TEXT_MAX } from '../../constants/adminUiTokens';

type CoverCropFrameKey = keyof TourCoverCrop;

type CoverCropFieldsProps = {
  asset: CmsTourAsset | undefined;
  crop: TourCoverCrop;
  onChange: (crop: TourCoverCrop) => void;
  uploading: boolean;
  onFiles: (files: File[]) => void;
  inputId: string;
  missing?: boolean;
  heroPhrase: string;
  onHeroPhrase: (value: string) => void;
};

const FRAMES: Array<{
  key: CoverCropFrameKey;
  label: string;
  icons: readonly LucideIcon[];
  frameClass: string;
  heroGutter?: 'phone' | 'lg';
}> = [
  {
    key: 'card',
    label: ADMIN_UI.coverCropCard,
    icons: [Image],
    frameClass: 'mx-auto w-full max-w-tour-card aspect-tour-card-cover',
  },
  {
    key: 'hero',
    label: ADMIN_UI.coverCropHero,
    icons: [Smartphone],
    frameClass: 'mx-auto w-full max-w-tour-cover-preview-phone aspect-tour-hero-phone',
    heroGutter: 'phone',
  },
  {
    key: 'heroLg',
    label: ADMIN_UI.coverCropHeroLg,
    icons: [Monitor, Tablet],
    frameClass: 'w-full aspect-tour-hero-lg',
    heroGutter: 'lg',
  },
];

const HeroPhraseField = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    <span className="flex items-baseline justify-between gap-2">
      <AdminFieldLabel htmlFor={EDITOR_FOCUS_IDS.heroPhrase} required>
        {ADMIN_UI.heroPhraseLabel}
      </AdminFieldLabel>
      <AdminCharCount value={value} max={ADMIN_EDITOR_SHORT_TEXT_MAX} />
    </span>
    <AdminTextInput
      id={EDITOR_FOCUS_IDS.heroPhrase}
      value={value}
      hasError={value.trim().length === 0}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

const CoverCropFields = ({
  asset,
  crop,
  onChange,
  uploading,
  onFiles,
  inputId,
  missing = false,
  heroPhrase,
  onHeroPhrase,
}: CoverCropFieldsProps) => {
  const [selectedKey, setSelectedKey] = useState<CoverCropFrameKey>('card');
  const selectedFrame = FRAMES.find((frame) => frame.key === selectedKey) ?? FRAMES[0];

  const moveTo = (key: CoverCropFrameKey) => {
    setSelectedKey(key);
    window.requestAnimationFrame(() => {
      window.document.getElementById(`admin-cover-crop-tab-${key}`)?.focus();
    });
  };

  const onTabListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = FRAMES.findIndex((frame) => frame.key === selectedKey);
    if (index < 0) {
      return;
    }
    let nextIndex = index;
    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % FRAMES.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + FRAMES.length) % FRAMES.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = FRAMES.length - 1;
    } else {
      return;
    }
    const next = FRAMES[nextIndex];
    if (next == null) {
      return;
    }
    event.preventDefault();
    moveTo(next.key);
  };

  if (asset == null) {
    return (
      <div className="flex flex-col gap-2">
        <div className={missing ? 'admin-row-warning p-2' : undefined}>
          <AdminMediaDropzone
            id={inputId}
            label={ADMIN_UI.dropOneMedia}
            multiple={false}
            disabled={uploading}
            onFiles={onFiles}
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={16} strokeWidth={1.75} aria-hidden />
              {ADMIN_UI.addPhoto}
            </span>
          </AdminMediaDropzone>
        </div>
        <HeroPhraseField value={heroPhrase} onChange={onHeroPhrase} />
      </div>
    );
  }

  const point = crop[selectedFrame.key];
  const objectPosition = point != null ? formatMediaFocalPoint(point) : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div
        role="tablist"
        aria-label={ADMIN_UI.coverCropHeading}
        className="flex gap-1 overflow-x-auto overscroll-x-contain pb-1"
        onKeyDown={onTabListKeyDown}
      >
        {FRAMES.map((frame) => {
          const selected = frame.key === selectedKey;
          return (
            <button
              key={frame.key}
              type="button"
              role="tab"
              id={`admin-cover-crop-tab-${frame.key}`}
              aria-selected={selected}
              aria-controls={`admin-cover-crop-panel-${frame.key}`}
              tabIndex={selected ? 0 : -1}
              className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-admin-control px-3 py-2 text-sm ${
                selected ? 'admin-nav-active' : 'admin-nav-item'
              }`}
              onClick={() => setSelectedKey(frame.key)}
            >
              <span className="inline-flex items-center gap-0.5">
                {frame.icons.map((icon, iconIndex) => (
                  <AdminIcon key={iconIndex} icon={icon} size={16} />
                ))}
              </span>
              {frame.label}
            </button>
          );
        })}
      </div>
      <p className="text-tooltip text-text-muted">{ADMIN_UI.coverCropHint}</p>
      {FRAMES.map((frame) => {
        const selected = frame.key === selectedKey;
        return (
          <div
            key={frame.key}
            role="tabpanel"
            id={`admin-cover-crop-panel-${frame.key}`}
            aria-labelledby={`admin-cover-crop-tab-${frame.key}`}
            hidden={!selected}
          >
            {selected ? (
              <div
                className={`relative ${frame.frameClass} overflow-hidden rounded-card border border-divider`}
              >
                <AdminFocalPoint
                  objectPosition={objectPosition}
                  onChange={(next) => {
                    const parsed = parseMediaFocalPoint(next);
                    if (parsed == null) {
                      return;
                    }
                    onChange({ ...crop, [frame.key]: parsed });
                  }}
                >
                  <AdminAssetPreview
                    asset={asset}
                    play={false}
                    objectPosition={objectPosition}
                  />
                </AdminFocalPoint>
                {frame.heroGutter != null ? (
                  <AdminHeroCoverCaption phrase={heroPhrase} gutter={frame.heroGutter} />
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
      <HeroPhraseField value={heroPhrase} onChange={onHeroPhrase} />
      <AdminMediaDropzone
        id={inputId}
        label={ADMIN_UI.changePhoto}
        multiple={false}
        disabled={uploading}
        onFiles={onFiles}
      />
    </div>
  );
};

export default CoverCropFields;
