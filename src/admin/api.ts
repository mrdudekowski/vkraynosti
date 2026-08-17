import type { CmsTourDocument } from '../cms/cmsTourDocument';
import type { CmsTourMeta } from '../cms/cmsTourMeta';
import type { CmsTourTextPatch } from '../cms/applyTourTextPatch';
import type { CmsTourLayoutPatch } from '../cms/applyTourLayoutPatch';
import { CMS_PUBLISH_BLOCKERS } from '../cms/cmsPublishRules';
import type { CrmDeal, CrmFile, CrmMessenger, CrmTouchKind } from '../crm/crmDocument';

export type AdminSession = {
  login: string;
  role: 'admin' | 'editor';
};

export type AdminTourListItem = {
  id: string;
  title: string;
  season: CmsTourDocument['season'];
  status: CmsTourDocument['status'];
  published: boolean;
  imageUrl: string | null;
};

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
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

export async function adminGetTour(
  id: string
): Promise<{ document: CmsTourDocument; meta: CmsTourMeta }> {
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
  layout: CmsTourLayoutPatch
): Promise<{ document: CmsTourDocument; meta: CmsTourMeta }> {
  const response = await fetch(`/api/cms/tours/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rev, patch, layout }),
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
    throw new Error('upload_failed');
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
  rev: number
): Promise<{ document: CmsTourDocument; meta: CmsTourMeta }> {
  const response = await fetch(`/api/cms/tours/${id}/publish`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rev }),
  });
  if (response.status === 409) {
    throw new Error('rev_conflict');
  }
  if (response.status === 403) {
    throw new Error('forbidden');
  }
  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(
      body.error != null && (CMS_PUBLISH_BLOCKERS as readonly string[]).includes(body.error)
        ? body.error
        : 'publish_failed'
    );
  }
  return readJson(response);
}

export type AdminUser = {
  login: string;
  role: AdminSession['role'];
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
  patch: { role?: AdminUser['role']; password?: string }
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
