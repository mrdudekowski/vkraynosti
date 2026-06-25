import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons/faCalendarDays';
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock';
import { faMountain } from '@fortawesome/free-solid-svg-icons/faMountain';
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { faPen } from '@fortawesome/free-solid-svg-icons/faPen';
import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import type { Season } from '../../types';
import { UI } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';
import {
  buildTelegramTourPath,
  TELEGRAM_MINI_APP_SOURCE,
} from '../../constants/telegramMiniApp';
import { TOUR_REQUEST_MAX_PARTY_SIZE } from '../../data/tourRequestFormFields';
import { findTourBySeasonAndSegment } from '../../data/tourLookup';
import { getTourCoverCardImgObjectClass } from '../../constants/tourCoverCropByCanonicalId';
import TelegramMiniAppHeader from '../../components/telegram/TelegramMiniAppHeader';
import TelegramMiniAppShell from '../../components/telegram/TelegramMiniAppShell';
import PlaceholderImage from '../../components/shared/PlaceholderImage';
import { useTourDisplayDuration } from '../../hooks/useTourDisplayDuration';
import { useTourRequestModalSteps } from '../../hooks/useTourRequestModalSteps';
import { useTourSchedule } from '../../hooks/useTourSchedule';
import { getTelegramUser } from '../../lib/telegram/getTelegramUser';
import { sendTourRequestLead, TourRequestLeadError } from '../../services/sendTourRequestLead';
import { resolveTourDifficultyLabel } from '../../utils/tourDifficultyLabel';
import { buildTourDepartureCalendarModel } from '../../utils/tourSchedule/buildTourDepartureCalendarModel';
import { formatTourDepartureLabel } from '../../utils/telegramMiniApp';
import { parseIsoDate } from '../../utils/tourSchedule/parseIsoDate';
import {
  createTourRequestFormSchema,
  type TourRequestFormInput,
} from '../../validation/tourRequestSchema';

interface TelegramRequestLocationState {
  preferredDepartureDateIso?: string;
}

export interface TelegramSuccessLocationState {
  tourTitle: string;
  departureDateLabel: string | null;
  partySize: number;
}

const parseSeasonParam = (value: string | undefined): Season | null => {
  if (value === 'winter' || value === 'spring' || value === 'summer' || value === 'fall') {
    return value;
  }
  return null;
};

const buildInitialFormValues = (
  initialDepartureDateIso: string,
  preferredName: string,
): TourRequestFormInput => ({
  name: preferredName,
  preferredMessenger: 'telegram',
  email: '',
  phone: '',
  partySize: '2',
  withChildren: false,
  question: '',
  privacyAccepted: true,
  preferredDepartureDate: initialDepartureDateIso,
});

