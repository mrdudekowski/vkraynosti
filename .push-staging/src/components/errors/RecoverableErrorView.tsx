import ScrollScrubFade from '../shared/ScrollScrubFade';
import { UI } from '../../constants/ui';

interface RecoverableErrorViewProps {
  onRetry: () => void;
}

const RecoverableErrorView = ({ onRetry }: RecoverableErrorViewProps) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-surface-light px-4">
    <div className="max-w-md w-full text-center">
      <ScrollScrubFade as="h1" className="font-heading text-section font-normal text-text-primary mb-3">
        {UI.errorFallback.title}
      </ScrollScrubFade>
      <p className="text-text-muted mb-8 leading-relaxed">
        {UI.errorFallback.message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="btn-primary"
      >
        {UI.errorFallback.retryButton}
      </button>
    </div>
  </div>
);

export default RecoverableErrorView;
