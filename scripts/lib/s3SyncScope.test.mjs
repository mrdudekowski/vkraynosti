import { describe, expect, it } from 'vitest';
import {
  S3_SYNC_EXCLUDE_PATTERNS,
  buildAwsS3SyncArgs,
  buildPublicObjectUrl,
  buildS3SyncTarget,
  publicPathToObjectKey,
} from './s3SyncScope.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const publicDir = path.join(repoRoot, 'public');

describe('s3SyncScope', () => {
  it('excludes fonts from sync patterns', () => {
    expect(S3_SYNC_EXCLUDE_PATTERNS).toContain('fonts/*');
  });

  it('maps public path to object key', () => {
    expect(publicPathToObjectKey('public/tours/fall-1/cover.webp')).toBe(
      'tours/fall-1/cover.webp'
    );
  });

  it('rejects fonts paths', () => {
    expect(publicPathToObjectKey('public/fonts/nord_bold.ttf')).toBeNull();
  });

  it('builds public URL with trailing slash on base', () => {
    expect(
      buildPublicObjectUrl('https://cdn.example.com/', 'tours/fall-1/cover.webp')
    ).toBe('https://cdn.example.com/tours/fall-1/cover.webp');
  });

  it('builds s3 target with optional prefix', () => {
    expect(buildS3SyncTarget('my-bucket', '')).toBe('s3://my-bucket/');
    expect(buildS3SyncTarget('my-bucket', 'vkraynosti')).toBe('s3://my-bucket/vkraynosti/');
  });

  it('includes fonts exclude and cache-control in aws args', () => {
    const args = buildAwsS3SyncArgs({
      dryRun: true,
      deleteRemote: false,
      bucket: 'b',
      endpointUrl: 'https://s3.example.com',
      prefix: '',
      publicDir,
    });
    expect(args).toContain('sync');
    expect(args).toContain('--dryrun');
    expect(args).toContain('--exclude');
    expect(args).toContain('fonts/*');
    expect(args).toContain('--cache-control');
    expect(args).toContain('--endpoint-url');
    expect(args).toContain('https://s3.example.com');
  });
});
