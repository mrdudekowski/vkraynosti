import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { UI } from '../../constants/ui';

interface TelegramMiniAppHeaderProps {
  title: string;
  backTo?: string;
}

const TelegramMiniAppHeader = ({ title, backTo }: TelegramMiniAppHeaderProps) => (
  <header className="sticky top-0 z-navbar border-b border-divider bg-surface-light/95 px-4 py-3 backdrop-blur-sm">
    <div className="mx-auto flex max-w-lg items-center gap-3">
      {backTo != null ? (
        <Link
          to={backTo}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-primary no-underline"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" aria-hidden />
          {UI.telegramMiniApp.back}
        </Link>
      ) : (
        <span className="w-16 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate font-body text-sm font-semibold text-text-primary">{title}</p>
      </div>
      <span className="w-16 shrink-0" aria-hidden />
    </div>
  </header>
);

export default TelegramMiniAppHeader;
