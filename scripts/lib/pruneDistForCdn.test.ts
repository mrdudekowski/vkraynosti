import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  CDN_DIST_RELATIVE_DIRS,
  pruneDistForCdn,
  shouldPruneDistForCdn,
} from './pruneDistForCdn';

describe('shouldPruneDistForCdn', () => {
  it('returns false without VITE_PUBLIC_ASSET_BASE_URL', () => {
    expect(shouldPruneDistForCdn({})).toBe(false);
    expect(shouldPruneDistForCdn({ VITE_PUBLIC_ASSET_BASE_URL: '  ' })).toBe(false);
  });

  it('returns true when CDN base URL is set', () => {
    expect(
      shouldPruneDistForCdn({ VITE_PUBLIC_ASSET_BASE_URL: 'https://cdn.example.com/' }),
    ).toBe(true);
  });
});

describe('pruneDistForCdn', () => {
  let tempRoot: string | undefined;

  afterEach(() => {
    if (tempRoot) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
      tempRoot = undefined;
    }
  });

  it('skips all dirs when CDN env is unset', () => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vk-prune-'));
    const distDir = path.join(tempRoot, 'dist');
    fs.mkdirSync(path.join(distDir, 'tours'), { recursive: true });

    const result = pruneDistForCdn(distDir, { env: {} });
    expect(result.pruned).toEqual([]);
    expect(result.skipped).toEqual([...CDN_DIST_RELATIVE_DIRS]);
    expect(fs.existsSync(path.join(distDir, 'tours'))).toBe(true);
  });

  it('removes CDN mirror folders when CDN env is set', () => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vk-prune-'));
    const distDir = path.join(tempRoot, 'dist');
    for (const dir of CDN_DIST_RELATIVE_DIRS) {
      fs.mkdirSync(path.join(distDir, dir), { recursive: true });
    }
    fs.mkdirSync(path.join(distDir, 'fonts'), { recursive: true });

    const result = pruneDistForCdn(distDir, {
      env: { VITE_PUBLIC_ASSET_BASE_URL: 'https://cdn.example.com/' },
    });

    expect(result.pruned).toEqual([...CDN_DIST_RELATIVE_DIRS]);
    expect(fs.existsSync(path.join(distDir, 'fonts'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'tours'))).toBe(false);
  });
});
