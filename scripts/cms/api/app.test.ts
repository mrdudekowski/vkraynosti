/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import type { CmsTourDocument } from '../../../src/cms/cmsTourDocument';
import { CMS_PUBLISHED_CATALOG_KEY } from '../../../src/cms/cmsPackageKeys';
import { createCmsApiApp } from './app';
import type { CmsApiEnv } from './env';
import { createMemoryJsonStore } from './store';

const document: CmsTourDocument = {
  id: 'winter-1',
  slug: 'izubrinaya',
  season: 'winter',
  status: 'active',
  title: 'Изюбриная',
  subtitle: 'Зима',
  heroPhrase: 'Ели',
  description: 'Старый текст',
  descriptionLeadBold: 'Гора',
  duration: '1 день',
  difficulty: 'Medium',
  price: 'по запросу',
  program: [{ timeLabel: '04:30', description: 'Выезд' }],
  included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
  coverAssetId: 'cover',
  prefaceAssetId: 'preface',
  assets: [
    {
      id: 'cover',
      stillUrl: 'https://cdn.example/cover.webp',
      videoUrl: null,
      alt: 'Обложка',
    },
    {
      id: 'preface',
      stillUrl: 'https://cdn.example/preface.webp',
      videoUrl: null,
      alt: 'Предисловие',
    },
  ],
  bento: {
    blocks: [{ type: 'bento-single', slots: [{ assetId: 'cover' }] }],
  },
  legacyGalleryVariant: null,
};

const env: CmsApiEnv = {
  port: 8787,
  authSecret: 'test-auth-secret-16',
  crmInboundSecret: 'inbound-secret-16',
  users: [
    { login: 'admin', password: 'admin-pass', role: 'admin' },
    { login: 'editor', password: 'editor-pass', role: 'editor' },
  ],
  s3: {
    bucket: 'vkraynosti-cms-dev',
    endpoint: 'https://s3.example',
    region: 'ru-1',
    accessKey: 'key',
    secretKey: 'secret',
    forcePathStyle: true,
    publicBaseUrl: 'https://s3.example/vkraynosti-cms-dev',
  },
};

function cookieFrom(response: Response): string {
  const raw = response.headers.get('set-cookie');
  if (raw == null) {
    return '';
  }
  return raw.split(';')[0] ?? '';
}

function createApp() {
  const store = createMemoryJsonStore({
    'draft/tours/winter-1/document.json': document,
    'draft/tours/winter-1/meta.json': {
      rev: 1,
      updatedAt: '2026-08-14T00:00:00.000Z',
      editor: 'cms:export',
    },
    'published/tours/winter-1/document.json': document,
    [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 1, tours: [document] },
  });
  return { app: createCmsApiApp({ env, store }), store };
}

async function login(
  app: ReturnType<typeof createCmsApiApp>,
  loginName = 'admin',
  password = 'admin-pass'
): Promise<string> {
  const response = await app.request('/api/cms/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ login: loginName, password }),
  });
  expect(response.status).toBe(200);
  return cookieFrom(response);
}

