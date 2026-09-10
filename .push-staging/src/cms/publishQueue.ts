import type { SchedulePayload, ToursListPayload } from '../types/tourData';
import type { TourScheduleEvent, TourSchedulePayload } from '../types/tourSchedule';
import type { CmsTourDocument } from './cmsTourDocument';
import type { CmsTourMeta } from './cmsTourMeta';
import { cmsPublishBlockers } from './cmsPublishRules';
import { CATALOG_PRICE_ON_REQUEST, isTourReady, tourReadiness } from './tourCompleteness';

export const GUEST_SCHEDULE_STATUSES = ['open', 'full', 'completed'] as const;
type QueueDepartureStatus = TourScheduleEvent['status'];

export type PublishQueueSummary = 'new_tour' | 'tour_draft' | 'new_departure' | 'departure_draft';

export type PublishQueueItem = {
  kind: 'tour' | 'departure';
  id: string;
  tourId: string;
  title?: string;
  startsOn?: string;
  author?: string;
  timestamp?: string;
  ready?: boolean;
  rev?: number;
  summary?: PublishQueueSummary;
  price?: string;
  publishedPrice?: string | null;
  season?: CmsTourDocument['season'];
  publishedSeason?: CmsTourDocument['season'] | null;
  status?: CmsTourDocument['status'];
  publishedStatus?: CmsTourDocument['status'] | null;
  readiness?: { blockers: Array<{ code: string; section: string; focus: string }> };
};

export type QueueTourInput = {
  id: string;
  title: string;
  document: CmsTourDocument;
  meta: CmsTourMeta;
  published: boolean;
  publishedDocument?: CmsTourDocument | null;
};

export type QueueDepartureInput = {
  id: string;
  tourId: string;
  startsOn: string;
  seats?: number;
  status: QueueDepartureStatus;
  submittedForPublishAt: string | null;
  publishedAt: string | null;
  publishedStartsOn?: string | null;
  publishedSeats?: number | null;
  publishedStatus?: QueueDepartureStatus | null;
  updatedAt: string;
  title?: string;
  author?: string;
};

export function departureNeedsPublication(departure: {
  startsOn: string;
  seats?: number;
  status: QueueDepartureStatus;
  publishedAt: string | null;
  publishedStartsOn?: string | null;
  publishedSeats?: number | null;
  publishedStatus?: QueueDepartureStatus | null;
  updatedAt?: string;
}): boolean {
  if (departure.publishedAt == null) {
    return departure.status !== 'cancelled';
  }
  if (
    departure.publishedStartsOn == null ||
    departure.publishedSeats == null ||
    departure.publishedStatus == null
  ) {
    if (departure.status === 'cancelled') {
      return true;
    }
    return departure.updatedAt != null && departure.updatedAt > departure.publishedAt;
  }
  return (
    departure.startsOn !== departure.publishedStartsOn ||
    (departure.seats != null && departure.seats !== departure.publishedSeats) ||
    departure.status !== departure.publishedStatus
  );
}

function tourDraftDiffersFromSnapshot(tour: QueueTourInput): boolean {
  if (tour.publishedDocument == null) {
    return false;
  }
  return JSON.stringify(tour.document) !== JSON.stringify(tour.publishedDocument);
}

function tourNeedsPublication(tour: QueueTourInput): boolean {
  if (!tour.published) {
    return true;
  }
  if (tour.document.status === 'hidden' && tour.publishedDocument?.status === 'hidden') {
    return false;
  }
  return tourDraftDiffersFromSnapshot(tour);
}

function tourIsReturnedFromQueue(tour: QueueTourInput): boolean {
  return tour.meta.submittedForPublishAt == null && tour.meta.returnReason != null;
}

export function nextSubmittedForPublishAt(input: {
  draft: CmsTourDocument;
  publishedDocument: CmsTourDocument | null | undefined;
  currentSubmittedAt: string | null | undefined;
  nowIso: string;
}): string | null {
  const needsPublication =
    input.publishedDocument == null ||
    JSON.stringify(input.draft) !== JSON.stringify(input.publishedDocument);
  if (!needsPublication) {
    return null;
  }
  return input.currentSubmittedAt ?? input.nowIso;
}

export function livePublishQueue(
  tours: QueueTourInput[],
  departures: QueueDepartureInput[],
): PublishQueueItem[] {
  const items: PublishQueueItem[] = [];
  const tourIds = new Set(tours.map((tour) => tour.id));
  for (const tour of tours) {
    if (!tourNeedsPublication(tour) || tourIsReturnedFromQueue(tour)) {
      continue;
    }
    items.push({
      kind: 'tour',
      id: tour.id,
      tourId: tour.id,
      title: tour.title,
      author: tour.meta.editor,
      timestamp: tour.meta.updatedAt,
      ready:
        tour.document.status === 'hidden' && tour.published
          ? true
          : isTourReady(tour.document),
      readiness: { blockers: tourReadiness(tour.document).blockers },
      rev: tour.meta.rev,
      summary: tour.published ? 'tour_draft' : 'new_tour',
      price: tour.document.price,
      publishedPrice: tour.publishedDocument?.price ?? null,
      season: tour.document.season,
      publishedSeason: tour.publishedDocument?.season ?? null,
      status: tour.document.status,
      publishedStatus: tour.publishedDocument?.status ?? null,
    });
  }
  for (const departure of departures) {
    if (tours.length > 0 && !tourIds.has(departure.tourId)) {
      continue;
    }
    if (!departureNeedsPublication(departure)) {
      continue;
    }
    items.push({
      kind: 'departure',
      id: departure.id,
      tourId: departure.tourId,
      title: departure.title,
      startsOn: departure.startsOn,
      author: departure.author,
      timestamp: departure.updatedAt,
      ready: true,
      summary: departure.publishedAt == null ? 'new_departure' : 'departure_draft',
    });
  }
  return items;
}

