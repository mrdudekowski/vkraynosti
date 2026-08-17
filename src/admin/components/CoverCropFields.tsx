import type { CmsTourAsset } from '../../cms/cmsTourDocument';
import type { TourCoverCrop } from '../../utils/mediaObjectPosition';
import {
  formatMediaFocalPoint,
  parseMediaFocalPoint,
} from '../../utils/mediaObjectPosition';
import { ADMIN_UI } from '../constants/ui';
import AdminAssetPreview from './AdminAssetPreview';
import AdminFocalPoint from './AdminFocalPoint';

type CoverCropFieldsProps = {
  asset: CmsTourAsset | undefined;
  crop: TourCoverCrop;
  onChange: (crop: TourCoverCrop) => void;
};

const FRAMES: Array<{
  key: keyof TourCoverCrop;
  label: string;
  frameClass: string;
}> = [
  { key: 'card', label: ADMIN_UI.coverCropCard, frameClass: 'h-48 w-full max-w-xs' },
  { key: 'hero', label: ADMIN_UI.coverCropHero, frameClass: 'h-64 w-40' },
  { key: 'heroLg', label: ADMIN_UI.coverCropHeroLg, frameClass: 'h-36 w-full max-w-lg' },
];

const CoverCropFields = ({ asset, crop, onChange }: CoverCropFieldsProps) => {
  if (asset == null) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-text-primary">{ADMIN_UI.coverCropHeading}</h3>
      <p className="text-tooltip text-text-muted">{ADMIN_UI.coverCropHint}</p>
      <div className="flex flex-wrap items-start gap-4">
        {FRAMES.map((frame) => {
          const point = crop[frame.key];
          const objectPosition = point != null ? formatMediaFocalPoint(point) : undefined;
          return (
            <div key={frame.key} className="flex flex-col gap-1">
              <p className="text-sm font-medium text-text-primary">{frame.label}</p>
              <div className={`${frame.frameClass} overflow-hidden rounded-card border border-divider`}>
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
                    className="h-full w-full"
                    objectPosition={objectPosition}
                  />
                </AdminFocalPoint>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoverCropFields;
