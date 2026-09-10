import { describe, expect, it } from 'vitest';
import type { AdminPublishQueueItem } from './api';
import {
  INBOX_AUTHOR_UNKNOWN,
  filterInboxQueueItems,
  inboxQueueAuthors,
  inboxQueueChangeLine,
  inboxQueueHasUnknownAuthor,
  inboxQueueItemTitle,
  inboxQueueStats,
} from './inboxQueueView';

const tour: AdminPublishQueueItem = {
  kind: 'tour',
  id: 'winter-1',
  tourId: 'winter-1',
  title: 'Изюбриная',
  author: 'петр',
  timestamp: '2026-08-19T10:00:00.000Z',
  ready: true,
  summary: 'tour_draft',
};

const departure: AdminPublishQueueItem = {
  kind: 'departure',
  id: 'dep-1',
  tourId: 'winter-1',
  title: 'Изюбриная',
  startsOn: '2026-08-20',
  timestamp: '2026-08-19T12:00:00.000Z',
  ready: true,
  summary: 'new_departure',
};

const blocked: AdminPublishQueueItem = {
  kind: 'tour',
  id: 'winter-2',
  tourId: 'winter-2',
  title: 'Черновик',
  author: 'анна',
  timestamp: '2026-08-19T08:00:00.000Z',
  ready: false,
  summary: 'new_tour',
};

describe('inboxQueueView', () => {
  const items = [tour, departure, blocked];

  it('считает туры, даты и блокеры', () => {
    expect(inboxQueueStats(items)).toEqual({ tours: 2, departures: 1, blockers: 1 });
  });

  it('фильтрует по типу, готовности, автору и поиску', () => {
    expect(
      filterInboxQueueItems(items, {
        kind: 'tour',
        readiness: 'all',
        author: '',
        query: '',
        sort: 'newest',
      }).map((item) => item.id),
    ).toEqual(['winter-1', 'winter-2']);

    expect(
      filterInboxQueueItems(items, {
        kind: 'all',
        readiness: 'blockers',
        author: '',
        query: '',
        sort: 'newest',
      }).map((item) => item.id),
    ).toEqual(['winter-2']);

    expect(
      filterInboxQueueItems(items, {
        kind: 'tour',
        readiness: 'all',
        author: 'петр',
        query: '',
        sort: 'newest',
      }).map((item) => item.id),
    ).toEqual(['winter-1']);

    expect(
      filterInboxQueueItems(items, {
        kind: 'all',
        readiness: 'all',
        author: '',
        query: 'winter-2',
        sort: 'newest',
      }).map((item) => item.id),
    ).toEqual(['winter-2']);
  });

  it('ставит новые строки выше и собирает авторов', () => {
    expect(
      filterInboxQueueItems(items, {
        kind: 'all',
        readiness: 'all',
        author: '',
        query: '',
        sort: 'newest',
      }).map((item) => item.id),
    ).toEqual(['dep-1', 'winter-1', 'winter-2']);
    expect(inboxQueueAuthors(items)).toEqual(['анна', 'петр']);
    expect(inboxQueueHasUnknownAuthor(items)).toBe(true);
    expect(
      filterInboxQueueItems(items, {
        kind: 'all',
        readiness: 'all',
        author: INBOX_AUTHOR_UNKNOWN,
        query: '',
        sort: 'newest',
      }).map((item) => item.id),
    ).toEqual(['dep-1']);
  });

  it('для выезда показывает название тура и дату', () => {
    expect(inboxQueueItemTitle(departure)).toBe('Изюбриная');
    expect(inboxQueueItemTitle(tour)).toBe('Изюбриная');
  });

  it('собирает строку изменения цены для тура в очереди', () => {
    expect(
      inboxQueueChangeLine({
        kind: 'tour',
        id: 'winter-1',
        tourId: 'winter-1',
        summary: 'tour_draft',
        price: '9 000 ₽',
        publishedPrice: '6 000 ₽',
      }),
    ).toContain('9 000');
  });
});
