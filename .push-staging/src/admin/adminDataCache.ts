import {
  adminListDepartures,
  adminListPublishQueue,
  adminListTours,
  type AdminDeparture,
  type AdminPublishQueueItem,
  type AdminTourListItem,
} from './api';

const ADMIN_DATA_CACHE_TTL_MS = 30_000;

type CachedResource<T> = {
  value?: T;
  fetchedAt?: number;
  pending?: Promise<T>;
  generation: number;
};

const toursResource: CachedResource<AdminTourListItem[]> = { generation: 0 };
const publishQueueResource: CachedResource<AdminPublishQueueItem[]> = { generation: 0 };
const departureResources = new Map<string, CachedResource<AdminDeparture[]>>();

function isFresh<T>(resource: CachedResource<T>): resource is CachedResource<T> & { value: T; fetchedAt: number } {
  return resource.value != null
    && resource.fetchedAt != null
    && Date.now() - resource.fetchedAt < ADMIN_DATA_CACHE_TTL_MS;
}

function readResource<T>(
  resource: CachedResource<T>,
  load: () => Promise<T>,
  forceRefresh = false,
): Promise<T> {
  if (!forceRefresh && isFresh(resource)) {
    return Promise.resolve(resource.value);
  }
  if (resource.pending != null) {
    return resource.pending;
  }

  const generation = resource.generation;
  resource.pending = load()
    .then((value) => {
      if (resource.generation === generation) {
        resource.value = value;
        resource.fetchedAt = Date.now();
      }
      return value;
    })
    .finally(() => {
      if (resource.generation === generation) {
        resource.pending = undefined;
      }
    });
  return resource.pending;
}

function departureCacheKey(input: {
  from: string;
  to: string;
  includeHistory?: boolean;
}): string {
  return `${input.from}:${input.to}:${input.includeHistory === true}`;
}

function departureResource(input: {
  from: string;
  to: string;
  includeHistory?: boolean;
}): CachedResource<AdminDeparture[]> {
  const key = departureCacheKey(input);
  const existing = departureResources.get(key);
  if (existing != null) {
    return existing;
  }
  const resource: CachedResource<AdminDeparture[]> = { generation: 0 };
  departureResources.set(key, resource);
  return resource;
}

export function getAdminTours(): Promise<AdminTourListItem[]> {
  return readResource(toursResource, adminListTours);
}

export function refreshAdminTours(): Promise<AdminTourListItem[]> {
  return readResource(toursResource, adminListTours, true);
}

export function peekAdminTours(): AdminTourListItem[] | undefined {
  return toursResource.value;
}

export function getAdminDepartures(input: {
  from: string;
  to: string;
  includeHistory?: boolean;
}): Promise<AdminDeparture[]> {
  return readResource(departureResource(input), () => adminListDepartures(input));
}

export function refreshAdminDepartures(input: {
  from: string;
  to: string;
  includeHistory?: boolean;
}): Promise<AdminDeparture[]> {
  return readResource(departureResource(input), () => adminListDepartures(input), true);
}

export function peekAdminDepartures(input: {
  from: string;
  to: string;
  includeHistory?: boolean;
}): AdminDeparture[] | undefined {
  return departureResource(input).value;
}

export function getAdminPublishQueue(): Promise<AdminPublishQueueItem[]> {
  return readResource(publishQueueResource, adminListPublishQueue);
}

export function refreshAdminPublishQueue(): Promise<AdminPublishQueueItem[]> {
  return readResource(publishQueueResource, adminListPublishQueue, true);
}

export function peekAdminPublishQueue(): AdminPublishQueueItem[] | undefined {
  return publishQueueResource.value;
}

function invalidateResource<T>(resource: CachedResource<T>): void {
  resource.generation += 1;
  resource.value = undefined;
  resource.fetchedAt = undefined;
  resource.pending = undefined;
}

export function invalidateAdminTours(): void {
  invalidateResource(toursResource);
}

export function invalidateAdminDepartures(): void {
  for (const resource of departureResources.values()) {
    invalidateResource(resource);
  }
}

export function invalidateAdminPublishQueue(): void {
  invalidateResource(publishQueueResource);
}

export function clearAdminDataCache(): void {
  toursResource.value = undefined;
  toursResource.fetchedAt = undefined;
  toursResource.pending = undefined;
  toursResource.generation += 1;
  publishQueueResource.value = undefined;
  publishQueueResource.fetchedAt = undefined;
  publishQueueResource.pending = undefined;
  publishQueueResource.generation += 1;
  departureResources.clear();
}
