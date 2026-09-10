import type { PublishQueueItem } from '../cms/publishQueue';
import type { CmsTourDocument } from '../cms/cmsTourDocument';
import type { CmsTourMeta } from '../cms/cmsTourMeta';
import type { CmsTourTextPatch } from '../cms/applyTourTextPatch';
import type { CmsTourLayoutPatch } from '../cms/applyTourLayoutPatch';
import type { CrmDeal, CrmFile, CrmMessenger, CrmTouchKind } from '../crm/crmDocument';
import type { SiteContentDocument, SiteContentDocumentKind } from '../cms/siteContentDocument';

const cmsApiBaseUrl = (import.meta.env.VITE_CMS_API_BASE_URL ?? '').trim().replace(/\/+$/, '');

function cmsApiUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (cmsApiBaseUrl.length === 0 || typeof input !== 'string' || !input.startsWith('/')) {
    return input;
  }
  return `${cmsApiBaseUrl}${input}`;
}

const fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
  globalThis.fetch(cmsApiUrl(input), init);

export type AdminSession = {
  login: string;
  role: 'admin' | 'editor';
  canPublishTours: boolean;
  canPublishSchedule: boolean;
  canEditSiteContent?: boolean;
};

export type AdminTourListItem = {
  id: string;
  title: string;
  season: CmsTourDocument['season'];
  status: CmsTourDocument['status'];
  published: boolean;
  publishedStatus?: CmsTourDocument['status'] | null;
  slug: string;
  imageUrl: string | null;
  ready: boolean;
  readyCount: number;
  readyTotal: number;
  returnReason?: string | null;
  readiness?: { ready: boolean; blockers: Array<{ code: string; section: string; focus: string }> };
};

export type AdminDepartureStatus = 'planned' | 'open' | 'full' | 'cancelled' | 'completed';
export type AdminEditableDepartureStatus = Exclude<AdminDepartureStatus, 'completed'>;

export type AdminDeparture = {
  id: string;
  tourId: string;
  startsOn: string;
  endsOn?: string;
  seats: number;
  status: AdminDepartureStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
};

export type AdminSiteContentResponse = { document: SiteContentDocument; meta: CmsTourMeta };

async function readSiteContent(response: Response, fallback: string): Promise<AdminSiteContentResponse> {
  if (response.status === 403) throw new Error('forbidden');
  if (response.status === 409) throw new Error('rev_conflict');
  if (!response.ok) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body.error ?? fallback);
  }
  return readJson<AdminSiteContentResponse>(response);
}

export async function adminGetSiteContent(kind: SiteContentDocumentKind): Promise<AdminSiteContentResponse> {
  return readSiteContent(await fetch(`/api/cms/site-content/${kind}`, { credentials: 'include' }), 'site_content_load_failed');
}

export async function adminSaveSiteContent(
  kind: SiteContentDocumentKind,
  rev: number,
  document: SiteContentDocument,
): Promise<AdminSiteContentResponse> {
  return readSiteContent(await fetch(`/api/cms/site-content/${kind}`, {
    method: 'PUT', credentials: 'include', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rev, document }),
  }), 'site_content_save_failed');
}

export async function adminPublishSiteContent(
  kind: SiteContentDocumentKind,
  rev: number,
): Promise<AdminSiteContentResponse> {
  return readSiteContent(await fetch(`/api/cms/site-content/${kind}/publish`, {
    method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rev }),
  }), 'site_content_publish_failed');
}

export async function adminUploadSiteAsset(kind: SiteContentDocumentKind, file: File, alt = ''): Promise<{ asset: { assetId: string; url: string; mimeType: string; alt: string } }> {
  const form = new FormData(); form.set('file', file); form.set('alt', alt);
  const response = await fetch(`/api/cms/site-content/${kind}/assets`, { method: 'POST', credentials: 'include', body: form });
  if (response.status === 403) throw new Error('forbidden');
  if (!response.ok) throw new Error('site_asset_upload_failed');
  return readJson(response);
}

export async function adminDeleteSiteAsset(kind: SiteContentDocumentKind, assetId: string): Promise<void> {
  const response = await fetch(`/api/cms/site-content/${kind}/assets/${encodeURIComponent(assetId)}`, { method: 'DELETE', credentials: 'include' });
  if (response.status === 403) throw new Error('forbidden');
  if (!response.ok) throw new Error('site_asset_delete_failed');
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function readDeparture(response: Response): Promise<AdminDeparture> {
  if (!response.ok) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body.error ?? 'departure_failed');
  }
  return readJson<AdminDeparture>(response);
}