describe('CMS API', () => {
  it('логинит и отдаёт сессию', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const me = await app.request('/api/cms/me', { headers: { cookie } });
    expect(me.status).toBe(200);
    await expect(me.json()).resolves.toEqual({ login: 'admin', role: 'admin' });
  });

  it('отклоняет неверный пароль', async () => {
    const { app } = createApp();
    const response = await app.request('/api/cms/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ login: 'admin', password: 'nope' }),
    });
    expect(response.status).toBe(401);
  });

  it('без cookie не отдаёт туры', async () => {
    const { app } = createApp();
    const response = await app.request('/api/cms/tours');
    expect(response.status).toBe(401);
  });

  it('сохраняет тексты, бампит rev и пересобирает каталог', async () => {
    const { app, store } = createApp();
    const cookie = await login(app, 'editor', 'editor-pass');
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: 'Новый текст',
          descriptionLeadBold: 'Лид',
          prefaceAssetId: 'preface',
          included: [{ text: 'Гид', iconKey: 'user-tie' }],
          program: [{ timeLabel: '05:00', description: 'Сбор' }],
        },
      }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      document: CmsTourDocument;
      meta: { rev: number; editor: string };
    };
    expect(body.document.description).toBe('Новый текст');
    expect(body.document.bento).toEqual(document.bento);
    expect(body.meta.rev).toBe(2);
    expect(body.meta.editor).toBe('editor');

    const catalog = (await store.getJson(CMS_PUBLISHED_CATALOG_KEY)) as {
      tours: CmsTourDocument[];
    };
    expect(catalog.tours[0]?.description).toBe('Старый текст');
  });

  it('отдаёт 409 при устаревшем rev', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 99,
        patch: {
          description: 'x',
          prefaceAssetId: 'preface',
          included: [],
          program: [],
        },
      }),
    });
    expect(response.status).toBe(409);
    const current = await app.request('/api/cms/tours/winter-1', { headers: { cookie } });
    const body = (await current.json()) as { meta: { rev: number } };
    expect(body.meta.rev).toBe(1);
  });

  it('отдаёт 400 на неизвестную иконку', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: 'x',
          prefaceAssetId: 'preface',
          included: [{ text: 'x', iconKey: 'not-an-icon' }],
          program: [],
        },
      }),
    });
    expect(response.status).toBe(400);
  });

  it('сохраняет сетку bento', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: 'Старый текст',
          prefaceAssetId: 'preface',
          included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
          program: [{ timeLabel: '04:30', description: 'Выезд' }],
        },
        layout: {
          coverAssetId: 'cover',
          coverCrop: { card: { x: 20, y: 80 }, hero: { x: 50, y: 32 } },
          bento: {
            blocks: [
              { type: 'bento-single', slots: [{ assetId: 'preface' }] },
            ],
          },
        },
      }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { document: CmsTourDocument };
    expect(body.document.bento.blocks[0]?.slots[0]?.assetId).toBe('preface');
    expect(body.document.coverCrop).toEqual({ card: { x: 20, y: 80 }, hero: { x: 50, y: 32 } });
  });

  it('загружает still в пул', async () => {
    const { app, store } = createApp();
    const cookie = await login(app);
    const form = new FormData();
    form.set('rev', '1');
    form.set('alt', 'Новый кадр');
    form.set('still', new File([new Uint8Array([1, 2, 3, 4])], 'shot.webp', { type: 'image/webp' }));
    const response = await app.request('/api/cms/tours/winter-1/assets', {
      method: 'POST',
      headers: { cookie },
      body: form,
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      document: CmsTourDocument;
      meta: { rev: number };
      assetId: string;
    };
    expect(body.assetId).toBe('u-1');
    expect(body.meta.rev).toBe(2);
    const uploaded = body.document.assets.find((asset) => asset.id === 'u-1');
    expect(uploaded?.stillUrl).toBe(
      'https://s3.example/vkraynosti-cms-dev/media/tours/winter-1/u-1.webp'
    );
    expect(uploaded?.alt).toBe('Новый кадр');
    const catalog = (await store.getJson(CMS_PUBLISHED_CATALOG_KEY)) as {
      tours: CmsTourDocument[];
    };
    expect(catalog.tours[0]?.assets.some((asset) => asset.id === 'u-1')).toBe(false);
  });

  it('отклоняет still неверного типа', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const form = new FormData();
    form.set('rev', '1');
    form.set('still', new File([new Uint8Array([1])], 'shot.gif', { type: 'image/gif' }));
    const response = await app.request('/api/cms/tours/winter-1/assets', {
      method: 'POST',
      headers: { cookie },
      body: form,
    });
    expect(response.status).toBe(400);
  });

  it('публикует черновик в каталог только от admin', async () => {
    const { app, store } = createApp();
    const editorCookie = await login(app, 'editor', 'editor-pass');
    const forbidden = await app.request('/api/cms/tours/winter-1/publish', {
      method: 'POST',
      headers: { cookie: editorCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: 1 }),
    });
    expect(forbidden.status).toBe(403);

    const adminCookie = await login(app);
    const saved = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie: adminCookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: 'После публикации',
          prefaceAssetId: 'preface',
          included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
          program: [{ timeLabel: '04:30', description: 'Выезд' }],
        },
      }),
    });
    expect(saved.status).toBe(200);

    const published = await app.request('/api/cms/tours/winter-1/publish', {
      method: 'POST',
      headers: { cookie: adminCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: 2 }),
    });
    expect(published.status).toBe(200);
    const catalog = (await store.getJson(CMS_PUBLISHED_CATALOG_KEY)) as {
      tours: CmsTourDocument[];
    };
    expect(catalog.tours[0]?.description).toBe('После публикации');
  });

  it('не публикует, пока в пуле есть свободный кадр', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const form = new FormData();
    form.set('rev', '1');
    form.set('still', new File([new Uint8Array([1, 2, 3, 4])], 'shot.webp', { type: 'image/webp' }));
    const uploaded = await app.request('/api/cms/tours/winter-1/assets', {
      method: 'POST',
      headers: { cookie },
      body: form,
    });
    expect(uploaded.status).toBe(201);
    const response = await app.request('/api/cms/tours/winter-1/publish', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ rev: 2 }),
    });
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe('pool_not_empty');
  });

  it('сохраняет пустой слот bento', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          description: 'Старый текст',
          prefaceAssetId: 'preface',
          included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
          program: [{ timeLabel: '04:30', description: 'Выезд' }],
        },
        layout: {
          coverAssetId: 'cover',
          bento: {
            blocks: [{ type: 'bento-single', slots: [{ assetId: null }] }],
          },
        },
      }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { document: CmsTourDocument };
    expect(body.document.bento.blocks[0]?.slots[0]?.assetId).toBeNull();
  });

  it('удаляет свободный кадр пула и не трогает занятый', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const form = new FormData();
    form.set('rev', '1');
    form.set('still', new File([new Uint8Array([1, 2, 3, 4])], 'shot.webp', { type: 'image/webp' }));
    const uploaded = await app.request('/api/cms/tours/winter-1/assets', {
      method: 'POST',
      headers: { cookie },
      body: form,
    });
    expect(uploaded.status).toBe(201);

    const blocked = await app.request('/api/cms/tours/winter-1/assets/cover?rev=2', {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(blocked.status).toBe(409);
    const blockedBody = (await blocked.json()) as { error: string };
    expect(blockedBody.error).toBe('asset_in_use');

    const removed = await app.request('/api/cms/tours/winter-1/assets/u-1?rev=2', {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(removed.status).toBe(200);
    const body = (await removed.json()) as {
      document: CmsTourDocument;
      meta: { rev: number };
    };
    expect(body.meta.rev).toBe(3);
    expect(body.document.assets.some((asset) => asset.id === 'u-1')).toBe(false);
  });

  it('создаёт пользователя и пускает его в логин', async () => {
    const { app } = createApp();
    const adminCookie = await login(app);
    const created = await app.request('/api/cms/users', {
      method: 'POST',
      headers: { cookie: adminCookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        login: 'nika',
        password: 'nika-pass',
        role: 'editor',
      }),
    });
    expect(created.status).toBe(201);
    const listed = (await created.json()) as { users: Array<{ login: string }> };
    expect(listed.users.some((user) => user.login === 'nika')).toBe(true);

    const editorCookie = await login(app, 'nika', 'nika-pass');
    const forbidden = await app.request('/api/cms/users', { headers: { cookie: editorCookie } });
    expect(forbidden.status).toBe(403);
  });

  it('не даёт удалить последнего admin', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const response = await app.request('/api/cms/users/admin', {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(response.status).toBe(409);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe('cannot_delete_self');
  });

  it('создаёт черновик тура со slug из названия и показывает его в списке', async () => {
    const { app } = createApp();
    const cookie = await login(app, 'editor', 'editor-pass');
    const response = await app.request('/api/cms/tours', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Полуостров Краббе', season: 'summer' }),
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      document: CmsTourDocument;
      meta: { rev: number; editor: string };
    };
    expect(body.document.id).toBe('summer-1');
    expect(body.document.slug).toBe('poluostrov-krabbe');
    expect(body.document.status).toBe('draft');
    expect(body.document.title).toBe('Полуостров Краббе');
    expect(body.document.bento.blocks).toEqual([]);
    expect(body.meta.rev).toBe(1);
    expect(body.meta.editor).toBe('editor');

    const list = await app.request('/api/cms/tours', { headers: { cookie } });
    expect(list.status).toBe(200);
    const listed = (await list.json()) as {
      tours: Array<{ id: string; title: string; status: string }>;
    };
    expect(listed.tours.some((tour) => tour.id === 'summer-1' && tour.title === 'Полуостров Краббе')).toBe(
      true,
    );
    const winter = listed.tours.find((tour) => tour.id === 'winter-1') as
      | { published?: boolean; imageUrl?: string | null }
      | undefined;
    expect(winter?.published).toBe(true);
    expect(winter?.imageUrl).toBe('https://cdn.example/cover.webp');
  });

  it('сохраняет название и человекопонятный URL', async () => {
    const { app } = createApp();
    const cookie = await login(app, 'editor', 'editor-pass');
    const response = await app.request('/api/cms/tours/winter-1', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        patch: {
          title: 'Восхождение на Изюбриную',
          slug: 'voskhozhdenie-na-izyubrinuyu',
          description: 'Старый текст',
          prefaceAssetId: 'preface',
          included: document.included,
          program: document.program,
        },
      }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { document: CmsTourDocument };
    expect(body.document.title).toBe('Восхождение на Изюбриную');
    expect(body.document.slug).toBe('voskhozhdenie-na-izyubrinuyu');
  });

  it('не даёт занять чужой slug', async () => {
    const { app } = createApp();
    const cookie = await login(app);
    const created = await app.request('/api/cms/tours', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Другой тур', season: 'summer', slug: 'izubrinaya' }),
    });
    expect(created.status).toBe(409);
    const body = (await created.json()) as { error: string };
    expect(body.error).toBe('slug_taken');
  });
});

