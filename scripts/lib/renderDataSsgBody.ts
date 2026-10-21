import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ROUTES, SEASON_TO_LIST_ROUTE } from '../../src/constants/routes.ts';
import {
  SEO_DEFAULTS,
  getSeasonSeoEntry,
  getSeasonCollectionSchema,
  getTourSeoEntry,
  getTourBreadcrumbSchema,
  getTourStructuredData,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
  getAbsoluteOgImageUrl,
} from '../../src/constants/seo.ts';
import { UI } from '../../src/constants/ui.ts';
import { SAFETY_OFFER_HEADER, SAFETY_OFFER_SECTIONS } from '../../src/data/safetyOfferContent.ts';
import { findTourBySeasonAndSegment } from '../../src/data/tourLookup.ts';
import type { Season, Tour } from '../../src/types/index.ts';
import type { TourPublicationStatus } from '../../src/types/tourSchedule.ts';
import { resolveTourDifficultyLabel } from '../../src/utils/tourDifficultyLabel.ts';
import { sortToursInDevelopmentLast } from '../../src/utils/sortToursInDevelopmentLast.ts';
import { buildTourDepartureCalendarModel } from '../../src/utils/tourSchedule/buildTourDepartureCalendarModel.ts';
import { formatPriceRub } from '../../src/utils/tourSchedule/formatPriceRub.ts';
import { formatTourDurationDisplayLabel } from '../../src/utils/tourSchedule/formatTourDurationDisplayLabel.ts';
import { getVisibleToursBySeason } from '../../src/utils/tourSchedule/getVisibleToursBySeason.ts';
import { getTourPublicPath } from '../../src/constants/tourUrls.ts';
import { parseIsoDate } from '../../src/utils/tourSchedule/parseIsoDate.ts';
import { escapeHtml } from './renderOgShellHead.ts';
import type { TourScheduleSnapshot } from './loadTourScheduleSnapshot.ts';
import type { SiteSeoDocument } from '../../src/cms/siteSeoDocument.ts';

export type DataSsgOverrides = {
  toursById?: ReadonlyMap<string, Tour>;
  siteSeo?: SiteSeoDocument | null;
};

function siteSeoPage(document: SiteSeoDocument | null | undefined, key: SiteSeoDocument['pages'][number]['key']) {
  return document?.pages.find((page) => page.key === key);
}

const SEASONS: Season[] = ['winter', 'spring', 'summer', 'fall'];

const SEASON_BY_LIST_PATH: Record<string, Season> = {
  [ROUTES.WINTER]: 'winter',
  [ROUTES.SPRING]: 'spring',
  [ROUTES.SUMMER]: 'summer',
  [ROUTES.FALL]: 'fall',
};

const TOUR_DETAIL_PATH_PATTERN = /^\/tours\/(winter|spring|summer|fall)\/([^/]+)$/;

export interface DataSsgPage {
  bodyHtml: string;
  structuredData: ReadonlyArray<Record<string, unknown>>;
}

const esc = escapeHtml;

const formatDepartureDate = (isoDate: string): string =>
  format(parseIsoDate(isoDate), 'd MMMM yyyy', { locale: ru });

function resolveTourDisplayPrice(tour: Tour, snapshot: TourScheduleSnapshot): string {
  const priceRub = snapshot.catalogPrices.get(tour.id);
  if (priceRub != null) {
    return formatPriceRub(priceRub);
  }
  return tour.price.trim();
}

function resolveTourDurationLabel(tour: Tour, snapshot: TourScheduleSnapshot): string | null {
  const durationType = snapshot.durationTypes.get(tour.id);
  if (durationType != null) {
    return formatTourDurationDisplayLabel(durationType);
  }
  const legacy = tour.duration.trim();
  return legacy.length > 0 ? legacy : null;
}

function renderSiteNav(): string {
  const primaryLinks = UI.nav.links
    .map((link) => `<li><a href="/#${esc(link.hash)}">${esc(link.label)}</a></li>`)
    .join('');
  const seasonLinks = SEASONS.map(
    (season) =>
      `<li><a href="${esc(SEASON_TO_LIST_ROUTE[season])}">${esc(UI.seasons[season].label)}</a></li>`,
  ).join('');
  return `<nav aria-label="${esc(UI.breadcrumbs.navLabel)}"><ul>${primaryLinks}${seasonLinks}</ul></nav>`;
}

function renderTourLinkList(tours: readonly Tour[]): string {
  if (tours.length === 0) {
    return '';
  }
  const items = tours
    .map(
      (tour) =>
        `<li><a href="${esc(getTourPublicPath(tour))}">${esc(tour.title)}</a> — ${esc(tour.subtitle)}</li>`,
    )
    .join('');
  return `<ul>${items}</ul>`;
}

function visibleToursForSeason(season: Season, snapshot: TourScheduleSnapshot): Tour[] {
  return sortToursInDevelopmentLast(
    getVisibleToursBySeason(season, snapshot.publicationStatuses, { scheduleLoaded: true }),
    snapshot.publicationStatuses,
  );
}

