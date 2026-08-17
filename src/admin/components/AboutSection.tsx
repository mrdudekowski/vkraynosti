import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import type { CmsTourDocument } from '../../cms/cmsTourDocument';
import { getTourCoverCardImgObjectClass } from '../../constants/tourCoverCropByCanonicalId';
import type { TourCoverCrop } from '../../utils/mediaObjectPosition';
import { ADMIN_UI } from '../constants/ui';
import { AdminTextArea, AdminTextInput } from './AdminFields';
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
};

const MediaPreview = ({
  id,
  label,
  stillUrl,
  objectClass,
  scrim,
  uploading,
  onFiles,
}: {
  id: string;
  label: string;
  stillUrl: string | null;
  objectClass?: string;
  scrim?: boolean;
  uploading: boolean;
  onFiles: (files: File[]) => void;
}) => (
  <div className="flex flex-col gap-1">
    <p className="text-sm font-medium text-text-primary">{label}</p>
    {stillUrl != null ? (
      <div className="max-w-sm overflow-hidden rounded-card border border-divider">
        <div className="relative h-48 overflow-hidden">
          <img
            src={stillUrl}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover ${objectClass ?? ''}`.trim()}
          />
          {scrim ? (
            <>
              <div className="absolute inset-0 z-stack-base bg-surface-dark/70" aria-hidden />
              <p className="relative z-10 px-4 py-6 text-sm font-semibold text-text-inverse">
                {ADMIN_UI.aboutHeading}
              </p>
            </>
          ) : null}
        </div>
        <div className="p-2">
          <AdminMediaDropzone
            id={id}
            label={ADMIN_UI.changePhoto}
            multiple={false}
            disabled={uploading}
            onFiles={onFiles}
          />
        </div>
      </div>
    ) : (
      <AdminMediaDropzone
        id={id}
        label={ADMIN_UI.dropOneMedia}
        multiple={false}
        disabled={uploading}
        onFiles={onFiles}
      >
        <span className="inline-flex items-center gap-2">
          <FontAwesomeIcon icon={faPlus} aria-hidden />
          {ADMIN_UI.addPhoto}
        </span>
      </AdminMediaDropzone>
    )}
  </div>
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
}: AboutSectionProps) => {
  const preface = document.assets.find((asset) => asset.id === prefaceAssetId);
  const cover = document.assets.find((asset) => asset.id === coverAssetId);
  const coverObjectClass = getTourCoverCardImgObjectClass(document.id);

  return (
    <section className="flex flex-col gap-3 rounded-card border border-divider bg-surface-light p-3">
      <h2 className="text-base font-semibold text-text-primary">{ADMIN_UI.aboutHeading}</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        <MediaPreview
          id="admin-cover-upload"
          label={ADMIN_UI.coverLabel}
          stillUrl={cover?.stillUrl ?? null}
          objectClass={coverObjectClass ?? undefined}
          uploading={uploading}
          onFiles={onCoverFiles}
        />
        <MediaPreview
          id="admin-preface-upload"
          label={ADMIN_UI.prefaceLabel}
          stillUrl={preface?.stillUrl ?? null}
          scrim
          uploading={uploading}
          onFiles={onPrefaceFiles}
        />
      </div>
      <CoverCropFields asset={cover} crop={coverCrop} onChange={onCoverCrop} />
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.leadLabel}</span>
        <AdminTextInput
          id="admin-lead"
          value={descriptionLeadBold}
          onChange={(event) => onLead(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.descriptionLabel}</span>
        <AdminTextArea
          id="admin-description"
          rows={5}
          value={description}
          onChange={(event) => onDescription(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.asideLabel}</span>
        <AdminTextArea
          id="admin-aside"
          rows={3}
          value={descriptionAside}
          onChange={(event) => onAside(event.target.value)}
        />
      </label>
    </section>
  );
};

export default AboutSection;
