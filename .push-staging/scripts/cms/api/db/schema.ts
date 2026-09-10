import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const cmsRole = pgEnum('cms_role', ['admin', 'editor']);
export const departureStatus = pgEnum('departure_status', [
  'planned',
  'open',
  'full',
  'cancelled',
  'completed',
]);

export type CmsRole = (typeof cmsRole.enumValues)[number];
export type DepartureStatus = (typeof departureStatus.enumValues)[number];
export type AuditAction = string;

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  login: varchar('login', { length: 64 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: cmsRole('role').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  canPublishTours: boolean('can_publish_tours').notNull().default(false),
  canPublishSchedule: boolean('can_publish_schedule').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('users_login_ci_uq').on(sql`lower(${table.login})`)]);

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorUserId: uuid('actor_user_id').references(() => users.id),
  action: varchar('action', { length: 80 }).notNull(),
  entityType: varchar('entity_type', { length: 80 }).notNull(),
  entityId: varchar('entity_id', { length: 128 }),
  payload: jsonb('payload').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tourDepartures = pgTable('tour_departures', {
  id: uuid('id').defaultRandom().primaryKey(),
  tourId: varchar('tour_id').notNull(),
  startsOn: date('starts_on').notNull(),
  seats: integer('seats').notNull(),
  status: departureStatus('status').notNull().default('open'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  version: integer('version').notNull().default(1),
  submittedForPublishAt: timestamp('submitted_for_publish_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  publishedStartsOn: date('published_starts_on'),
  publishedSeats: integer('published_seats'),
  publishedStatus: departureStatus('published_status'),
}, (table) => [
  check('tour_departures_seats_positive', sql`${table.seats} > 0`),
  uniqueIndex('tour_departures_active_tour_starts_on_uq')
    .on(table.tourId, table.startsOn)
    .where(sql`${table.status} <> 'cancelled'`),
]);