function renderHomeBody(snapshot: TourScheduleSnapshot, seo?: SiteSeoDocument | null): string {
  const page = siteSeoPage(seo, 'home');
  const title = page?.h1?.trim() || page?.title?.trim() || SEO_DEFAULTS.home.title;
  const description = page?.description?.trim() || SEO_DEFAULTS.home.description;
  const seasonSections = SEASONS.map((season) => {
    const tours = visibleToursForSeason(season, snapshot);
    if (tours.length === 0) {
      return '';
    }
    return `<section><h2>${esc(UI.sections.toursTitleBySeason[season])}</h2>${renderTourLinkList(tours)}</section>`;
  }).join('');

  return `<main>
  <h1>${esc(title)}</h1>
  <p>${esc(description)}</p>
  ${renderSiteNav()}
  <section><h2>${esc(UI.sections.tours)}</h2>${seasonSections}</section>
</main>`;
}

function renderSeasonBody(season: Season, snapshot: TourScheduleSnapshot, seo?: SiteSeoDocument | null): string {
  const seoEntry = getSeasonSeoEntry(season, SEASON_TO_LIST_ROUTE[season]);
  const page = siteSeoPage(seo, season);
  const tours = visibleToursForSeason(season, snapshot);
  const otherSeasonLinks = SEASONS.filter((s) => s !== season)
    .map(
      (s) =>
        `<li><a href="${esc(SEASON_TO_LIST_ROUTE[s])}">${esc(UI.seasons[s].emoji)} ${esc(UI.seasons[s].label)}</a></li>`,
    )
    .join('');

  return `<main>
  <h1>${esc(page?.h1?.trim() || page?.title?.trim() || seoEntry.title)}</h1>
  <p>${esc(page?.description?.trim() || seoEntry.description)}</p>
  ${renderSiteNav()}
  <section><h2>${esc(UI.sections.toursTitleBySeason[season])}</h2>${renderTourLinkList(tours)}</section>
  <nav aria-label="${esc(UI.sections.otherSeasons)}"><ul>${otherSeasonLinks}</ul></nav>
</main>`;
}

function renderSafetyBody(): string {
  const sections = SAFETY_OFFER_SECTIONS.map((section) => {
    const blocks = section.blocks.map((block) =>
      block.type === 'p'
        ? `<p>${esc(block.text)}</p>`
        : `<ul>${block.items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`,
    ).join('');
    return `<section aria-labelledby="${esc(section.id)}"><h2 id="${esc(section.id)}">${esc(section.title)}</h2>${blocks}</section>`;
  }).join('');

  return `<main>
  <h1>${esc(SAFETY_OFFER_HEADER.title)}</h1>
  <p>${esc(SAFETY_OFFER_HEADER.subtitle)}</p>
  ${sections}
</main>`;
}

