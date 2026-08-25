import { getTableColumns } from 'drizzle-orm';
import { getTableConfig, PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import {
  auditLog,
  departureStatus,
  sessions,
  tourDepartures,
  users,
} from './schema.ts';

describe('auth schema', () => {
  it('exposes revocable session columns', () => {
    expect(Object.keys(getTableColumns(sessions))).toEqual(expect.arrayContaining([
      'id', 'userId', 'tokenHash', 'expiresAt', 'revokedAt', 'createdAt',
    ]));
  });

  it('keeps audit payload separate from public data', () => {
    expect(Object.keys(getTableColumns(auditLog))).toEqual(expect.arrayContaining([
      'actorUserId', 'action', 'entityType', 'entityId', 'payload', 'createdAt',
    ]));
  });

  it('stores role and password hash on users', () => {
    expect(Object.keys(getTableColumns(users))).toEqual(expect.arrayContaining([
      'login', 'passwordHash', 'role', 'isActive', 'canPublishTours', 'canPublishSchedule',
    ]));
  });
});

describe('tour departure schema', () => {
  it('defines the departure lifecycle without a paused status', () => {
    expect(departureStatus.enumValues).toEqual([
      'planned',
      'open',
      'full',
      'cancelled',
      'completed',
    ]);
    expect(departureStatus.enumValues).not.toContain('paused');
  });

  it('exposes the departure columns required for publishing', () => {
    expect(Object.keys(getTableColumns(tourDepartures))).toEqual([
      'id',
      'tourId',
      'startsOn',
      'seats',
      'status',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
      'version',
      'submittedForPublishAt',
      'publishedAt',
      'publishedStartsOn',
      'publishedSeats',
      'publishedStatus',
    ]);
  });

  it('does not store a per-departure price', () => {
    expect(Object.keys(getTableColumns(tourDepartures))).not.toContain('priceKopecks');
  });

  it('reserves a tour date only while the departure is not cancelled', () => {
    const uniqueTourDateIndex = getTableConfig(tourDepartures).indexes.find(
      (index) => index.config.name === 'tour_departures_active_tour_starts_on_uq',
    );

    expect(uniqueTourDateIndex?.config.unique).toBe(true);
    expect(uniqueTourDateIndex?.config.columns.map((column) => column.name)).toEqual([
      'tour_id',
      'starts_on',
    ]);
    const where = uniqueTourDateIndex?.config.where;
    expect(where).toBeDefined();
    if (where == null) {
      throw new Error('partial unique index where clause missing');
    }
    expect(new PgDialect().sqlToQuery(where).sql).toBe(
      '"tour_departures"."status" <> \'cancelled\'',
    );
  });
});