export async function adminLogin(login: string, password: string): Promise<AdminSession> {
  const response = await fetch('/api/cms/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  if (!response.ok) {
    throw new Error('login_failed');
  }
  return readJson<AdminSession>(response);
}

export async function adminLogout(): Promise<void> {
  await fetch('/api/cms/logout', { method: 'POST', credentials: 'include' });
}

export async function adminMe(): Promise<AdminSession | null> {
  const response = await fetch('/api/cms/me', { credentials: 'include' });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error('me_failed');
  }
  return readJson<AdminSession>(response);
}

export async function adminListTours(): Promise<AdminTourListItem[]> {
  const response = await fetch('/api/cms/tours', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('list_failed');
  }
  const body = await readJson<{ tours: AdminTourListItem[] }>(response);
  return body.tours;
}

export async function adminListDepartures(input: {
  from: string;
  to: string;
  includeHistory?: boolean;
}): Promise<AdminDeparture[]> {
  const query = new URLSearchParams({
    from: input.from,
    to: input.to,
    ...(input.includeHistory == null
      ? {}
      : { includeHistory: String(input.includeHistory) }),
  });
  const response = await fetch(`/api/cms/departures?${query}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body.error ?? 'departures_failed');
  }
  const body = await readJson<{ departures: AdminDeparture[] }>(response);
  return body.departures;
}

export async function adminCreateDeparture(input: {
  tourId: string;
  startsOn: string;
  seats?: number;
}): Promise<AdminDeparture> {
  const response = await fetch('/api/cms/departures', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return readDeparture(response);
}

export async function adminUpdateDeparture(
  id: string,
  input: {
    version: number;
    startsOn?: string;
    seats?: number;
    status?: AdminEditableDepartureStatus;
  },
): Promise<AdminDeparture> {
  const response = await fetch(`/api/cms/departures/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return readDeparture(response);
}

export async function adminDeleteDeparture(id: string): Promise<void> {
  const response = await fetch(`/api/cms/departures/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (response.status === 204) {
    return;
  }
  const body = await readJson<{ error?: string }>(response);
  throw new Error(body.error ?? 'departure_delete_failed');
}

export async function adminCreateTour(input: {
  title: string;
  season: CmsTourDocument['season'];
  slug?: string;
}): Promise<{ document: CmsTourDocument; meta: CmsTourMeta }> {
  const response = await fetch('/api/cms/tours', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (response.status === 409) {
    throw new Error('slug_taken');
  }
  if (response.status === 400) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body.error === 'invalid_slug' ? 'invalid_slug' : 'create_failed');
  }
  if (!response.ok) {
    throw new Error('create_failed');
  }
  return readJson(response);
}

export async function adminCloneTour(
  id: string,
  targetSeason: CmsTourDocument['season'],
): Promise<{ document: CmsTourDocument; meta: CmsTourMeta }> {
  const response = await fetch(`/api/cms/tours/${encodeURIComponent(id)}/clone`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ targetSeason }),
  });
  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error ?? 'clone_failed');
  }
  return readJson(response);
}

export async function adminDeleteTour(id: string): Promise<void> {
  const response = await fetch(`/api/cms/tours/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (response.status === 204) {
    return;
  }
  const body = await readJson<{ error?: string }>(response);
  throw new Error(body.error ?? 'tour_delete_failed');
}

export async function adminGetTour(
  id: string
): Promise<{
  document: CmsTourDocument;
  meta: CmsTourMeta;
  published: boolean;
  publishedStatus?: CmsTourDocument['status'] | null;
}> {
  const response = await fetch(`/api/cms/tours/${id}`, { credentials: 'include' });
  if (!response.ok) {
    throw new Error('get_failed');
  }
  return readJson(response);
}

export async function adminSaveTour(
  id: string,
  rev: number,
  patch: CmsTourTextPatch,
  layout: CmsTourLayoutPatch,
  status?: CmsTourDocument['status'],
): Promise<{ document: CmsTourDocument; meta: CmsTourMeta }> {
  const response = await fetch(`/api/cms/tours/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rev, patch, layout, status }),
  });
  if (response.status === 409) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body.error === 'slug_taken' ? 'slug_taken' : 'rev_conflict');
  }
  if (response.status === 400) {
    const body = await readJson<{ error?: string }>(response);
    if (body.error === 'Invalid slug' || body.error === 'invalid_slug') {
      throw new Error('invalid_slug');
    }
    throw new Error('save_failed');
  }
  if (!response.ok) {
    throw new Error('save_failed');
  }
  return readJson(response);
}

export async function adminUploadTourAsset(
  id: string,
  rev: number,
  still: File,
  video: File | null,
  alt: string
): Promise<{ document: CmsTourDocument; meta: CmsTourMeta; assetId: string }> {
  const form = new FormData();
  form.set('rev', String(rev));
  form.set('still', still);
  form.set('alt', alt);
  if (video != null) {
    form.set('video', video);
  }
  const response = await fetch(`/api/cms/tours/${id}/assets`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (response.status === 409) {
    throw new Error('rev_conflict');
  }
  if (!response.ok) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body.error ?? 'upload_failed');
  }
  return readJson(response);
}

export async function adminDeleteTourAsset(
  id: string,
  rev: number,
  assetId: string
): Promise<{ document: CmsTourDocument; meta: CmsTourMeta }> {
  const response = await fetch(
    `/api/cms/tours/${encodeURIComponent(id)}/assets/${encodeURIComponent(assetId)}?rev=${rev}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );
  if (response.status === 409) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error === 'asset_in_use' ? 'asset_in_use' : 'rev_conflict');
  }
  if (!response.ok) {
    throw new Error('delete_failed');
  }
  return readJson(response);
}

