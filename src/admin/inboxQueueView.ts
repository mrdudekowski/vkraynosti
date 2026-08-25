import type { PublishQueueSummary } from '../cms/publishQueue';
import type { AdminPublishQueueItem } from './api';
import { ADMIN_UI } from './constants/ui';
import { formatAdminQueueDate } from './formatAdminCopy';

export const INBOX_KIND_FILTERS = ['all', 'tour', 'departure'] as const;
export type InboxKindFilter = (typeof INBOX_KIND_FILTERS)[number];

export const INBOX_READINESS_FILTERS = ['all', 'ready', 'blockers'] as const;
export type InboxReadinessFilter = (typeof INBOX_READINESS_FILTERS)[number];

export const INBOX_SORTS = ['newest', 'oldest'] as const;
export type InboxSort = (typeof INBOX_SORTS)[number];

export const INBOX_AUTHOR_ALL = '' as const;
export const INBOX_AUTHOR_UNKNOWN = '__unknown__' as const;

export type InboxQueueFilters = {
  kind: InboxKindFilter;
  readiness: InboxReadinessFilter;
  author: string;
  query: string;
  sort: InboxSort;
};

export const QUEUE_SUMMARY_LABEL: Record<PublishQueueSummary, string> = {
  new_tour: ADMIN_UI.inboxSummaryNewTour,
  tour_draft: ADMIN_UI.inboxSummaryTourDraft,
  new_departure: ADMIN_UI.inboxSummaryNewDeparture,
  departure_draft: ADMIN_UI.inboxSummaryDepartureDraft,
};

export function isInboxKindFilter(value: string): value is InboxKindFilter {
  return (INBOX_KIND_FILTERS as readonly string[]).includes(value);
}

export function isInboxSort(value: string): value is InboxSort {
  return (INBOX_SORTS as readonly string[]).includes(value);
}

export function inboxQueueItemKey(item: AdminPublishQueueItem): string {
  return `${item.kind}:${item.id}`;
}

export function isInboxQueueItemReady(item: AdminPublishQueueItem): boolean {
  return item.ready !== false;
}

export function inboxQueueStats(items: readonly AdminPublishQueueItem[]): {
  tours: number;
  departures: number;
  blockers: number;
} {
  return {
    tours: items.filter((item) => item.kind === 'tour').length,
    departures: items.filter((item) => item.kind === 'departure').length,
    blockers: items.filter((item) => !isInboxQueueItemReady(item)).length,
  };
}

export function inboxQueueAuthors(items: readonly AdminPublishQueueItem[]): string[] {
  const authors = new Set<string>();
  for (const item of items) {
    if (item.author != null && item.author.trim().length > 0) {
      authors.add(item.author);
    }
  }
  return [...authors].sort((left, right) => left.localeCompare(right, 'ru'));
}

export function inboxQueueHasUnknownAuthor(items: readonly AdminPublishQueueItem[]): boolean {
  return items.some((item) => item.author == null || item.author.trim().length === 0);
}

function inboxQueueSearchText(item: AdminPublishQueueItem): string {
  return [
    item.title,
    item.tourId,
    item.startsOn,
    item.author,
    item.summary != null ? QUEUE_SUMMARY_LABEL[item.summary] : '',
  ]
    .filter((part): part is string => part != null && part.length > 0)
    .join(' ');
}

export function matchesInboxQueueFilters(
  item: AdminPublishQueueItem,
  filters: InboxQueueFilters,
): boolean {
  if (filters.kind !== 'all' && item.kind !== filters.kind) {
    return false;
  }
  if (filters.readiness === 'ready' && !isInboxQueueItemReady(item)) {
    return false;
  }
  if (filters.readiness === 'blockers' && isInboxQueueItemReady(item)) {
    return false;
  }
  if (filters.author === INBOX_AUTHOR_UNKNOWN) {
    if (item.author != null && item.author.trim().length > 0) {
      return false;
    }
  } else if (filters.author !== INBOX_AUTHOR_ALL && item.author !== filters.author) {
    return false;
  }
  const needle = filters.query.trim().toLocaleLowerCase('ru-RU');
  if (needle.length > 0 && !inboxQueueSearchText(item).toLocaleLowerCase('ru-RU').includes(needle)) {
    return false;
  }
  return true;
}

export function sortInboxQueueItems(
  items: readonly AdminPublishQueueItem[],
  sort: InboxSort,
): AdminPublishQueueItem[] {
  return [...items].sort((left, right) => {
    const leftTime = left.timestamp ?? '';
    const rightTime = right.timestamp ?? '';
    return sort === 'newest' ? rightTime.localeCompare(leftTime) : leftTime.localeCompare(rightTime);
  });
}

export function filterInboxQueueItems(
  items: readonly AdminPublishQueueItem[],
  filters: InboxQueueFilters,
): AdminPublishQueueItem[] {
  return sortInboxQueueItems(
    items.filter((item) => matchesInboxQueueFilters(item, filters)),
    filters.sort,
  );
}

export function inboxQueueItemTitle(item: AdminPublishQueueItem): string {
  if (item.kind === 'tour') {
    return item.title ?? item.tourId;
  }
  return item.title ?? ADMIN_UI.inboxDepartureItem;
}

export function inboxQueueChangeLine(item: AdminPublishQueueItem): string {
  if (item.kind === 'departure' && item.startsOn != null) {
    return formatAdminQueueDate(item.startsOn);
  }
  const parts: string[] = [];
  if (item.publishedPrice != null && item.price != null && item.publishedPrice !== item.price) {
    parts.push(`${ADMIN_UI.inboxDiffPrice}: ${item.publishedPrice} → ${item.price}`);
  }
  if (item.publishedSeason != null && item.season != null && item.publishedSeason !== item.season) {
    parts.push(
      `${ADMIN_UI.inboxDiffSeason}: ${ADMIN_UI.seasons[item.publishedSeason]} → ${ADMIN_UI.seasons[item.season]}`,
    );
  }
  if (item.publishedStatus != null && item.status != null && item.publishedStatus !== item.status) {
    parts.push(`${ADMIN_UI.tourStatus[item.publishedStatus]} → ${ADMIN_UI.tourStatus[item.status]}`);
  }
  if (parts.length > 0) {
    return parts.join(' · ');
  }
  return item.summary != null ? QUEUE_SUMMARY_LABEL[item.summary] : '';
}

export function inboxQueueItemSubtitle(item: AdminPublishQueueItem): string {
  return inboxQueueChangeLine(item);
}

export function inboxQueueStatusLabel(item: AdminPublishQueueItem): string {
  if (!isInboxQueueItemReady(item)) {
    return ADMIN_UI.inboxHasBlockers;
  }
  return item.summary != null ? QUEUE_SUMMARY_LABEL[item.summary] : ADMIN_UI.inboxReadyYes;
}