export function guestPriceRub(price: string): number | null {
  if (price.trim() === CATALOG_PRICE_ON_REQUEST) {
    return null;
  }
  const digits = price.replace(/\D/g, '');
  if (digits.length === 0) {
    return null;
  }
  return Number(digits);
}

export function guestDurationType(
  durationDays: number | undefined,
): TourScheduleEvent['durationType'] {
  return durationDays != null && durationDays >= 2 ? 'многодневный' : 'однодневный';
}

export type DeparturePublishSnapshot = {
  tourId: string;
  startsOn: string;
  seats: number;
  status: QueueDepartureStatus;
  publishedAt: string | null;
  publishedStartsOn: string | null;
  publishedSeats: number | null;
  publishedStatus: QueueDepartureStatus | null;
};

export function guestScheduleDeparturesFromSnapshots(
  rows: readonly DeparturePublishSnapshot[],
): Array<{
  tourId: string;
  startsOn: string;
  seats: number;
  status: QueueDepartureStatus;
}> {
  const departures: Array<{
    tourId: string;
    startsOn: string;
    seats: number;
    status: QueueDepartureStatus;
  }> = [];
  for (const row of rows) {
    if (
      row.publishedAt == null ||
      row.publishedStartsOn == null ||
      row.publishedSeats == null ||
      row.publishedStatus == null
    ) {
      continue;
    }
    departures.push({
      tourId: row.tourId,
      startsOn: row.publishedStartsOn,
      seats: row.publishedSeats,
      status: row.publishedStatus,
    });
  }
  return departures;
}

function tourIsOffSite(status: CmsTourDocument['status']): boolean {
  return status !== 'active';
}

export function toGuestSchedulePayload(
  departures: Array<{
    tourId: string;
    startsOn: string;
    seats: number;
    status: QueueDepartureStatus;
  }>,
  publishedTours: CmsTourDocument[],
  todayIso: string,
): TourSchedulePayload {
  const toursById = new Map(publishedTours.map((tour) => [tour.id, tour]));
  const events: TourScheduleEvent[] = [];
  for (const departure of departures) {
    if (!(GUEST_SCHEDULE_STATUSES as readonly string[]).includes(departure.status)) {
      continue;
    }
    const tour = toursById.get(departure.tourId);
    if (tour == null) {
      continue;
    }
    const hideFuture = tourIsOffSite(tour.status) && departure.startsOn >= todayIso;
    if (hideFuture) {
      continue;
    }
    events.push({
      date: departure.startsOn,
      tourId: departure.tourId,
      durationType: guestDurationType(tour.durationDays),
      priceRub: guestPriceRub(tour.price),
      seats: departure.seats,
      status: departure.status,
      comment: null,
    });
  }
  return {
    events,
    catalogPrices: Object.fromEntries(
      publishedTours.flatMap((tour) => {
        const price = guestPriceRub(tour.price);
        return price == null ? [] : [[tour.id, price]];
      }),
    ),
    catalogDurationTypes: Object.fromEntries(
      publishedTours.map((tour) => [tour.id, guestDurationType(tour.durationDays)]),
    ),
    catalogPublicationStatuses: Object.fromEntries(
      publishedTours.map((tour) => [
        tour.id,
        tour.status === 'hidden'
          ? 'hidden'
          : tour.status === 'in_development' || tour.status === 'draft'
            ? 'in_development'
            : 'active',
      ]),
    ),
  };
}

function guestListPublicationStatus(
  status: CmsTourDocument['status'],
): ToursListPayload['tours'][number]['publicationStatus'] | null {
  return status === 'active' ? 'active' : null;
}

export type GuestTourDataFiles = {
  toursList: ToursListPayload;
  schedule: SchedulePayload;
};

export function toGuestTourDataFiles(
  departures: Array<{
    tourId: string;
    startsOn: string;
    seats: number;
    status: QueueDepartureStatus;
  }>,
  publishedTours: CmsTourDocument[],
  todayIso: string,
  generatedAt: string,
): GuestTourDataFiles {
  const payload = toGuestSchedulePayload(departures, publishedTours, todayIso);
  const tours = publishedTours.flatMap((tour) => {
    const publicationStatus = guestListPublicationStatus(tour.status);
    if (publicationStatus == null) {
      return [];
    }
    return [
      {
        id: tour.id,
        title: tour.title,
        priceRub: guestPriceRub(tour.price),
        durationType: guestDurationType(tour.durationDays),
        publicationStatus,
      },
    ];
  });
  return {
    toursList: {
      schemaVersion: 1,
      generatedAt,
      tours,
    },
    schedule: {
      schemaVersion: 1,
      generatedAt,
      events: payload.events.map((event) => ({
        date: event.date,
        tourId: event.tourId,
        seats: event.seats,
        status: event.status,
        comment: event.comment,
        durationType: event.durationType,
        ...(event.priceRub == null ? {} : { overridePriceRub: event.priceRub }),
      })),
    },
  };
}

export function documentForGuestPublish(document: CmsTourDocument): CmsTourDocument {
  if (document.status !== 'draft') {
    return document;
  }
  return { ...document, status: 'active' };
}

export function documentToPublishForQueue(
  draft: CmsTourDocument,
  publishedDocument: CmsTourDocument | null | undefined,
): CmsTourDocument {
  if (
    draft.status === 'hidden' &&
    publishedDocument != null &&
    cmsPublishBlockers(draft).length > 0
  ) {
    return documentForGuestPublish({ ...publishedDocument, status: 'hidden' });
  }
  return documentForGuestPublish(draft);
}