export async function adminPublishTour(
  id: string,
  rev: number,
  options: { confirmDeleteFutureDepartures?: boolean } = {},
): Promise<{ document: CmsTourDocument; meta: CmsTourMeta }> {
  const response = await fetch(`/api/cms/tours/${id}/publish`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      rev,
      confirmDeleteFutureDepartures: options.confirmDeleteFutureDepartures === true,
    }),
  });
  if (response.status === 409) {
    throw new Error('rev_conflict');
  }
  if (response.status === 403) {
    throw new Error('forbidden');
  }
  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error ?? 'publish_failed');
  }
  return readJson(response);
}

export type AdminPublishQueueItem = PublishQueueItem;

export async function adminListPublishQueue(): Promise<AdminPublishQueueItem[]> {
  const response = await fetch('/api/cms/publish-queue', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('queue_failed');
  }
  const body = await readJson<{ items: AdminPublishQueueItem[] }>(response);
  return body.items;
}

export async function adminSubmitPublishQueue(input: {
  tourIds?: string[];
  departureIds?: string[];
} = {}): Promise<void> {
  const response = await fetch('/api/cms/publish-queue/submit', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('submit_failed');
  }
}

export async function adminPublishQueue(input: {
  tourIds?: string[];
  departureIds?: string[];
  tourRevs?: Record<string, number>;
  confirmDeleteFutureDepartures?: boolean;
} = {}): Promise<void> {
  const response = await fetch('/api/cms/publish-queue/publish', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (response.status === 403) {
    throw new Error('forbidden');
  }
  if (!response.ok) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body.error ?? 'publish_failed');
  }
}

export async function adminReturnPublishQueue(input: {
  reason: string;
  tourIds?: string[];
  departureIds?: string[];
}): Promise<void> {
  const response = await fetch('/api/cms/publish-queue/return', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (response.status === 403) {
    throw new Error('forbidden');
  }
  if (!response.ok) {
    throw new Error('return_failed');
  }
}

export async function adminPublishDepartures(ids: string[]): Promise<void> {
  const response = await fetch('/api/cms/departures/publish', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (response.status === 403) {
    throw new Error('forbidden');
  }
  if (!response.ok) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body.error ?? 'publish_failed');
  }
}

export async function adminPublishAllEligibleDepartures(): Promise<void> {
  const response = await fetch('/api/cms/departures/publish', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ allEligible: true }),
  });
  if (response.status === 403) {
    throw new Error('forbidden');
  }
  if (!response.ok) {
    const body = await readJson<{ error?: string }>(response);
    throw new Error(body.error ?? 'publish_failed');
  }
}

export type AdminUser = {
  login: string;
  role: AdminSession['role'];
  canPublishTours: boolean;
  canPublishSchedule: boolean;
  canEditSiteContent?: boolean;
};

