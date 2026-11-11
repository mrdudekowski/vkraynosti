import { describe, expect, it, vi } from 'vitest';
import type { Sql } from 'postgres';
import {
  createInMemoryPublicReleaseCoordinator,
  createPostgresPublicReleaseCoordinator,
  isPublicReleaseConsistencyRequest,
} from './publicReleaseCoordinator.ts';

describe('public release consistency coordinator', () => {
  it('does not let bake read between the writes of one publication', async () => {
    const coordinator = createInMemoryPublicReleaseCoordinator();
    let finishPublication!: () => void;
    let publicationStarted!: () => void;
    const started = new Promise<void>((resolve) => { publicationStarted = resolve; });
    const releasePublication = new Promise<void>((resolve) => { finishPublication = resolve; });
    const publishedKeys: string[] = [];

    const publication = coordinator.runExclusive(async () => {
      publishedKeys.push('tour-catalog:new');
      publicationStarted();
      await releasePublication;
      publishedKeys.push('schedule:new');
    });
    await started;

    let bakeStarted = false;
    const bake = coordinator.runExclusive(async () => {
      bakeStarted = true;
      return [...publishedKeys];
    });
    await Promise.resolve();
    expect(bakeStarted).toBe(false);

    finishPublication();
    await publication;
    await expect(bake).resolves.toEqual(['tour-catalog:new', 'schedule:new']);
  });

  it('holds the distributed PostgreSQL advisory lock until the operation completes', async () => {
    const statements: string[] = [];
    const transactionClient = {
      async begin<T>(run: (sql: (...args: unknown[]) => Promise<unknown>) => Promise<T>) {
        const sql = async (parts: TemplateStringsArray) => {
          statements.push(parts.join('?').trim());
          return [];
        };
        return run(sql);
      },
    } as unknown as Sql;
    const coordinator = createPostgresPublicReleaseCoordinator(transactionClient);
    const operation = vi.fn(async () => 'release');

    await expect(coordinator.runExclusive(operation)).resolves.toBe('release');
    expect(statements.some((statement) => statement.includes('pg_advisory_xact_lock'))).toBe(true);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['GET', '/api/cms/internal/bake'],
    ['POST', '/api/cms/publish-queue/publish'],
    ['POST', '/api/cms/departures/publish'],
    ['POST', '/api/cms/tours/fall-1/publish'],
  ])('coordinates %s %s', (method, path) => {
    expect(isPublicReleaseConsistencyRequest(method, path)).toBe(true);
  });

  it('does not serialize draft-only changes', () => {
    expect(isPublicReleaseConsistencyRequest('PUT', '/api/cms/tours/fall-1')).toBe(false);
    expect(isPublicReleaseConsistencyRequest('POST', '/api/cms/tours/fall-1/assets')).toBe(false);
  });
});
