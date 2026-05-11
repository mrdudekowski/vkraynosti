import type { TourRequestModalPayload } from '../types';
import type { TourRequestFormValues } from '../validation/tourRequestSchema';

interface TourRequestLeadPayload extends TourRequestFormValues {
  webhookSecret: string;
  idempotencyKey: string;
  tourId: string;
  tourTitle?: string;
  season?: string;
  sourceUrl: string;
  submittedAt: string;
  userAgent: string;
}

const webhookUrl = import.meta.env.VITE_TOUR_REQUEST_WEBHOOK_URL;
const webhookSecret = import.meta.env.VITE_TOUR_REQUEST_WEBHOOK_SECRET;

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
): TourRequestLeadPayload => ({
  ...values,
  webhookSecret,
  idempotencyKey: createIdempotencyKey(),
  tourId: tour.tourId,
  tourTitle: getTourTitle(tour),
  season: tour.season,
  sourceUrl: window.location.href,
  submittedAt: new Date().toISOString(),
  userAgent: navigator.userAgent,
});

export const sendTourRequestLead = async (
  tour: TourRequestModalPayload,
  values: TourRequestFormValues
) => {
  if (!webhookUrl || !webhookSecret) {
    throw new Error('Tour request webhook is not configured');
  }

  const body = JSON.stringify(buildLeadPayload(tour, values));

  if (navigator.sendBeacon) {
    const queued = navigator.sendBeacon(webhookUrl, new Blob([body], { type: 'text/plain;charset=utf-8' }));
    if (queued) return;
  }

  await fetch(webhookUrl, {
    method: 'POST',
    mode: 'no-cors',
    redirect: 'manual',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body,
    keepalive: true,
  });
};
