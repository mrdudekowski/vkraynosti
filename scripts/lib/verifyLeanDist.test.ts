import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { verifyLeanDistTours } from './verifyLeanDist.mjs';

describe('verifyLeanDistTours', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    tempDir = '';
  });

  it('passes when dist/tours is missing', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-dist-'));
    expect(verifyLeanDistTours(tempDir).ok).toBe(true);
  });

  it('passes when dist/tours contains only prerender index.html files', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-dist-'));
    const routeDir = path.join(tempDir, 'tours', 'summer', 'summer-1');
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'index.html'), '<html></html>', 'utf8');
    expect(verifyLeanDistTours(tempDir).ok).toBe(true);
  });

  it('fails when dist/tours contains media files', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-dist-'));
    const routeDir = path.join(tempDir, 'tours', 'summer-1');
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'first.webp'), '', 'utf8');
    const result = verifyLeanDistTours(tempDir);
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.replace(/\\/g, '/').endsWith('tours/summer-1/first.webp'))).toBe(
      true,
    );
  });

  it('passes when dist/tours contains allowlisted OG shell assets', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-dist-'));
    const routeDir = path.join(tempDir, 'tours', 'summer', 'summer-10');
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'index.html'), '<html></html>', 'utf8');
    fs.writeFileSync(path.join(routeDir, 'cover.webp'), '', 'utf8');
    fs.writeFileSync(
      path.join(tempDir, '.og-shell-assets.json'),
      JSON.stringify({ allowedRelativePaths: ['tours/summer/summer-10/cover.webp'] }),
      'utf8',
    );
    expect(verifyLeanDistTours(tempDir).ok).toBe(true);
  });
});
