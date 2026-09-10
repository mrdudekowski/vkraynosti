import { AlignLeft, ImageIcon, Images, Plus } from 'lucide-react';
import type { CmsTourDocument } from '../../cms/cmsTourDocument';
import type { TourCoverCrop } from '../../utils/mediaObjectPosition';
import { ADMIN_UI } from '../constants/ui';
import { EDITOR_FOCUS_IDS } from '../tourEditorTabs';
import AdminEditorSurface from './AdminEditorSurface';
import { AdminFieldLabel, AdminTextArea, AdminTextInput } from './AdminFields';
import AdminMediaDropzone from './AdminMediaDropzone';
import CoverCropFields from './CoverCropFields';

type AboutSectionProps = {
  document: CmsTourDocument;
  description: string;
  descriptionLeadBold: string;
  descriptionAside: string;
  coverAssetId: string | null;
  prefaceAssetId: string | null;
  uploading: boolean;
  onDescription: (value: string) => void;
  onLead: (value: string) => void;
  onAside: (value: string) => void;
  onCoverFiles: (files: File[]) => void;
  onPrefaceFiles: (files: File[]) => void;
  coverCrop: TourCoverCrop;
  onCoverCrop: (crop: TourCoverCrop) => void;
  heroPhrase: string;
  onHeroPhrase: (value: string) => void;
};

const PrefacePreview = ({
  stillUrl,
  uploading,
  onFiles,
}: {
  stillUrl: string | null;
  uploading: boolean;
  onFiles: (files: File[]) => void;
}) =>
  stillUrl != null ? (
    <div className="overflow-hidden rounded-card border border-divider">
      <div className="relative h-36 overflow-hidden">
        <img src={stillUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 z-stack-base bg-surface-dark/70" aria-hidden />
        <p className="relative z-10 px-4 py-6 text-sm font-semibold text-text-inverse">
          {ADMIN_UI.aboutHeading}
        </p>
      </div>
      <div className="p-2">
        <AdminMediaDropzone
          id="admin-preface-upload"
          label={ADMIN_UI.changeBackground}
          multiple={false}
          disabled={uploading}
          onFiles={onFiles}
        />
      </div>
    </div>
  ) : (
    <AdminMediaDropzone
      id="admin-preface-upload"
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
  );

const AboutSection = ({
  document,
  description,
  descriptionLeadBold,
  descriptionAside,
  coverAssetId,
  prefaceAssetId,
  uploading,
  onDescription,
  onLead,
  onAside,
  onCoverFiles,
  onPrefaceFiles,
  coverCrop,
  onCoverCrop,
  heroPhrase,
  onHeroPhrase,
}: AboutSectionProps) => {
  const preface = document.assets.find((asset) => asset.id === prefaceAssetId);
  const cover = document.assets.find((asset) => asset.id === coverAssetId);
  const coverMissing = coverAssetId == null || coverAssetId.length === 0;

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:items-start">
      <div className="flex flex-col gap-3">
        <AdminEditorSurface
          icon={ImageIcon}
          title={ADMIN_UI.aboutCoverHeading}
          hint={ADMIN_UI.requiredForPublish}
        >
          <CoverCropFields
            asset={cover}
            crop={coverCrop}
            onChange={onCoverCrop}
            uploading={uploading}
            onFiles={onCoverFiles}
            inputId={EDITOR_FOCUS_IDS.cover}
            missing={coverMissing}
            heroPhrase={heroPhrase}
            onHeroPhrase={onHeroPhrase}
          />
        </AdminEditorSurface>
        <AdminEditorSurface
          icon={Images}
          title={ADMIN_UI.prefaceLabel}
          hint={ADMIN_UI.requiredForPublish}
        >
          <PrefacePreview
            stillUrl={preface?.stillUrl ?? null}
            uploading={uploading}
            onFiles={onPrefaceFiles}
          />
        </AdminEditorSurface>
      </div>
      <AdminEditorSurface
        icon={AlignLeft}
        title={ADMIN_UI.aboutTextHeading}
        hint={ADMIN_UI.aboutColumnsHint}
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">{ADMIN_UI.leadLabel}</span>
            <AdminTextInput
              id="admin-lead"
              value={descriptionLeadBold}
              onChange={(event) => onLead(event.target.value)}
            />
          </div>
          <div
            data-testid="admin-about-columns"
            className="grid gap-3 md:grid-cols-2 md:items-start md:gap-0 md:divide-x md:divide-divider"
          >
            <div className="flex flex-col gap-1 md:pr-3">
              <AdminFieldLabel htmlFor={EDITOR_FOCUS_IDS.description} required>
                {ADMIN_UI.descriptionLabel}
              </AdminFieldLabel>
              <AdminTextArea
                id={EDITOR_FOCUS_IDS.description}
                rows={6}
                value={description}
                hasError={description.trim().length === 0}
                onChange={(event) => onDescription(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 md:pl-3">
              <AdminFieldLabel htmlFor={EDITOR_FOCUS_IDS.aside} required>
                {ADMIN_UI.asideLabel}
              </AdminFieldLabel>
              <AdminTextArea
                id={EDITOR_FOCUS_IDS.aside}
                rows={6}
                value={descriptionAside}
                hasError={descriptionAside.trim().length === 0}
                onChange={(event) => onAside(event.target.value)}
              />
            </div>
          </div>
        </div>
      </AdminEditorSurface>
    </div>
  );
};

export default AboutSection;
