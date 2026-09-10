/**
 * Windows `subst` (D: → E:) makes Vite serve test files from the native drive.
 * Starting Vitest on that path keeps one module graph so jest-dom matchers attach.
 */
import { spawn } from 'node:child_process';
import { realpathSync } from 'node:fs';
import path from 'node:path';

const root = realpathSync.native(process.cwd());
const vitest = path.join(root, 'node_modules/vitest/vitest.mjs');
const child = spawn(process.execPath, [vitest, ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});
child.on('exit', (code, signal) => {
  if (signal != null) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