export async function adminListUsers(): Promise<AdminUser[]> {
  const response = await fetch('/api/cms/users', { credentials: 'include' });
  if (response.status === 403) {
    throw new Error('forbidden');
  }
  if (!response.ok) {
    throw new Error('users_failed');
  }
  const body = await readJson<{ users: AdminUser[] }>(response);
  return body.users;
}

export async function adminCreateUser(
  login: string,
  password: string,
  role: AdminUser['role']
): Promise<AdminUser[]> {
  const response = await fetch('/api/cms/users', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ login, password, role }),
  });
  if (response.status === 409) {
    throw new Error('login_taken');
  }
  if (!response.ok) {
    throw new Error('users_failed');
  }
  const body = await readJson<{ users: AdminUser[] }>(response);
  return body.users;
}

export async function adminUpdateUser(
  login: string,
  patch: {
    role?: AdminUser['role'];
    password?: string;
    canPublishTours?: boolean;
    canPublishSchedule?: boolean;
    canEditSiteContent?: boolean;
  }
): Promise<AdminUser[]> {
  const response = await fetch(`/api/cms/users/${encodeURIComponent(login)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (response.status === 409) {
    throw new Error('last_admin');
  }
  if (!response.ok) {
    throw new Error('users_failed');
  }
  const body = await readJson<{ users: AdminUser[] }>(response);
  return body.users;
}

export async function adminDeleteUser(login: string): Promise<AdminUser[]> {
  const response = await fetch(`/api/cms/users/${encodeURIComponent(login)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (response.status === 409) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error === 'cannot_delete_self' ? 'cannot_delete_self' : 'last_admin');
  }
  if (!response.ok) {
    throw new Error('users_failed');
  }
  const body = await readJson<{ users: AdminUser[] }>(response);
  return body.users;
}

export type AdminCrmPersonDraft = {
  name: string;
  phone: string;
  messenger: CrmMessenger;
  messengerHandle?: string;
  note?: string;
  folder?: string | null;
};

export type AdminCrmDealDraft = {
  tourId: string;
  tourTitle: string;
  date: string;
  status?: CrmDeal['status'];
  paid?: boolean;
  doubts?: boolean;
  pauseReason?: string;
  comment?: string;
  nextStep?: string;
  nextStepAt?: string | null;
};

async function readCrm(response: Response): Promise<CrmFile> {
  if (response.status === 409) {
    throw new Error('rev_conflict');
  }
  if (!response.ok) {
    throw new Error('crm_failed');
  }
  return readJson<CrmFile>(response);
}

export async function adminGetCrm(): Promise<CrmFile> {
  const response = await fetch('/api/cms/crm', { credentials: 'include' });
  return readCrm(response);
}

export async function adminCreateCrmPerson(
  rev: number,
  person: AdminCrmPersonDraft,
  deal?: AdminCrmDealDraft,
): Promise<CrmFile & { personId: string }> {
  const response = await fetch('/api/cms/crm/people', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rev, person, deal }),
  });
  if (response.status === 409) {
    throw new Error('rev_conflict');
  }
  if (!response.ok) {
    throw new Error('crm_failed');
  }
  return readJson(response);
}

export async function adminUpdateCrmPerson(
  id: string,
  rev: number,
  person: AdminCrmPersonDraft,
): Promise<CrmFile> {
  const response = await fetch(`/api/cms/crm/people/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rev, person }),
  });
  return readCrm(response);
}

export async function adminCreateCrmDeal(
  personId: string,
  rev: number,
  deal: AdminCrmDealDraft,
): Promise<CrmFile> {
  const response = await fetch(`/api/cms/crm/people/${encodeURIComponent(personId)}/deals`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rev, deal }),
  });
  return readCrm(response);
}

export async function adminUpdateCrmDeal(
  id: string,
  rev: number,
  deal: Partial<AdminCrmDealDraft>,
): Promise<CrmFile> {
  const response = await fetch(`/api/cms/crm/deals/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rev, deal }),
  });
  return readCrm(response);
}

export async function adminAddCrmTouch(
  dealId: string,
  rev: number,
  kind: CrmTouchKind,
): Promise<CrmFile> {
  const response = await fetch(`/api/cms/crm/deals/${encodeURIComponent(dealId)}/touches`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rev, kind }),
  });
  return readCrm(response);
}
