import { timingSafeEqual } from 'node:crypto';
import type { Hono } from 'hono';
import { z } from 'zod';
import {
  CRM_DEAL_STATUSES,
  CRM_INBOUND_SOURCES,
  CRM_MESSENGERS,
  CRM_TOUCH_KINDS,
  addCrmFolder,
  bumpCrmRev,
  type CrmDeal,
  type CrmFile,
  type CrmPerson,
  type CrmTouch,
  upsertDeal,
  upsertPerson,
} from '../../../src/crm/crmDocument.ts';
import type { CmsApiEnv } from './env.ts';
import { loadCrmFile, saveCrmFile } from './crmStore.ts';
import type { CmsSession } from './session.ts';
import type { CmsJsonStore } from './store.ts';

type CrmApp = Hono<{ Variables: { session: CmsSession } }>;

const messengerSchema = z.enum(CRM_MESSENGERS);
const inboundSourceSchema = z.enum(CRM_INBOUND_SOURCES);

const personDraftSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  messenger: messengerSchema,
  messengerHandle: z.string().trim().optional(),
  note: z.string().optional(),
  folder: z.string().trim().min(1).nullable().optional(),
});

const dealDraftSchema = z.object({
  tourId: z.string().trim().min(1),
  tourTitle: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(CRM_DEAL_STATUSES).optional(),
  paid: z.boolean().optional(),
  doubts: z.boolean().optional(),
  pauseReason: z.string().optional(),
  comment: z.string().optional(),
  nextStep: z.string().optional(),
  nextStepAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

const createPersonBodySchema = z.object({
  rev: z.number().int().positive(),
  person: personDraftSchema,
  deal: dealDraftSchema.optional(),
});

const updatePersonBodySchema = z.object({
  rev: z.number().int().positive(),
  person: personDraftSchema,
});

const createDealBodySchema = z.object({
  rev: z.number().int().positive(),
  deal: dealDraftSchema,
});

const updateDealBodySchema = z.object({
  rev: z.number().int().positive(),
  deal: dealDraftSchema.partial().extend({
    status: z.enum(CRM_DEAL_STATUSES).optional(),
  }),
});

const touchBodySchema = z.object({
  rev: z.number().int().positive(),
  kind: z.enum(CRM_TOUCH_KINDS),
  note: z.string().optional(),
});

const folderBodySchema = z.object({
  rev: z.number().int().positive(),
  folder: z.string().trim().min(1),
});

const inboundBodySchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  messenger: messengerSchema.or(z.enum(['whatsapp', 'telegram', 'max'])).optional(),
  preferredMessenger: z.enum(['whatsapp', 'telegram', 'max']).optional(),
  messengerHandle: z.string().trim().optional(),
  note: z.string().optional(),
  comment: z.string().optional(),
  tourId: z.string().trim().min(1).optional(),
  tourTitle: z.string().trim().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  preferredDepartureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  source: inboundSourceSchema.optional(),
});

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function assertRev(file: CrmFile, rev: number): boolean {
  return file.rev === rev;
}

function secretsEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  if (leftBytes.length === 0 || leftBytes.length !== rightBytes.length) {
    return false;
  }
  return timingSafeEqual(leftBytes, rightBytes);
}

function inboundAuthorized(header: string | undefined, secret: string): boolean {
  if (secret.length === 0 || header == null) {
    return false;
  }
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : header;
  return secretsEqual(token, secret);
}

function buildPerson(
  draft: z.infer<typeof personDraftSchema>,
  existing: CrmPerson | null,
  at: string,
): CrmPerson {
  return {
    id: existing?.id ?? newId('p'),
    name: draft.name,
    phone: draft.phone,
    messenger: draft.messenger,
    messengerHandle: draft.messengerHandle ?? existing?.messengerHandle ?? '',
    note: draft.note ?? existing?.note ?? '',
    folder: draft.folder === undefined ? (existing?.folder ?? null) : draft.folder,
    createdAt: existing?.createdAt ?? at,
    updatedAt: at,
  };
}

function buildDeal(
  draft: z.infer<typeof dealDraftSchema>,
  personId: string,
  ownerLogin: string,
  source: CrmDeal['source'],
  existing: CrmDeal | null,
  at: string,
): CrmDeal {
  return {
    id: existing?.id ?? newId('d'),
    personId,
    tourId: draft.tourId,
    tourTitle: draft.tourTitle,
    date: draft.date,
    status: draft.status ?? existing?.status ?? 'new',
    paid: draft.paid ?? existing?.paid ?? false,
    doubts: draft.doubts ?? existing?.doubts ?? false,
    pauseReason: draft.pauseReason ?? existing?.pauseReason ?? '',
    comment: draft.comment ?? existing?.comment ?? '',
    nextStep: draft.nextStep ?? existing?.nextStep ?? '',
    nextStepAt: draft.nextStepAt === undefined ? (existing?.nextStepAt ?? null) : draft.nextStepAt,
    source: existing?.source ?? source,
    ownerLogin: existing?.ownerLogin ?? ownerLogin,
    touches: existing?.touches ?? [],
    createdAt: existing?.createdAt ?? at,
    updatedAt: at,
  };
}

