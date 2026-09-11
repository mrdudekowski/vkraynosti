import { ADMIN_UI } from '../constants/ui';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';
import AdminStatus from './AdminStatus';

type TourPublishReviewDialogProps = {
  title: string;
  season: string;
  publicHref?: string;
  visibilityLabel: string;
  readinessLabel: string;
  hasUnpublishedChanges: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const TourPublishReviewDialog = ({
  title,
  season,
  publicHref,
  visibilityLabel,
  readinessLabel,
  hasUnpublishedChanges,
  onConfirm,
  onClose,
}: TourPublishReviewDialogProps) => (
  <AdminDialog
    title={ADMIN_UI.publishReviewTitle}
    titleId="admin-publish-review-title"
    closeLabel={ADMIN_UI.cancel}
    size="lg"
    onClose={onClose}
  >
    <p className="text-sm text-text-muted">{ADMIN_UI.publishReviewIntro}</p>
    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="min-w-0 rounded-card border border-divider bg-surface-light p-3">
        <dt className="text-tooltip text-text-muted">{ADMIN_UI.publishReviewTour}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-text-primary">{title}</dd>
      </div>
      <div className="rounded-card border border-divider bg-surface-light p-3">
        <dt className="text-tooltip text-text-muted">{ADMIN_UI.publishReviewSeason}</dt>
        <dd className="mt-1 text-sm font-semibold text-text-primary">{season}</dd>
      </div>
      <div className="rounded-card border border-divider bg-surface-light p-3">
        <dt className="text-tooltip text-text-muted">{ADMIN_UI.publishReviewVisibility}</dt>
        <dd className="mt-1">
          <AdminStatus level="primary" tone="success">
            {visibilityLabel}
          </AdminStatus>
        </dd>
      </div>
      <div className="rounded-card border border-divider bg-surface-light p-3">
        <dt className="text-tooltip text-text-muted">{ADMIN_UI.publishReviewReadiness}</dt>
        <dd className="mt-1 text-sm font-semibold text-text-primary">{readinessLabel}</dd>
      </div>
    </dl>
    <div className="mt-4 rounded-card border border-divider bg-surface-light p-3 text-sm text-text-muted">
      <p className="font-semibold text-text-primary">{ADMIN_UI.publishReviewOutcome}</p>
      <p className="mt-1">{ADMIN_UI.publishReviewOutcomeBody}</p>
      {hasUnpublishedChanges ? <p className="mt-1">{ADMIN_UI.publishReviewUnsaved}</p> : null}
      {publicHref != null ? (
        <p className="mt-1 break-all text-text-primary">
          {ADMIN_UI.publishReviewAddress}: {publicHref}
        </p>
      ) : null}
    </div>
    <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
      <AdminButton type="button" variant="secondary" onClick={onClose}>
        {ADMIN_UI.cancel}
      </AdminButton>
      <AdminButton type="button" variant="publish" onClick={onConfirm}>
        {ADMIN_UI.publishReviewConfirm}
      </AdminButton>
    </div>
  </AdminDialog>
);

export default TourPublishReviewDialog;
