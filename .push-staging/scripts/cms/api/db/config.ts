export type DatabaseConfig = { url: string; ssl: boolean; maxConnections: number };

export function loadDatabaseConfig(env: Record<string, string | undefined>): DatabaseConfig {
  const url = env.DATABASE_URL?.trim();
  if (!url) throw new Error('DATABASE_URL is required');
  const parsedMax = Number.parseInt(env.DATABASE_MAX_CONNECTIONS ?? '10', 10);
  if (!Number.isInteger(parsedMax) || parsedMax < 1 || parsedMax > 50) {
    throw new Error('DATABASE_MAX_CONNECTIONS must be between 1 and 50');
  }
  return { url, ssl: env.DATABASE_SSL === 'true', maxConnections: parsedMax };
}