export function registerCrmRoutes(app: CrmApp, store: CmsJsonStore, env: CmsApiEnv): void {
  app.get('/api/cms/crm', async (c) => {
    const file = await loadCrmFile(store);
    return c.json(file);
  });

  app.post('/api/cms/crm/people', async (c) => {
    const parsed = createPersonBodySchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const file = await loadCrmFile(store);
    if (!assertRev(file, parsed.data.rev)) {
      return c.json({ error: 'rev_conflict', rev: file.rev }, 409);
    }
    const at = nowIso();
    const session = c.get('session');
    const person = buildPerson(parsed.data.person, null, at);
    let next = upsertPerson(file, person);
    if (parsed.data.deal != null) {
      next = upsertDeal(
        next,
        buildDeal(parsed.data.deal, person.id, session.sub, 'admin', null, at),
      );
    }
    if (person.folder != null) {
      next = addCrmFolder(next, person.folder);
    }
    next = bumpCrmRev(next);
    await saveCrmFile(store, next);
    return c.json({ ...next, personId: person.id }, 201);
  });

  app.put('/api/cms/crm/people/:id', async (c) => {
    const parsed = updatePersonBodySchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const file = await loadCrmFile(store);
    if (!assertRev(file, parsed.data.rev)) {
      return c.json({ error: 'rev_conflict', rev: file.rev }, 409);
    }
    const current = file.people.find((item) => item.id === c.req.param('id'));
    if (current == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const person = buildPerson(parsed.data.person, current, nowIso());
    let next = upsertPerson(file, person);
    if (person.folder != null) {
      next = addCrmFolder(next, person.folder);
    }
    next = bumpCrmRev(next);
    await saveCrmFile(store, next);
    return c.json(next);
  });

  app.post('/api/cms/crm/people/:id/deals', async (c) => {
    const parsed = createDealBodySchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const file = await loadCrmFile(store);
    if (!assertRev(file, parsed.data.rev)) {
      return c.json({ error: 'rev_conflict', rev: file.rev }, 409);
    }
    const person = file.people.find((item) => item.id === c.req.param('id'));
    if (person == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const deal = buildDeal(parsed.data.deal, person.id, c.get('session').sub, 'admin', null, nowIso());
    const next = bumpCrmRev(upsertDeal(file, deal));
    await saveCrmFile(store, next);
    return c.json({ ...next, dealId: deal.id }, 201);
  });

  app.put('/api/cms/crm/deals/:id', async (c) => {
    const parsed = updateDealBodySchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const file = await loadCrmFile(store);
    if (!assertRev(file, parsed.data.rev)) {
      return c.json({ error: 'rev_conflict', rev: file.rev }, 409);
    }
    const current = file.deals.find((item) => item.id === c.req.param('id'));
    if (current == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const deal = buildDeal(
      {
        tourId: parsed.data.deal.tourId ?? current.tourId,
        tourTitle: parsed.data.deal.tourTitle ?? current.tourTitle,
        date: parsed.data.deal.date ?? current.date,
        status: parsed.data.deal.status,
        paid: parsed.data.deal.paid,
        doubts: parsed.data.deal.doubts,
        pauseReason: parsed.data.deal.pauseReason,
        comment: parsed.data.deal.comment,
        nextStep: parsed.data.deal.nextStep,
        nextStepAt: parsed.data.deal.nextStepAt,
      },
      current.personId,
      current.ownerLogin,
      current.source,
      current,
      nowIso(),
    );
    const next = bumpCrmRev(upsertDeal(file, deal));
    await saveCrmFile(store, next);
    return c.json(next);
  });

  app.post('/api/cms/crm/deals/:id/touches', async (c) => {
    const parsed = touchBodySchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const file = await loadCrmFile(store);
    if (!assertRev(file, parsed.data.rev)) {
      return c.json({ error: 'rev_conflict', rev: file.rev }, 409);
    }
    const current = file.deals.find((item) => item.id === c.req.param('id'));
    if (current == null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const at = nowIso();
    const touch: CrmTouch = {
      id: newId('t'),
      kind: parsed.data.kind,
      at,
      note: parsed.data.note ?? '',
    };
    const next = bumpCrmRev(
      upsertDeal(file, {
        ...current,
        touches: [...current.touches, touch],
        updatedAt: at,
      }),
    );
    await saveCrmFile(store, next);
    return c.json(next);
  });

  app.post('/api/cms/crm/folders', async (c) => {
    const parsed = folderBodySchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const file = await loadCrmFile(store);
    if (!assertRev(file, parsed.data.rev)) {
      return c.json({ error: 'rev_conflict', rev: file.rev }, 409);
    }
    const next = bumpCrmRev(addCrmFolder(file, parsed.data.folder));
    await saveCrmFile(store, next);
    return c.json(next);
  });

  app.post('/api/cms/crm/inbound', async (c) => {
    if (env.crmInboundSecret.length === 0) {
      return c.json({ error: 'inbound_disabled' }, 503);
    }
    if (!inboundAuthorized(c.req.header('authorization'), env.crmInboundSecret)) {
      return c.json({ error: 'unauthorized' }, 401);
    }
    const parsed = inboundBodySchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const messenger = parsed.data.messenger ?? parsed.data.preferredMessenger ?? 'phone';
    const date = parsed.data.date ?? parsed.data.preferredDepartureDate;
    const at = nowIso();
    const file = await loadCrmFile(store);
    const person = buildPerson(
      {
        name: parsed.data.name,
        phone: parsed.data.phone,
        messenger,
        messengerHandle: parsed.data.messengerHandle,
        note: parsed.data.note,
        folder: null,
      },
      null,
      at,
    );
    let next = upsertPerson(file, person);
    if (parsed.data.tourId != null && parsed.data.tourTitle != null && date != null) {
      next = upsertDeal(
        next,
        buildDeal(
          {
            tourId: parsed.data.tourId,
            tourTitle: parsed.data.tourTitle,
            date,
            comment: parsed.data.comment,
          },
          person.id,
          'inbound',
          parsed.data.source ?? 'site',
          null,
          at,
        ),
      );
    }
    next = bumpCrmRev(next);
    await saveCrmFile(store, next);
    return c.json({ ...next, personId: person.id }, 201);
  });
}
