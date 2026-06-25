import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons/faCalendarDays';
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock';
import { faMountain } from '@fortawesome/free-solid-svg-icons/faMountain';
import { faTag } from '@fortawesome/free-solid-svg-icons/faTag';
import { faSun } from '@fortawesome/free-solid-svg-icons/faSun';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare';
import type { Season } from '../../types';
import { UI } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';
import { buildTelegramRequestPath } from '../../constants/telegramMiniApp';
import { findTourBySeasonAndSegment } from '../../data/tourLookup';
import { getTourCanonicalUrl } from '../../constants/tourUrls';
import { getTourCoverCardImgObjectClass } from '../../constants/tourCoverCropByCanonicalId';
import TelegramMiniAppHeader from '../../components/telegram/TelegramMiniAppHeader';
import TelegramMiniAppShell from '../../components/telegram/TelegramMiniAppShell';
import TelegramTourGallery from '../../components/telegram/TelegramTourGallery';
import PlaceholderImage from '../../components/shared/PlaceholderImage';
import { useTourDisplayDuration } from '../../hooks/useTourDisplayDuration';
import { useTourDisplayPrice } from '../../hooks/useTourDisplayPrice';
import { useTourSchedule } from '../../hooks/useTourSchedule';
import { resolveTourDifficultyLabel } from '../../utils/tourDifficultyLabel';
import { buildTourDepartureCalendarModel } from '../../utils/tourSchedule/buildTourDepartureCalendarModel';
import {
  formatTourDepartureLabel,
  truncateTelegramTourDescription,
} from '../../utils/telegramMiniApp';
import { getTourGalleryGridUrls } from '../../utils/tourGalleryUrls';

const parseSeasonParam = (value: string | undefined): Season | null => {
  if (value === 'winter' || value === 'spring' || value === 'summer' || value === 'fall') {
    return value;
  }
  return null;
};

const TelegramTourPage = () => {
  const { season: seasonParam, tourId: tourSegment } = useParams();
  const season = parseSeasonParam(seasonParam);
  const tour =
    season != null && tourSegment != null
      ? findTourBySeasonAndSegment(season, tourSegment)
      : undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const { events } = useTourSchedule();
  const { displayDuration } = useTourDisplayDuration(tour ?? { id: '', duration: '' });
  const { displayPrice } = useTourDisplayPrice(
    tour ?? { id: '', price: '', season: 'summer' },
  );

  const galleryUrls = useMemo(
    () => (tour != null ? getTourGalleryGridUrls(tour).slice(0, 6) : []),
    [tour],
  );

  const departureModel = useMemo(() => {
    if (tour == null) {
      return null;
    }
    const tourEvents = events.filter(event => event.tourId === tour.id);
    return buildTourDepartureCalendarModel(tour.id, tourEvents);
  }, [events, tour]);

  const [selectedDepartureIso, setSelectedDepartureIso] = useState<string | null>(null);

  const futureDates = departureModel?.futureDates ?? [];
  const selectedDateIso =
    selectedDepartureIso ??
    (futureDates.length === 1 ? futureDates[0] : departureModel?.nearestFuture ?? null);

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
  const description = truncateTelegramTourDescription(
    tour.descriptionLeadBold != null && tour.descriptionLeadBold.length > 0
      ? `${tour.descriptionLeadBold}. ${tour.description}`
      : tour.description,
  );
  const siteUrl = getTourCanonicalUrl(tour);

  const handleRequest = () => {
    navigate(buildTelegramRequestPath(tour), {
      state: {
        preferredDepartureDateIso: selectedDateIso ?? undefined,
      },
    });
  };

  return (
    <TelegramMiniAppShell season={tour.season}>
      <TelegramMiniAppHeader
        title={UI.telegramMiniApp.tourPageTitle}
        backTo={`${ROUTES.TELEGRAM}${location.search}`}
      />
      <div className="mx-auto max-w-lg pb-32">
        <div className="relative">
          <PlaceholderImage
            src={tour.imageUrl}
            alt={tour.title}
            className="h-56 w-full"
            imgClassName={getTourCoverCardImgObjectClass(tour.id)}
            loading="eager"
            fetchPriority="high"
          />
        </div>

        <section className="-mt-6 rounded-t-[2rem] bg-surface-light px-4 pb-6 pt-8 shadow-tourIncludedPanel">
          <p className="mb-2 text-center text-brand-secondary" aria-hidden>
            ✦
          </p>
          <h1 className="text-center font-heading text-2xl text-brand-primary">{tour.title}</h1>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {displayDuration.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent px-3 py-1 text-xs font-medium text-brand-primary">
                <FontAwesomeIcon icon={faClock} aria-hidden />
                {displayDuration}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent px-3 py-1 text-xs font-medium text-brand-primary">
              <FontAwesomeIcon icon={faMountain} aria-hidden />
              {difficultyLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent px-3 py-1 text-xs font-medium text-brand-primary">
              <FontAwesomeIcon icon={faTag} aria-hidden />
              {displayPrice}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent px-3 py-1 text-xs font-medium text-brand-primary">
              <FontAwesomeIcon icon={faSun} aria-hidden />
              {UI.seasons[tour.season].label}
            </span>
          </div>

          {futureDates.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 font-heading text-lg text-brand-primary">
                {UI.telegramMiniApp.nearestDatesHeading}
              </h2>
              <div className="flex flex-wrap gap-2">
                {futureDates.slice(0, 6).map(iso => {
                  const isSelected = selectedDateIso === iso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={[
                        'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium',
                        isSelected
                          ? 'bg-brand-primary text-text-inverse'
                          : 'bg-brand-accent text-brand-primary',
                      ].join(' ')}
                      onClick={() => setSelectedDepartureIso(iso)}
                    >
                      <FontAwesomeIcon icon={faCalendarDays} aria-hidden />
                      {formatTourDepartureLabel(iso)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h2 className="mb-2 font-heading text-lg text-brand-primary">
              {UI.telegramMiniApp.descriptionHeading}
            </h2>
            <p className="font-body text-sm leading-relaxed text-text-primary">{description}</p>
          </div>

          {galleryUrls.length > 0 && (
            <TelegramTourGallery urls={galleryUrls} tourTitle={tour.title} />
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-navbar border-t border-divider bg-surface-light/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <button type="button" className="btn-primary w-full justify-center" onClick={handleRequest}>
            {UI.telegramMiniApp.leaveRequest}
            <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" aria-hidden />
          </button>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-primary bg-brand-accent px-6 py-3 text-sm font-semibold text-brand-primary no-underline"
          >
            {UI.telegramMiniApp.openOnSite}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </TelegramMiniAppShell>
  );
};

export default TelegramTourPage;
