import AdminDialog from './AdminDialog';
import AdminButton from './AdminButton';

type MediaConversionModalProps = {
  open: boolean;
  progress: number;
  error?: 'conversion' | 'upload' | null;
  onRetry?: () => void;
  onClose?: () => void;
};

const COPY = {
  title: 'Конвертирую неведомый формат в православный JPG',
  hint: 'Не закрывайте окно',
  conversionError: 'Не удалось преобразовать изображение',
  uploadError: 'Не удалось загрузить изображение',
  retry: 'Попробовать ещё раз',
  progressLabel: 'Прогресс конвертации изображения',
  close: 'Закрыть окно конвертации',
} as const;

const MediaConversionModal = ({
  open,
  progress,
  error = null,
  onRetry,
  onClose,
}: MediaConversionModalProps) => {
  if (!open) return null;
  const value = Math.max(0, Math.min(100, Math.round(progress)));
  const failed = error != null;
  return (
    <AdminDialog
      title={failed ? (error === 'conversion' ? COPY.conversionError : COPY.uploadError) : COPY.title}
      titleId="admin-media-conversion-title"
      closeLabel={COPY.close}
      onClose={failed ? (onClose ?? (() => undefined)) : (() => undefined)}
    >
      {failed ? (
        <div className="flex flex-col gap-3" role="alert">
          <p className="text-sm text-text-muted">{COPY.title}</p>
          {onRetry != null ? (
            <AdminButton type="button" onClick={onRetry}>
              {COPY.retry}
            </AdminButton>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <progress
            className="h-2 w-full accent-accent"
            max={100}
            value={value}
            aria-label={COPY.progressLabel}
          />
          <div className="flex items-center justify-between gap-3 text-sm text-text-muted">
            <span>{COPY.hint}</span>
            <span aria-live="polite">{value}%</span>
          </div>
        </div>
      )}
    </AdminDialog>
  );
};

export default MediaConversionModal;