const TelegramRequestPage = () => {
  const { season: seasonParam, tourId: tourSegment } = useParams();
  const season = parseSeasonParam(seasonParam);
  const tour =
    season != null && tourSegment != null
      ? findTourBySeasonAndSegment(season, tourSegment)
      : undefined;
  const location = useLocation();
  const navigate = useNavigate();
  const requestState = (location.state as TelegramRequestLocationState | null) ?? null;
  const { events, durationTypes } = useTourSchedule();
  const { displayDuration } = useTourDisplayDuration(tour ?? { id: '', duration: '' });

  const departureModel = useMemo(() => {
    if (tour == null) {
      return null;
    }
    const tourEvents = events.filter(event => event.tourId === tour.id);
    return buildTourDepartureCalendarModel(tour.id, tourEvents);
  }, [events, tour]);

  const { requiresDepartureDate, initialDepartureDateIso } = useTourRequestModalSteps({
    futureDepartureCount: departureModel?.futureDates.length ?? 0,
    preferredDepartureDateIso: requestState?.preferredDepartureDateIso,
    soleFutureDepartureDateIso: departureModel?.futureDates[0],
  });

  const telegramUser = useMemo(() => getTelegramUser(), []);
  const preferredName =
    telegramUser?.telegramFirstName?.trim() ??
    telegramUser?.telegramUsername?.trim() ??
    '';

  const [formValues, setFormValues] = useState<TourRequestFormInput>(() =>
    buildInitialFormValues(initialDepartureDateIso, preferredName),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = useMemo(
    () => createTourRequestFormSchema(requiresDepartureDate),
    [requiresDepartureDate],
  );

  if (tour == null || season == null) {
    return (
      <TelegramMiniAppShell>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="font-heading text-xl text-text-primary">{UI.telegramMiniApp.notFoundTour}</p>
          <Link to={ROUTES.TELEGRAM} className="btn-primary mt-6 inline-flex no-underline">
            {UI.telegramMiniApp.backToCatalog}
          </Link>
        </div>
      </TelegramMiniAppShell>
    );
  }

  const difficultyLabel = resolveTourDifficultyLabel(tour);
  const selectedDateLabel = formatTourDepartureLabel(formValues.preferredDepartureDate);
  const tourDuration = durationTypes.get(tour.id);

  const updateField = <K extends keyof TourRequestFormInput>(
    key: K,
    value: TourRequestFormInput[K],
  ) => {
    setFormValues(current => ({ ...current, [key]: value }));
    setFieldErrors(current => {
      if (!(key in current)) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const adjustPartySize = (delta: number) => {
    const current = Number.parseInt(formValues.partySize || '1', 10);
    const next = Math.min(
      TOUR_REQUEST_MAX_PARTY_SIZE,
      Math.max(1, Number.isFinite(current) ? current + delta : 1),
    );
    updateField('partySize', String(next));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const parsed = formSchema.safeParse(formValues);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const nextErrors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(flat.fieldErrors)) {
        if (Array.isArray(messages) && messages[0]) {
          nextErrors[key] = messages[0];
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await sendTourRequestLead(
        {
          tourId: tour.id,
          title: tour.title,
          subtitle: tour.subtitle,
          season: tour.season,
          ...(tourDuration != null ? { tourDuration } : {}),
          preferredDepartureDateIso:
            parsed.data.preferredDepartureDate != null &&
            parsed.data.preferredDepartureDate.length > 0
              ? parsed.data.preferredDepartureDate
              : undefined,
        },
        parsed.data,
        {
          telegramUser,
          source: TELEGRAM_MINI_APP_SOURCE,
        },
      );

      const successState: TelegramSuccessLocationState = {
        tourTitle: tour.title,
        departureDateLabel: formatTourDepartureLabel(parsed.data.preferredDepartureDate),
        partySize: parsed.data.partySize,
      };
      navigate(ROUTES.TELEGRAM_SUCCESS, { state: successState });
    } catch (error) {
      setSubmitError(
        error instanceof TourRequestLeadError
          ? UI.tourRequestModal.submitError
          : UI.tourRequestModal.submitError,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TelegramMiniAppShell season={tour.season}>
      <TelegramMiniAppHeader
        title={UI.telegramMiniApp.requestPageTitle}
        backTo={buildTelegramTourPath(tour)}
      />
      <form className="mx-auto max-w-lg space-y-5 px-4 pb-8 pt-4" onSubmit={handleSubmit}>
        <article className="rounded-card border border-divider bg-white p-4 shadow-tourIncludedPanel">
          <div className="flex gap-3">
            <PlaceholderImage
              src={tour.imageUrl}
              alt=""
              className="h-20 w-24 shrink-0 overflow-hidden rounded-card"
              imgClassName={getTourCoverCardImgObjectClass(tour.id)}
              loading="lazy"
            />
            <div className="min-w-0">
              <p className="text-xs text-text-muted">{UI.telegramMiniApp.selectedTourLabel}</p>
              <h1 className="font-heading text-lg text-brand-primary">{tour.title}</h1>
              <div className="mt-2 space-y-1 text-xs text-text-muted">
                {displayDuration.length > 0 && (
                  <p className="inline-flex items-center gap-1">
                    <FontAwesomeIcon icon={faClock} aria-hidden />
                    {displayDuration}
                  </p>
                )}
                <p className="inline-flex items-center gap-1">
                  <FontAwesomeIcon icon={faMountain} aria-hidden />
                  {difficultyLabel}
                </p>
                {selectedDateLabel != null && (
                  <p className="inline-flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendarDays} aria-hidden />
                    {selectedDateLabel}
                  </p>
                )}
              </div>
            </div>
          </div>
        </article>

        <section>
          <h2 className="mb-3 font-heading text-xl text-brand-primary">
            {UI.telegramMiniApp.requestSectionHeading}
          </h2>

          <div className="space-y-3">
            {requiresDepartureDate && (
              <label className="block rounded-card border border-divider bg-white p-4 shadow-tourIncludedPanel">
                <span className="mb-2 inline-flex items-center gap-2 text-sm text-text-muted">
                  <FontAwesomeIcon icon={faCalendarDays} aria-hidden />
                  {UI.tourRequestModal.departureDateLabel}
                </span>
                <select
                  className="w-full border-0 bg-transparent font-body text-base text-text-primary outline-none"
                  value={formValues.preferredDepartureDate ?? ''}
                  onChange={event => updateField('preferredDepartureDate', event.target.value)}
                >
                  <option value="">{UI.tourRequestModal.errors.departureDateRequired}</option>
                  {(departureModel?.futureDates ?? []).map(iso => (
                    <option key={iso} value={iso}>
                      {format(parseIsoDate(iso), 'd MMMM yyyy', { locale: ru })}
                    </option>
                  ))}
                </select>
                {fieldErrors.preferredDepartureDate != null && (
                  <p className="mt-2 text-sm text-difficulty-hard-fg">
                    {fieldErrors.preferredDepartureDate}
                  </p>
                )}
              </label>
            )}

            <label className="block rounded-card border border-divider bg-white p-4 shadow-tourIncludedPanel">
              <span className="mb-2 inline-flex items-center gap-2 text-sm text-text-muted">
                <FontAwesomeIcon icon={faUser} aria-hidden />
                {UI.tourRequestModal.nameLabel}
              </span>
              <input
                type="text"
                autoComplete="name"
                className="w-full border-0 bg-transparent font-body text-base text-text-primary outline-none"
                value={formValues.name}
                onChange={event => updateField('name', event.target.value)}
              />
              {fieldErrors.name != null && (
                <p className="mt-2 text-sm text-difficulty-hard-fg">{fieldErrors.name}</p>
              )}
            </label>

            <label className="block rounded-card border border-divider bg-white p-4 shadow-tourIncludedPanel">
              <span className="mb-2 inline-flex items-center gap-2 text-sm text-text-muted">
                <FontAwesomeIcon icon={faPhone} aria-hidden />
                {UI.tourRequestModal.phoneLabel}
              </span>
              <input
                type="tel"
                autoComplete="tel"
                placeholder={UI.tourRequestModal.phonePlaceholder}
                className="w-full border-0 bg-transparent font-body text-base text-text-primary outline-none"
                value={formValues.phone}
                onChange={event => updateField('phone', event.target.value)}
              />
              {fieldErrors.phone != null && (
                <p className="mt-2 text-sm text-difficulty-hard-fg">{fieldErrors.phone}</p>
              )}
            </label>

            <div className="rounded-card border border-divider bg-white p-4 shadow-tourIncludedPanel">
              <p className="mb-3 text-sm text-text-muted">{UI.tourRequestModal.partySizeLabel}</p>
              <div className="inline-flex items-center gap-4 rounded-full bg-brand-accent px-3 py-2">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-primary"
                  aria-label={UI.telegramMiniApp.decreaseParty}
                  onClick={() => adjustPartySize(-1)}
                >
                  <FontAwesomeIcon icon={faMinus} aria-hidden />
                </button>
                <span className="min-w-6 text-center font-semibold text-brand-primary">
                  {formValues.partySize}
                </span>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-primary"
                  aria-label={UI.telegramMiniApp.increaseParty}
                  onClick={() => adjustPartySize(1)}
                >
                  <FontAwesomeIcon icon={faPlus} aria-hidden />
                </button>
              </div>
              {fieldErrors.partySize != null && (
                <p className="mt-2 text-sm text-difficulty-hard-fg">{fieldErrors.partySize}</p>
              )}
            </div>

            <label className="block rounded-card border border-divider bg-white p-4 shadow-tourIncludedPanel">
              <span className="mb-2 inline-flex items-center gap-2 text-sm text-text-muted">
                <FontAwesomeIcon icon={faPen} aria-hidden />
                {UI.tourRequestModal.questionLabel}
              </span>
              <textarea
                rows={4}
                placeholder={UI.telegramMiniApp.commentPlaceholder}
                className="w-full resize-none border-0 bg-transparent font-body text-base text-text-primary outline-none"
                value={formValues.question}
                onChange={event => updateField('question', event.target.value)}
              />
            </label>
          </div>
        </section>

        {submitError != null && (
          <p className="text-sm text-difficulty-hard-fg">{submitError}</p>
        )}

        <div className="space-y-2">
          <button
            type="submit"
            className="btn-primary w-full justify-center disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin aria-hidden />
                {UI.tourRequestModal.sending}
              </>
            ) : (
              UI.tourRequestModal.submit
            )}
          </button>
          <p className="text-center text-sm text-text-muted">{UI.telegramMiniApp.submitHint}</p>
        </div>
      </form>
    </TelegramMiniAppShell>
  );
};

export default TelegramRequestPage;
