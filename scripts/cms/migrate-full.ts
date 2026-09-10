import { readDotEnvFile } from './api/env.ts';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const rootDir = process.cwd();
const DEFAULT_SCHEDULE_SOURCE = 'https://4unja6slv5.cdn.twcstorage.ru/';

function runStep(title: string, command: string, env: Record<string, string> = {}): void {
  console.info(`\n=== ${title} ===`);
  const result = spawnSync(command, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    throw new Error(`${title} failed`);
  }
}

async function main(): Promise<void> {
  const cmsEnv = await readDotEnvFile(path.join(rootDir, '.env.cms-dev'));
  const localEnv = await readDotEnvFile(path.join(rootDir, '.env.local'));

  const scheduleSource =
    localEnv.VITE_PUBLIC_S3_BASE_URL ??
    process.env.VITE_PUBLIC_S3_BASE_URL ??
    cmsEnv.CMS_SCHEDULE_SOURCE_BASE ??
    cmsEnv.CMS_MEDIA_SOURCE_BASE ??
    DEFAULT_SCHEDULE_SOURCE;

  runStep('export full catalog', 'npm run cms:export:full');
  runStep('upload catalog + media', 'npm run cms:upload-catalog');
  runStep('sync schedule overlay', 'npm run cms:sync-schedule-dev', {
    VITE_PUBLIC_S3_BASE_URL: scheduleSource.replace(/\/+$/, ''),
  });

  console.info('\nFull CMS migration finished.');
  console.info('Next: set VITE_CMS_S3_BASE_URL in .env.local to your cms-dev bucket for local overlay tests.');
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
