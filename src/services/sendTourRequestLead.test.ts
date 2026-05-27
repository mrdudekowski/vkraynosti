import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TourRequestModalPayload } from '../types';
import type { TourRequestFormValues } from '../validation/tourRequestSchema';

const endpointUrl = 'https://script.google.com/macros/s/test/exec';
const legacySecretPayloadKey = `webhook${'Secret'}`;

const tour: TourRequestModalPayload = {
  tourId: 'spring-6',
  title: 'Мараловая ферма',
  subtitle: 'Парк Драконов',
  season: 'spring',
};

const values: TourRequestFormValues = {
  name: 'Иван',
  phone: '+79991234567',
  email: '',
  preferredMessenger: 'telegram',
  question: 'Хочу узнать детали',
  privacyAccepted: true,
};

const importService = async () => {
  vi.resetModules();
  return import('./sendTourRequestLead');
};

describe('sendTourRequestLead', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_TOUR_REQUEST_ENDPOINT_URL', endpointUrl);
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('crypto', {
      randomUUID: () => 'lead-idempotency-key',
    });
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'vitest-user-agent',
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('posts lead via fetch and succeeds when response is ok', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response('ok', { status: 200 }));

    const { sendTourRequestLead } = await importService();
    await sendTourRequestLead(tour, values);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: expect.any(String),
      keepalive: true,
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(payload).toMatchObject({
      ...values,
      idempotencyKey: 'lead-idempotency-key',
      tourId: tour.tourId,
      tourTitle: 'Мараловая ферма — Парк Драконов',
      season: tour.season,
      userAgent: 'vitest-user-agent',
    });
    expect(payload).not.toHaveProperty(legacySecretPayloadKey);
    expect(payload).not.toHaveProperty('secret');
  });

  it('throws TourRequestLeadError when response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('fail', { status: 500 }));

    const { sendTourRequestLead, TourRequestLeadError } = await importService();

    await expect(sendTourRequestLead(tour, values)).rejects.toThrow(TourRequestLeadError);
    await expect(sendTourRequestLead(tour, values)).rejects.toMatchObject({
      code: 'rejected',
    });
  });

  it('throws TourRequestLeadError on network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    const { sendTourRequestLead, TourRequestLeadError } = await importService();

    await expect(sendTourRequestLead(tour, values)).rejects.toThrow(TourRequestLeadError);
    await expect(sendTourRequestLead(tour, values)).rejects.toMatchObject({
      code: 'network',
    });
  });

  it('fails fast when the public endpoint is not configured', async () => {
    vi.stubEnv('VITE_TOUR_REQUEST_ENDPOINT_URL', '');

    const { sendTourRequestLead, TourRequestLeadError } = await importService();

    await expect(sendTourRequestLead(tour, values)).rejects.toThrow(TourRequestLeadError);
    await expect(sendTourRequestLead(tour, values)).rejects.toMatchObject({
      code: 'not-configured',
    });
  });
});
