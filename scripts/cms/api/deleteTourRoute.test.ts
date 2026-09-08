/** @vitest-environment node */
import { describe, expect, it, vi } from 'vitest';
import type { CmsTourDocument } from '../../../src/cms/cmsTourDocument.ts';
import {
  CMS_CRM_KEY,
  CMS_DRAFT_INDEX_KEY,
  cmsDraftDocumentKey,
} from '../../../src/cms/cmsPackageKeys.ts';
import { cmsDraftIndexFile } from '../../../src/cms/cmsDraftIndex.ts';
import { createEmptyCrmFile } from '../../../src/crm/crmDocument.ts';
import { createEmptyCmsTour } from '../../../src/cms/createEmptyCmsTour.ts';
import { createCmsSession, signCmsSession, hashSessionToken } from './session.ts';
import { createCmsApiApp } from './app.ts';
import { createMemoryJsonStore } from './store.ts';
import type { CmsApiEnv } from './env.ts';
import type { AuthRepository } from './auth/authRepository.ts';
import type { DepartureRepository } from './schedule/departureRepository.ts';

const env = {
  port: 8787,
  authSecret: 'tour-delete-test-secret',
  cookieSecure: false,
  cookieSameSite: 'Lax',
  crmInboundSecret: 'tour-delete-inbound-secret',
  users: [],
  s3: {
    bucket: 'test',
    endpoint: 'https://s3.example',
    region: 'ru-1',
    accessKey: 'key',
    secretKey: 'secret',
    forcePathStyle: true,
    publicBaseUrl: 'https://cdn.example',
  },
  storeKind: 's3',
  localStoreDir: 'tmp/cms',
} satisfies CmsApiEnv;

function makeTour(): CmsTourDocument {
  return createEmptyCmsTour({
    id: 'summer-1',
    slug: 'summer-1',
    season: 'summer',
    title: 'Удаляемый тур',
  });
}

function makeDeps(departures: Array<{ tourId: string }> = []) {
  const session = createCmsSession('admin', 'admin');
  const rawToken = 'tour-delete-session';
  const authRepository = {
    listUsers: vi.fn().mockResolvedValue([]),
    findActiveSession: vi.fn().mockResolvedValue({
      session: {
        id: 'session-1',
        userId: 'user-1',
        tokenHash: hashSessionToken(rawToken),
        expiresAt: new Date(session.exp),
        revokedAt: null,
      },
      user: {
        id: 'user-1',
        login: session.sub,
        role: 'admin',
        isActive: true,
        canPublishTours: true,
        canPublishSchedule: true,
      },
    }),
  } as unknown as AuthRepository;
  const departureRepository = {
    listAllDepartures: vi.fn().mockResolvedValue(departures),
  } as unknown as DepartureRepository;
  return {
    authRepository,
    departureRepository,
    cookie: `vkr_cms_session=${signCmsSession(session, env.authSecret)}`,
  };
}

describe('DELETE /api/cms/tours/:id', () => {
  it('physically deletes a tour without dependencies', async () => {
    const store = createMemoryJsonStore();
    const tour = makeTour();
    await store.putJson(cmsDraftDocumentKey(tour.id), tour);
    await store.putJson(CMS_DRAFT_INDEX_KEY, cmsDraftIndexFile([tour.id]));
    const deps = makeDeps();
    const app = createCmsApiApp({ env, store, ...deps });

    const response = await app.request(`/api/cms/tours/${tour.id}`, {
      method: 'DELETE',
      headers: { cookie: deps.cookie },
    });

    expect(response.status).toBe(204);
    await expect(store.getJson(cmsDraftDocumentKey(tour.id))).resolves.toBeNull();
  });

  it('blocks deletion when the tour has a departure', async () => {
    const store = createMemoryJsonStore();
    const tour = makeTour();
    await store.putJson(cmsDraftDocumentKey(tour.id), tour);
    const deps = makeDeps([{ tourId: tour.id }]);
    const app = createCmsApiApp({ env, store, ...deps });

    const response = await app.request(`/api/cms/tours/${tour.id}`, {
      method: 'DELETE',
      headers: { cookie: deps.cookie },
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: 'tour_has_dependencies' });
  });

  it('blocks deletion when the tour has a CRM deal', async () => {
    const store = createMemoryJsonStore();
    const tour = makeTour();
    const crm = createEmptyCrmFile();
    crm.people.push({
      id: 'person-1',
      name: 'Клиент',
      phone: '+70000000000',
      messenger: 'phone',
      messengerHandle: '',
      note: '',
      folder: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    crm.deals.push({
      id: 'deal-1',
      personId: 'person-1',
      tourId: tour.id,
      tourTitle: tour.title,
      date: '2026-06-01',
      status: 'new',
      paid: false,
      doubts: false,
      pauseReason: '',
      comment: '',
      nextStep: '',
      nextStepAt: null,
      source: 'admin',
      ownerLogin: 'admin',
      touches: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    await store.putJson(cmsDraftDocumentKey(tour.id), tour);
    await store.putJson(CMS_CRM_KEY, crm);
    const deps = makeDeps();
    const app = createCmsApiApp({ env, store, ...deps });

    const response = await app.request(`/api/cms/tours/${tour.id}`, {
      method: 'DELETE',
      headers: { cookie: deps.cookie },
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: 'tour_has_dependencies' });
  });
});
