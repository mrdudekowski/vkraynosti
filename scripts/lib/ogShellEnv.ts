import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const eq = line.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function loadEnvFiles(cwd: string): void {
  const mode = process.env.NODE_ENV ?? 'production';
  const files = ['.env', `.env.${mode}`, '.env.local', `.env.${mode}.local`];
  for (const file of files) {
    const filePath = resolve(cwd, file);
    if (!existsSync(filePath)) {
      continue;
    }
    const parsed = parseEnvFile(readFileSync(filePath, 'utf8'));
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined || process.env[key] === '') {
        process.env[key] = value;
      }
    }
  }
}

function buildImportMetaEnv(): Record<string, string> {
  const mode = process.env.NODE_ENV ?? 'production';
  const appBasePath = process.env.VITE_BASE_PATH?.trim() || '/vkraynosti/';
  const baseUrl = appBasePath.endsWith('/') ? appBasePath : `${appBasePath}/`;

  const env: Record<string, string> = {
    BASE_URL: baseUrl,
    MODE: mode,
    DEV: mode === 'development' ? 'true' : '',
    PROD: mode === 'production' ? 'true' : '',
    SSR: 'true',
  };

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('VITE_') && typeof value === 'string') {
      env[key] = value;
    }
  }

  return env;
}

function assignImportMetaEnv(envRecord: Record<string, string>): void {
  const meta = import.meta as ImportMeta & { env?: Record<string, string> };
  if (meta.env == null) {
    Object.defineProperty(import.meta, 'env', {
      value: { ...envRecord },
      writable: true,
      configurable: true,
      enumerable: true,
    });
    return;
  }
  Object.assign(meta.env, envRecord);
}

/** Merge `.env*` into process.env and polyfill `import.meta.env` for Node scripts. */
export function setupOgShellBuildEnv(): void {
  loadEnvFiles(process.cwd());
  assignImportMetaEnv(buildImportMetaEnv());
}