describe('CMS CRM API', () => {
  it('создаёт лид с туром и датой', async () => {
    const { app } = createApp();
    const cookie = await login(app, 'editor', 'editor-pass');
    const created = await app.request('/api/cms/crm/people', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        rev: 1,
        person: { name: 'Анна', phone: '+79001112233', messenger: 'telegram' },
        deal: { tourId: 'winter-1', tourTitle: 'Изюбриная', date: '2026-08-20', comment: 'подумает' },
      }),
    });
    expect(created.status).toBe(201);
    const body = (await created.json()) as {
      people: Array<{ name: string }>;
      deals: Array<{ tourTitle: string; date: string }>;
    };
    expect(body.people[0]?.name).toBe('Анна');
    expect(body.deals[0]?.tourTitle).toBe('Изюбриная');
    expect(body.deals[0]?.date).toBe('2026-08-20');
  });

  it('принимает заявку с сайта по секрету', async () => {
    const { app } = createApp();
    const created = await app.request('/api/cms/crm/inbound', {
      method: 'POST',
      headers: {
        authorization: 'Bearer inbound-secret-16',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Игорь',
        phone: '+79002223344',
        preferredMessenger: 'whatsapp',
        tourId: 'winter-1',
        tourTitle: 'Изюбриная',
        preferredDepartureDate: '2026-09-01',
        source: 'site',
      }),
    });
    expect(created.status).toBe(201);
    const cookie = await login(app);
    const list = await app.request('/api/cms/crm', { headers: { cookie } });
    const body = (await list.json()) as { deals: Array<{ source: string; date: string }> };
    expect(body.deals[0]?.source).toBe('site');
    expect(body.deals[0]?.date).toBe('2026-09-01');
  });
});
