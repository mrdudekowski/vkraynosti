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

const originalSendBeaconDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'sendBeacon');

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
    Reflect.deleteProperty(navigator, 'sendBeacon');
    if (originalSendBeaconDescriptor) {
      Object.defineProperty(Navigator.prototype, 'sendBeacon', originalSendBeaconDescriptor);
    } else {
      Reflect.deleteProperty(Navigator.prototype, 'sendBeacon');
    }
  });

  it('sends a public lead payload without client-side secrets', async () => {
    let capturedBody: BodyInit | null = null;
    const sendBeacon = vi.fn((url: string, body: BodyInit) => {
      expect(url).toBe(endpointUrl);
      capturedBody = body;
      return true;
    });
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: sendBeacon,
    });

    const { sendTourRequestLead } = await importService();
    await sendTourRequestLead(tour, values);

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
    const sentBody = capturedBody as Blob | null;
    expect(sentBody).toBeInstanceOf(Blob);
    if (sentBody == null) {
      throw new Error('Expected sendBeacon payload to be a Blob');
    }

    const payload = JSON.parse(await sentBody.text()) as Record<string, unknown>;
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

  it('fails fast when the public endpoint is not configured', async () => {
    vi.stubEnv('VITE_TOUR_REQUEST_ENDPOINT_URL', '');
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: vi.fn(),
    });

    const { sendTourRequestLead } = await importService();

    await expect(sendTourRequestLead(tour, values)).rejects.toThrow('Tour request endpoint is not configured');
  });
});
