import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { collectTelegramCsrShellRoutePaths, runTelegramSpaShells } from './runTelegramSpaShells.ts';

const templateHtml = `<!doctype html>
<html><head><title>Site</title></head>
<body><div id="root"></div><script src="https://telegram.org/js/telegram-web-app.js"></script></body></html>`;

describe('runTelegramSpaShells', () => {
  let distDir = '';

  afterEach(async () => {
    if (distDir) {
      await rm(distDir, { recursive: true, force: true });
      distDir = '';
    }
  });

  it('writes empty CSR shells for /telegram without home SSG body', async () => {
    distDir = await mkdtemp(join(tmpdir(), 'vkraynosti-telegram-shell-'));
    await runTelegramSpaShells(distDir, templateHtml, '{"events":[]}');

    const html = await readFile(join(distDir, 'telegram', 'index.html'), 'utf8');
    expect(html).toContain('<div id="root"></div>');
    expect(html).not.toContain('<main>');
    expect(html).toContain('noindex,nofollow');
    expect(html).toContain('https://vkraynosti.ru/telegram');
    expect(html).toContain('telegram-web-app.js');
  });

  it('includes tour and request paths for published tours', async () => {
    const routes = await collectTelegramCsrShellRoutePaths();
    expect(routes).toContain('/telegram');
    expect(routes.some(path => path.startsWith('/telegram/tour/'))).toBe(true);
    expect(routes.some(path => path.endsWith('/request'))).toBe(true);
  });
});
