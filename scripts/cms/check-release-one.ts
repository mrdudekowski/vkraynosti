import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { CMS_E2E_RELEASE_ONE } from './e2e-release-one-config.ts';

const databaseUrl =
  process.env.DATABASE_URL ?? process.env.TEST_DATABASE_URL ?? CMS_E2E_RELEASE_ONE.databaseUrl;
const parsed = new URL(databaseUrl);
if (!['127.0.0.1', 'localhost'].includes(parsed.hostname)) {
  throw new Error('check:cms-release-one requires a local DATABASE_URL');
}

const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL ?? databaseUrl,
};

function run(label: string, args: string[]): void {
  console.info(`\n== ${label} ==`);
  const result = spawnSync('npm', args, {
    stdio: 'inherit',
    shell: true,
    env,
    cwd: process.cwd(),
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('db:check', ['run', 'db:check']);
run('typecheck', ['run', 'typecheck']);
run('lint', ['run', 'lint']);
run('test', ['run', 'test']);
run('build', ['run', 'build']);
run('e2e', ['run', 'test:e2e:cms-release-one']);
