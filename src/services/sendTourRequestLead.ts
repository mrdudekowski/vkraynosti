import type { TourRequestModalPayload } from '../types';
import type { TourRequestFormValues } from '../validation/tourRequestSchema';

interface TourRequestLeadPayload extends TourRequestFormValues {
  idempotencyKey: string;
  tourId: string;
  tourTitle?: string;
  season?: string;
  sourceUrl: string;
  submittedAt: string;
  userAgent: string;
  preferredDepartureDate?: string;
}

export type TourRequestLeadErrorCode = 'not-configured' | 'network' | 'rejected';

export class TourRequestLeadError extends Error {
  readonly code: TourRequestLeadErrorCode;

  constructor(code: TourRequestLeadErrorCode, message: string) {
    super(message);
    this.name = 'TourRequestLeadError';
    this.code = code;
  }
}

const tourRequestEndpointUrl = import.meta.env.VITE_TOUR_REQUEST_ENDPOINT_URL;

const LEAD_CONTENT_TYPE = 'text/plain;charset=utf-8' as const;

const createIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getTourTitle = (tour: TourRequestModalPayload) => {
  return [tour.title, tour.subtitle].filter(Boolean).join(' — ');
};

const buildLeadPayload = (
  tour: TourRequestModalPayload,
  values: TourRequestFormValues
): TourRequestLeadPayload => {
  const departure =
    values.preferredDepartureDate != null && values.preferredDepartureDate.length > 0
      ? values.preferredDepartureDate
      : tour.preferredDepartureDateIso;

  return {
    ...values,
    idempotencyKey: createIdempotencyKey(),
    tourId: tour.tourId,
    tourTitle: getTourTitle(tour),
    season: tour.season,
    sourceUrl: window.location.href,
    submittedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ...(departure != null && departure.length > 0
      ? { preferredDepartureDate: departure }
      : {}),
  };
};

export const sendTourRequestLead = async (
  tour: TourRequestModalPayload,
  values: TourRequestFormValues
) => {
  const endpoint = tourRequestEndpointUrl?.trim();
  if (!endpoint) {
    throw new TourRequestLeadError('not-configured', 'Tour request endpoint is not configured');
  }

  const body = JSON.stringify(buildLeadPayload(tour, values));

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': LEAD_CONTENT_TYPE,
      },
      body,
      keepalive: true,
    });
  } catch {
    throw new TourRequestLeadError('network', 'Failed to send tour request');
  }

  if (!response.ok) {
    throw new TourRequestLeadError(
      'rejected',
      `Tour request rejected: ${response.status}`
    );
  }
};
