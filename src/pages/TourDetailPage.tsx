import { useParams, Link, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faArrowLeft, faClock, faChartLine, faTag } from '@fortawesome/free-solid-svg-icons';
import { getTourById } from '../data/toursData';
import { ROUTES, SEASON_TO_LIST_ROUTE, buildTourDetailPath } from '../constants/routes';
import { UI } from '../constants/ui';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import PlaceholderImage from '../components/shared/PlaceholderImage';
import PageMeta from '../components/shared/PageMeta';
import { SEASON_PAGE_BG_CLASS } from '../constants/seasonTheme';

const TourDetailPage = () => {
  const { season = '', tourId = '' } = useParams<{ season: string; tourId: string }>();
  const tour = getTourById(tourId);

  if (!tour) {
    const notFoundBody = UI.tourDetail.notFoundWithId.replace('{id}', tourId);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-section font-bold text-text-primary mb-4">
            {UI.tourDetail.notFound}
          </h1>
          <p className="text-text-muted mb-6">{notFoundBody}</p>
          <Link to={ROUTES.HOME} className="btn-primary">
            {UI.tourDetail.homeLink}
          </Link>
        </div>
      </div>
    );
  }

  if (season !== tour.season) {
    return <Navigate replace to={buildTourDetailPath(tour.season, tour.id)} />;
  }

  const seasonInfo = UI.seasons[tour.season];

  return (
    <div className={SEASON_PAGE_BG_CLASS[tour.season]}>
      <PageMeta
        title={`${tour.title} | Вкрайности`}
        description={`${tour.subtitle}. ${tour.duration}, ${tour.price}. ${tour.highlights.slice(0, 3).join(', ')}.`}
        imageUrl={tour.imageUrl}
        path={buildTourDetailPath(tour.season, tour.id)}
      />
      {/* Hero */}
      <div className="relative h-96">
        <PlaceholderImage src={tour.imageUrl} alt={tour.title} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <Link
            to={SEASON_TO_LIST_ROUTE[tour.season]}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors duration-hover"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            {seasonInfo.emoji} {seasonInfo.label}
          </Link>
          <h1 className="font-heading text-section font-bold text-white">{tour.title}</h1>
          <p className="text-white/80 mt-1">{tour.subtitle}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs
          className="mb-8"
          items={[
            { label: UI.breadcrumbs.home, to: ROUTES.HOME },
            {
              label: `${seasonInfo.emoji} ${seasonInfo.label}`,
              to: SEASON_TO_LIST_ROUTE[tour.season],
            },
            { label: tour.title },
          ]}
        />
        {/* Badges */}
        <div className="flex flex-wrap gap-3 mb-8">
          <span className="flex items-center gap-2 bg-surface-light px-4 py-2 rounded-full text-sm text-text-muted">
            <FontAwesomeIcon icon={faClock} className="text-brand-primary" />
            {tour.duration}
          </span>
          <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${UI.difficulty.styles[tour.difficulty]}`}>
            <FontAwesomeIcon icon={faChartLine} />
            {UI.difficulty.labels[tour.difficulty]}
          </span>
          <span className="flex items-center gap-2 bg-brand-primary text-text-inverse px-4 py-2 rounded-full text-sm font-semibold">
            <FontAwesomeIcon icon={faTag} />
            {tour.price}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="font-heading text-2xl font-semibold text-text-primary mb-4">
              {UI.tourDetail.about}
            </h2>
            <p className="text-text-muted leading-relaxed mb-8">{tour.description}</p>

            {/* Gallery */}
            <h2 className="font-heading text-2xl font-semibold text-text-primary mb-4">
              {UI.tourDetail.gallery}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tour.galleryImages.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-card overflow-hidden">
                  <PlaceholderImage
                    src={img}
                    alt={`${tour.title} — фото ${idx + 1}`}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <div className="bg-surface-light rounded-card p-card-p sticky top-24">
              <h3 className="font-heading font-semibold text-text-primary mb-4">
                {UI.tourDetail.highlights}
              </h3>
              <ul className="flex flex-col gap-3">
                {tour.highlights.map(highlight => (
                  <li key={highlight} className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faCheck} className="text-brand-primary mt-0.5 shrink-0" />
                    <span className="text-text-muted text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
