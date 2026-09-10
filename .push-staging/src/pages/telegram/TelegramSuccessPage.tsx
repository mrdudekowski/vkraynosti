import { Link, Navigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons/faCalendarDays';
import { faComments } from '@fortawesome/free-solid-svg-icons/faComments';
import { faSuitcase } from '@fortawesome/free-solid-svg-icons/faSuitcase';
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import { UI } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';
import { SITE_URL } from '../../constants/contacts';
import TelegramMiniAppShell from '../../components/telegram/TelegramMiniAppShell';
import type { TelegramSuccessLocationState } from './TelegramRequestPage';

const TelegramSuccessPage = () => {
  const location = useLocation();
  const state = location.state as TelegramSuccessLocationState | null;

  if (state == null) {
    return <Navigate to={ROUTES.TELEGRAM} replace />;
  }

  return (
    <TelegramMiniAppShell>
      <div className="mx-auto max-w-lg px-4 pb-10 pt-8 text-center">
        <div className="relative mb-6 overflow-hidden rounded-card bg-seasonBg-summer px-6 py-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/40 to-surface-light" />
          <div className="relative">
            <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-secondary text-2xl text-brand-primary">
              ✓
            </span>
            <h1 className="font-heading text-2xl text-brand-primary">
              {UI.telegramMiniApp.successTitle}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              {UI.telegramMiniApp.successMessage}
            </p>
          </div>
        </div>

        <article className="rounded-card border border-divider bg-brand-accent p-4 text-left shadow-tourIncludedPanel">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faSuitcase} className="text-brand-primary" aria-hidden />
              <dt className="text-text-muted">{UI.telegramMiniApp.successTourLabel}</dt>
              <dd className="ml-auto font-semibold text-brand-primary">{state.tourTitle}</dd>
            </div>
            {state.departureDateLabel != null && (
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faCalendarDays} className="text-brand-primary" aria-hidden />
                <dt className="text-text-muted">{UI.telegramMiniApp.successDateLabel}</dt>
                <dd className="ml-auto font-semibold text-brand-primary">
                  {state.departureDateLabel}
                </dd>
              </div>
            )}
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faUsers} className="text-brand-primary" aria-hidden />
              <dt className="text-text-muted">{UI.telegramMiniApp.successPartyLabel}</dt>
              <dd className="ml-auto font-semibold text-brand-primary">{state.partySize}</dd>
            </div>
          </dl>
        </article>

        <div className="mt-6 space-y-3">
          <Link to={ROUTES.TELEGRAM} className="btn-primary w-full justify-center no-underline">
            {UI.telegramMiniApp.browseMoreTours}
          </Link>
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full border border-brand-primary bg-brand-accent px-6 py-3 text-sm font-semibold text-brand-primary no-underline"
          >
            {UI.telegramMiniApp.openWebsite}
          </a>
        </div>

        <p className="mt-6 inline-flex items-center justify-center gap-2 text-sm text-text-muted">
          <FontAwesomeIcon icon={faComments} aria-hidden />
          {UI.telegramMiniApp.managerWillContact}
        </p>
      </div>
    </TelegramMiniAppShell>
  );
};

export default TelegramSuccessPage;