function renderTourBody(
  tour: Tour,
  publicationStatus: TourPublicationStatus,
  snapshot: TourScheduleSnapshot,
): string {
  const isInDevelopment = publicationStatus === 'in_development';
  const displayPrice = resolveTourDisplayPrice(tour, snapshot);
  const durationLabel = resolveTourDurationLabel(tour, snapshot);
  const difficultyLabel = resolveTourDifficultyLabel(tour);
  const imageUrl = getAbsoluteOgImageUrl(tour.imageUrl);

  const departureCalendar = buildTourDepartureCalendarModel(tour.id, snapshot.events);
  const departuresBlock =
    !isInDevelopment && departureCalendar.futureDates.length > 0
      ? `<section><h2>${esc(UI.tourDetail.departuresHeading)}</h2><ul>${departureCalendar.futureDates
          .map((iso) => `<li>${esc(formatDepartureDate(iso))}</li>`)
          .join('')}</ul></section>`
      : isInDevelopment
        ? `<p>${esc(UI.tourDetail.programInDevelopment)}</p>`
        : `<p>${esc(UI.tourDetail.departuresEmpty)}</p>`;

  const programBlock = isInDevelopment
    ? `<section><h2>${esc(UI.tourDetail.programHeading)}</h2><p>${esc(UI.tourDetail.programInDevelopment)}</p></section>`
    : `<section><h2>${esc(UI.tourDetail.programHeading)}</h2><ol>${tour.program
        .map((step) => `<li>${esc(step.description)}</li>`)
        .join('')}</ol></section>`;

  const aboutParts = [
    tour.descriptionLeadBold != null && tour.descriptionLeadBold.trim().length > 0
      ? `<p><strong>${esc(tour.descriptionLeadBold.trim())}</strong></p>`
      : '',
    tour.description.trim().length > 0 ? `<p>${esc(tour.description.trim())}</p>` : '',
    tour.descriptionAside != null && tour.descriptionAside.trim().length > 0
      ? `<p>${esc(tour.descriptionAside.trim())}</p>`
      : '',
  ].join('');

  const includedBlock =
    !isInDevelopment && tour.includedInPrice.length > 0
      ? `<section><h2>${esc(UI.tourDetail.includedHeading)}</h2><ul>${tour.includedInPrice
          .map((item) => `<li>${esc(item.text)}</li>`)
          .join('')}</ul></section>`
      : '';

  const metaFacts = [
    durationLabel != null
      ? `<li>${esc(UI.tourDetail.metaLabelDuration)}: ${esc(durationLabel)}</li>`
      : '',
    `<li>${esc(UI.tourDetail.metaLabelDifficulty)}: ${esc(difficultyLabel)}</li>`,
    `<li>${esc(UI.tourDetail.metaLabelPrice)}: ${esc(displayPrice)}</li>`,
  ].join('');

  const durationType = snapshot.durationTypes.get(tour.id);
  const seoEntry = getTourSeoEntry(tour, {
    displayDuration:
      durationType != null ? formatTourDurationDisplayLabel(durationType) : undefined,
    publicationStatus,
  });

  return `<div data-testid="tour-detail-main">
  <main>
    <nav aria-label="${esc(UI.breadcrumbs.navLabel)}">
      <a href="${esc(ROUTES.HOME)}">${esc(UI.breadcrumbs.home)}</a>
      ·
      <a href="${esc(SEASON_TO_LIST_ROUTE[tour.season])}">${esc(UI.seasons[tour.season].label)}</a>
    </nav>
    <img src="${esc(imageUrl)}" alt="${esc(tour.title)}" width="1200" height="630" />
    <h1>${esc(seoEntry.h1 ?? tour.title)}</h1>
    <p>${esc(seoEntry.description)}</p>
    <p>${esc(tour.subtitle)}</p>
    ${isInDevelopment ? `<p>${esc(UI.tourDetail.inDevelopmentHeading)}</p>` : ''}
    <section aria-label="${esc(UI.tourDetail.tourMetaFactsAriaLabel)}"><ul>${metaFacts}</ul></section>
    <section><h2>${esc(UI.tourDetail.priceHighlightLead)}</h2><p>${esc(displayPrice)}</p><p>${esc(UI.tourDetail.priceHighlightNote)}</p></section>
    ${departuresBlock}
    <section><h2>${esc(UI.tourDetail.about)}</h2>${aboutParts}</section>
    ${programBlock}
    ${includedBlock}
    <p><a href="${esc(SEASON_TO_LIST_ROUTE[tour.season])}">${esc(UI.tourDetail.backToToursCta)}</a></p>
  </main>
</div>`;
}

export function resolveDataSsgForRoute(
  routePath: string,
  snapshot: TourScheduleSnapshot,
  tourPublicationStatus?: TourPublicationStatus,
  overrides: DataSsgOverrides = {},
): DataSsgPage {
  if (routePath === ROUTES.HOME) {
    return {
      bodyHtml: renderHomeBody(snapshot, overrides.siteSeo),
      structuredData: [ORGANIZATION_SCHEMA, WEBSITE_SCHEMA],
    };
  }

  if (routePath === ROUTES.SAFETY) {
    return {
      bodyHtml: renderSafetyBody(),
      structuredData: [],
    };
  }

  if (routePath === ROUTES.PRIVACY) {
    return {
      // The legacy route redirects to the official policy PDF in the SPA.
      bodyHtml: '',
      structuredData: [],
    };
  }

  const seasonKey = SEASON_BY_LIST_PATH[routePath];
  if (seasonKey != null) {
    return {
      bodyHtml: renderSeasonBody(seasonKey, snapshot, overrides.siteSeo),
      structuredData: [getSeasonCollectionSchema(seasonKey, SEASON_TO_LIST_ROUTE[seasonKey], siteSeoPage(overrides.siteSeo, seasonKey)?.description)],
    };
  }

  const tourMatch = TOUR_DETAIL_PATH_PATTERN.exec(routePath);
  if (tourMatch != null) {
    const [, season, segment] = tourMatch;
    const cmsTour = [...(overrides.toursById?.values() ?? [])].find(
      (tour) =>
        tour.season === season && (tour.slug === segment || tour.id === segment),
    );
    const baseTour = cmsTour ?? findTourBySeasonAndSegment(season as Season, segment);
    if (baseTour == null) {
      throw new Error(`Unknown tour for data-SSG: ${routePath}`);
    }
    const tour = overrides.toursById?.get(baseTour.id) ?? baseTour;
    const publicationStatus = tourPublicationStatus ?? 'active';
    const durationType = snapshot.durationTypes.get(tour.id);
    const durationOptions = {
      displayDuration: durationType != null ? formatTourDurationDisplayLabel(durationType) : undefined,
      publicationStatus,
    };

    return {
      bodyHtml: renderTourBody(tour, publicationStatus, snapshot),
      structuredData: [
        getTourStructuredData(tour, durationOptions),
        getTourBreadcrumbSchema(tour),
      ],
    };
  }

  throw new Error(`No data-SSG mapping for route: ${routePath}`);
}
