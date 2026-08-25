import { spawn } from 'node:child_process';

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgres://vkrainosti:local-vkrainosti-only@127.0.0.1:54327/vkrainosti';

const child = spawn(
  process.execPath,
  ['scripts/run-vitest.mjs', 'run', '--config', 'vitest.cms-api.config.ts'],
  {
    stdio: 'inherit',
    env: { ...process.env, TEST_DATABASE_URL: testDatabaseUrl },
  },
);

child.on('exit', (code) => process.exit(code ?? 1));
