import type { Sql } from 'postgres';

export type PublicReleaseCoordinator = {
  runExclusive<T>(operation: () => Promise<T>): Promise<T>;
};

const ADVISORY_LOCK_NAMESPACE = 784_221_107;
const ADVISORY_LOCK_ID = 20_261_111;

/** Process-local coordinator for tests and single-process development. */
export function createInMemoryPublicReleaseCoordinator(): PublicReleaseCoordinator {
  let tail: Promise<void> = Promise.resolve();

  return {
    async runExclusive<T>(operation: () => Promise<T>): Promise<T> {
      const previous = tail;
      let release!: () => void;
      tail = new Promise<void>((resolve) => { release = resolve; });
      await previous;
      try {
        return await operation();
      } finally {
        release();
      }
    },
  };
}

/**
 * A transaction-scoped PostgreSQL advisory lock coordinates all CMS API
 * instances that share the CMS database. The transaction stays open for the
 * complete publish/export operation while S3 object writes run on their own
 * client, so max-one CMS query pools do not deadlock.
 */
export function createPostgresPublicReleaseCoordinator(
  lockClient: Pick<Sql, 'begin'>,
): PublicReleaseCoordinator {
  return {
    runExclusive<T>(operation: () => Promise<T>): Promise<T> {
      return lockClient.begin(async (transaction) => {
        await transaction`SET LOCAL lock_timeout = '45s'`;
        await transaction`SELECT pg_advisory_xact_lock(${ADVISORY_LOCK_NAMESPACE}, ${ADVISORY_LOCK_ID})`;
        return operation();
      });
    },
  };
}

const PUBLISHED_WRITE_PATHS = new Set([
  '/api/cms/publish-queue/publish',
  '/api/cms/departures/publish',
]);

/** Endpoints whose work must not overlap with a release export. */
export function isPublicReleaseConsistencyRequest(method: string, path: string): boolean {
  const normalizedMethod = method.toUpperCase();
  if (normalizedMethod === 'GET') {
    return path === '/api/cms/internal/bake' || path === '/api/cms/seo-release/status';
  }
  if (normalizedMethod !== 'POST') return false;
  return PUBLISHED_WRITE_PATHS.has(path) || /^\/api\/cms\/tours\/[^/]+\/publish$/.test(path);
}
