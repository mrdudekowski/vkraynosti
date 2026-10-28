import ScrollScrubFade from '../shared/ScrollScrubFade';
import { UI } from '../../constants/ui';

type RecoverableErrorCopy = {
  title: string;
  message: string;
  retryButton: string;
};

interface RecoverableErrorViewProps {
  onRetry: () => void;
  copy?: RecoverableErrorCopy;
}

const RecoverableErrorView = ({
  onRetry,
  copy = UI.errorFallback,
}: RecoverableErrorViewProps) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-surface-light px-4">
    <div className="max-w-md w-full text-center">
      <ScrollScrubFade as="h1" className="font-heading text-section font-normal text-text-primary mb-3">
        {copy.title}
      </ScrollScrubFade>
      <p className="text-text-muted mb-8 leading-relaxed">
        {copy.message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="btn-primary"
      >
        {copy.retryButton}
      </button>
    </div>
  </div>
);

export default RecoverableErrorView;
