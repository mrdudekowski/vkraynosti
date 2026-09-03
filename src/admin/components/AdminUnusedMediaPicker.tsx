import type { CmsTourAsset } from '../../cms/cmsTourDocument';
import { cmsAssetHasVideo } from '../cmsAssetHasVideo';
import { ADMIN_UI } from '../constants/ui';
import AdminAssetPreview, { AdminVideoBadge } from './AdminAssetPreview';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';
import AdminEmptyState from './AdminEmptyState';
import AdminMediaDropzone from './AdminMediaDropzone';

type AdminUnusedMediaPickerProps = {
  assets: CmsTourAsset[];
  onSelect: (assetId: string) => void;
  onUploadFiles?: (files: File[]) => void;
  uploading?: boolean;
  uploadProgress?: { completed: number; total: number } | null;
  onClose: () => void;
};

const AdminUnusedMediaPicker = ({ assets, onSelect, onUploadFiles, uploading = false, uploadProgress = null, onClose }: AdminUnusedMediaPickerProps) => (
  <AdminDialog
    title={ADMIN_UI.pickUnusedTitle}
    titleId="admin-unused-media-title"
    closeLabel={ADMIN_UI.closePicker}
    onClose={onClose}
  >
    {assets.length === 0 ? (
      <AdminEmptyState title={ADMIN_UI.pickUnusedEmpty} />
    ) : (
      <ul className="flex flex-wrap gap-2">
        {assets.map((asset) => (
          <li key={asset.id} className="w-24">
            <button
              type="button"
              className="relative min-h-11 w-full overflow-hidden rounded-admin-control border border-divider"
              aria-label={asset.alt || asset.id}
              onClick={() => onSelect(asset.id)}
            >
              <AdminAssetPreview asset={asset} play={false} className="aspect-square w-full" />
              {cmsAssetHasVideo(asset) ? <AdminVideoBadge /> : null}
            </button>
          </li>
        ))}
      </ul>
    )}
    {onUploadFiles ? (
      <>
      {uploadProgress != null ? (
        <p className="mb-2 text-sm text-text-muted" role="status">
          {ADMIN_UI.uploadProgress(uploadProgress.completed, uploadProgress.total)}
        </p>
      ) : null}
      <AdminMediaDropzone
        id="cms-slot-upload"
        label={ADMIN_UI.addMedia}
        disabled={uploading}
        onFiles={onUploadFiles}
      >
        <span className="admin-btn-secondary inline-flex min-h-11 items-center justify-center px-3">
          {ADMIN_UI.addMedia}
        </span>
      </AdminMediaDropzone>
      </>
    ) : null}
    <AdminButton type="button" variant="ghost" className="mt-4" onClick={onClose}>
      {ADMIN_UI.closePicker}
    </AdminButton>
  </AdminDialog>
);

export default AdminUnusedMediaPicker;
